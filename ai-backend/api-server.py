from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import chromadb
from chromadb.utils import embedding_functions
import os
from models import Bot, ChatRequest, ChatResponse, ChatMessage, ChatHistoryResponse
from chat_handler import generate_bot_response
from typing import List, Dict
from fastapi.responses import JSONResponse
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_databases():
    # Create SQLite database
    conn = sqlite3.connect("databases/master/master.db")
    cursor = conn.cursor()
    
    # Create bots table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bots (
            name TEXT PRIMARY KEY,
            bio TEXT NOT NULL,
            personality TEXT NOT NULL,
            starting_dialogue TEXT NOT NULL
        )
    """)
    
    # Create chat_history table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            bot_name TEXT NOT NULL,
            message TEXT NOT NULL,
            role TEXT NOT NULL,
            expression TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    conn.close()

@app.on_event("startup")
async def startup_event():
    os.makedirs("databases/master", exist_ok=True)
    init_databases()

@app.get("/health")
async def check_health():
    return {"status": "healthy"}

@app.post("/bots/create")
async def create_bot(bot: Bot):
    try:
        conn = sqlite3.connect("databases/master/master.db")
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO bots (name, bio, personality, starting_dialogue) VALUES (?, ?, ?, ?)",
            (bot.name, bot.bio, bot.personality, bot.starting_dialogue)
        )
        
        conn.commit()
        conn.close()
        
        return {"message": f"Bot {bot.name} created successfully"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Bot with this name already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/bots/{bot_name}/dialogue")
async def get_bot_dialogue(bot_name: str):
    conn = sqlite3.connect("databases/master/master.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT starting_dialogue FROM bots WHERE name = ?", (bot_name,))
    result = cursor.fetchone()
    
    conn.close()
    
    if not result:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    return {"starting_dialogue": result[0]}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Get bot details
        conn = sqlite3.connect("databases/master/master.db")
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT bio, personality FROM bots WHERE name = ?", 
            (request.bot_name,)
        )
        bot_details = cursor.fetchone()
        
        if not bot_details:
            raise HTTPException(status_code=404, detail="Bot not found")
            
        # Get chat history
        cursor.execute(
            """
            SELECT message, role, expression 
            FROM chat_history 
            WHERE user_id = ? AND bot_name = ?
            ORDER BY timestamp DESC LIMIT 10
            """,
            (request.user_id, request.bot_name)
        )
        
        history = cursor.fetchall()
        
        # Generate response
        response = generate_bot_response(
            user_message=request.message,
            bot_name=request.bot_name,
            bot_bio=bot_details[0],
            bot_personality=bot_details[1],
            chat_history=history
        )
        
        # Store the conversation
        cursor.execute(
            """
            INSERT INTO chat_history (user_id, bot_name, message, role, expression)
            VALUES (?, ?, ?, ?, ?)
            """,
            (request.user_id, request.bot_name, request.message, "user", None)
        )
        
        cursor.execute(
            """
            INSERT INTO chat_history (user_id, bot_name, message, role, expression)
            VALUES (?, ?, ?, ?, ?)
            """,
            (request.user_id, request.bot_name, response.content, "assistant", response.expression)
        )
        
        conn.commit()
        conn.close()
        
        return ChatResponse(response=response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chats/{user_id}/{bot_name}", response_model=ChatHistoryResponse)
async def get_chat_history(user_id: str, bot_name: str):
    try:
        conn = sqlite3.connect("databases/master/master.db")
        cursor = conn.cursor()
        
        # First verify if bot exists
        cursor.execute("SELECT name FROM bots WHERE name = ?", (bot_name,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Bot not found")
        
        # Get all messages for this user-bot pair
        cursor.execute("""
            SELECT message, role, expression, timestamp 
            FROM chat_history 
            WHERE user_id = ? AND bot_name = ?
            ORDER BY timestamp ASC
        """, (user_id, bot_name))
        
        messages = [{
            "message": row[0],
            "role": row[1],
            "expression": row[2],
            "timestamp": row[3]
        } for row in cursor.fetchall()]
        
        conn.close()
        
        if not messages:
            return JSONResponse(
                status_code=200,
                content={"message": "No chat history found", "messages": []}
            )
        
        return ChatHistoryResponse(
            user_id=user_id,
            bot_name=bot_name,
            messages=messages,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/chats/{user_id}/{bot_name}")
async def delete_chat_history(user_id: str, bot_name: str):
    try:
        conn = sqlite3.connect("databases/master/master.db")
        cursor = conn.cursor()
        
        # First verify if bot exists
        cursor.execute("SELECT name FROM bots WHERE name = ?", (bot_name,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Bot not found")
        
        # Get count of messages to be deleted
        cursor.execute("""
            SELECT COUNT(*) FROM chat_history 
            WHERE user_id = ? AND bot_name = ?
        """, (user_id, bot_name))
        
        count = cursor.fetchone()[0]
        
        # Delete all messages for this user-bot pair
        cursor.execute("""
            DELETE FROM chat_history 
            WHERE user_id = ? AND bot_name = ?
        """, (user_id, bot_name))
        
        conn.commit()
        conn.close()
        
        return JSONResponse(
            status_code=200,
            content={
                "message": f"Successfully deleted {count} messages",
                "deleted_count": count
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/db/clear")
async def clear_database(admin_key: str):
    """Clear entire database. Requires admin key for security."""
    try:
        # Check admin key (you should store this securely in environment variables)
        if admin_key != os.getenv('ADMIN_KEY', 'your-secure-admin-key'):
            raise HTTPException(
                status_code=403,
                detail="Invalid admin key"
            )
        
        conn = sqlite3.connect("databases/master/master.db")
        cursor = conn.cursor()
        
        # Get counts before deletion
        cursor.execute("SELECT COUNT(*) FROM bots")
        bots_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM chat_history")
        messages_count = cursor.fetchone()[0]
        
        # Delete all data
        cursor.execute("DELETE FROM chat_history")
        cursor.execute("DELETE FROM bots")
        
        conn.commit()
        conn.close()
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Database cleared successfully",
                "deleted_counts": {
                    "bots": bots_count,
                    "messages": messages_count
                }
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/db/status")
async def get_database_status(admin_key: str):
    """Get all database contents and statistics. Requires admin key."""
    try:
        # Check admin key
        if admin_key != os.getenv('ADMIN_KEY', 'your-secure-admin-key'):
            raise HTTPException(
                status_code=403,
                detail="Invalid admin key"
            )
        
        conn = sqlite3.connect("databases/master/master.db")
        cursor = conn.cursor()
        
        # Get all bots
        cursor.execute("SELECT * FROM bots")
        bots = [{
            "name": row[0],
            "bio": row[1],
            "personality": row[2],
            "starting_dialogue": row[3]
        } for row in cursor.fetchall()]
        
        # Get chat statistics
        cursor.execute("""
            SELECT 
                bot_name,
                user_id,
                COUNT(*) as message_count,
                MIN(timestamp) as first_message,
                MAX(timestamp) as last_message
            FROM chat_history
            GROUP BY bot_name, user_id
        """)
        
        chat_stats = [{
            "bot_name": row[0],
            "user_id": row[1],
            "message_count": row[2],
            "first_message": row[3],
            "last_message": row[4]
        } for row in cursor.fetchall()]
        
        # Get total counts
        cursor.execute("SELECT COUNT(*) FROM chat_history")
        total_messages = cursor.fetchone()[0]
        
        conn.close()
        
        return JSONResponse(
            status_code=200,
            content={
                "bots": bots,
                "chat_statistics": chat_stats,
                "total_messages": total_messages,
                "total_bots": len(bots),
                "active_conversations": len(chat_stats)
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add this error handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": str(exc),
            "type": type(exc).__name__,
            "path": request.url.path
        }
    )
