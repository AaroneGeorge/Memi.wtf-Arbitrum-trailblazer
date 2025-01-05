from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import chromadb
from chromadb.utils import embedding_functions
import os
from models import Bot, ChatRequest, ChatResponse, ChatMessage, ChatHistoryResponse, User
from chat_handler import generate_bot_response
from typing import List, Dict
from fastapi.responses import JSONResponse
from datetime import datetime
import json
from base64 import b64decode

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def ensure_database_exists():
    """Ensures database and all required tables exist"""
    try:
        conn = sqlite3.connect("databases/master/master.db")
        cursor = conn.cursor()
        
        # Check if tables exist by querying sqlite_master
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND (name='users' OR name='bots' OR name='chat_history')
        """)
        existing_tables = [row[0] for row in cursor.fetchall()]
        
        # Create tables that don't exist
        if 'bots' not in existing_tables:
            cursor.execute("""
                CREATE TABLE bots (
                    name TEXT PRIMARY KEY,
                    bio TEXT NOT NULL,
                    personality TEXT NOT NULL,
                    starting_dialogue TEXT NOT NULL,
                    ticker_symbol TEXT,
                    contract_address TEXT,
                    ticker TEXT,
                    creator TEXT NOT NULL,
                    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    image BLOB,
                    twitter TEXT
                )
            """)
        else:
            # Check if twitter column exists in bots table
            cursor.execute("PRAGMA table_info(bots)")
            columns = [column[1] for column in cursor.fetchall()]
            
            # Add twitter column if it doesn't exist
            if 'twitter' not in columns:
                cursor.execute("ALTER TABLE bots ADD COLUMN twitter TEXT")
                print("Added twitter column to bots table")
        
        if 'users' not in existing_tables:
            cursor.execute("""
                CREATE TABLE users (
                    wallet_address TEXT PRIMARY KEY,
                    username TEXT NOT NULL,
                    network TEXT NOT NULL,
                    favourite_agents TEXT DEFAULT '[]',
                    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
        
        if 'chat_history' not in existing_tables:
            cursor.execute("""
                CREATE TABLE chat_history (
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
        return True
    except Exception as e:
        print(f"Error ensuring database exists: {str(e)}")
        return False

@app.on_event("startup")
async def startup_event():
    os.makedirs("databases/master", exist_ok=True)
    ensure_database_exists()

@app.get("/health")
async def check_health():
    return {"status": "healthy"}

@app.post("/bots/create")
async def create_bot(bot: Bot):
    try:
        conn = sqlite3.connect("databases/master/master.db")
        cursor = conn.cursor()
        
        # Convert image from base64 to blob if present
        image_blob = b64decode(bot.image) if bot.image else None
        
        cursor.execute(
            """
            INSERT INTO bots (
                name, bio, personality, starting_dialogue, 
                ticker_symbol, contract_address, ticker, creator, 
                image, twitter
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                bot.name, bot.bio, bot.personality, bot.starting_dialogue,
                bot.ticker_symbol, bot.contract_address, bot.ticker, 
                bot.creator, image_blob, bot.twitter
            )
        )
        
        conn.commit()
        conn.close()
        
        return {"message": f"Bot {bot.name} created successfully"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Bot with this name already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/users")
async def create_user(user: User):
    try:
        ensure_database_exists()  # Ensure database exists before operation
        conn = sqlite3.connect("databases/master/master.db")
        cursor = conn.cursor()
        
        cursor.execute(
            """
            INSERT INTO users (wallet_address, username, network, favourite_agents)
            VALUES (?, ?, ?, ?)
            """,
            (
                user.wallet_address, 
                user.username, 
                user.network,
                json.dumps(user.favourite_agents)
            )
        )
        
        conn.commit()
        conn.close()
        
        return {"message": f"User {user.username} created successfully"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="User with this wallet address already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/{wallet_address}")
async def get_user(wallet_address: str):
    try:
        ensure_database_exists()  # Ensure database exists before operation
        conn = sqlite3.connect("databases/master/master.db")
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT * FROM users WHERE wallet_address = ?",
            (wallet_address,)
        )
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user's created bots
        cursor.execute(
            "SELECT name FROM bots WHERE creator = ?",
            (wallet_address,)
        )
        created_bots = [row[0] for row in cursor.fetchall()]
        
        # Get user's chat history summary
        cursor.execute(
            """
            SELECT bot_name, COUNT(*) as message_count
            FROM chat_history
            WHERE user_id = ?
            GROUP BY bot_name
            """,
            (wallet_address,)
        )
        chat_summary = {row[0]: row[1] for row in cursor.fetchall()}
        
        conn.close()
        
        return {
            "wallet_address": user[0],
            "username": user[1],
            "network": user[2],
            "favourite_agents": json.loads(user[3]),
            "created_date": user[4],
            "created_bots": created_bots,
            "chat_summary": chat_summary
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/bots")
async def get_all_bots():
    try:
        conn = sqlite3.connect("databases/master/master.db")
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                name, bio, personality, starting_dialogue,
                ticker_symbol, contract_address, ticker,
                creator, created_date, image, twitter
            FROM bots
        """)
        
        bots = [{
            "name": row[0],
            "bio": row[1],
            "personality": row[2],
            "starting_dialogue": row[3],
            "ticker_symbol": row[4],
            "contract_address": row[5],
            "ticker": row[6],
            "creator": row[7],
            "created_date": row[8],
            "image": row[9].hex() if row[9] else None,  # Convert BLOB to hex string
            "twitter": row[10]
        } for row in cursor.fetchall()]
        
        conn.close()
        
        return {"bots": bots}
        
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
        
        cursor.execute("SELECT COUNT(*) FROM users")
        users_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM chat_history")
        messages_count = cursor.fetchone()[0]
        
        # Delete all data from all tables
        cursor.execute("DELETE FROM chat_history")
        cursor.execute("DELETE FROM bots")
        cursor.execute("DELETE FROM users")
        
        # Reset auto-increment counters
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='chat_history'")
        
        conn.commit()
        conn.close()
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Database cleared successfully",
                "deleted_counts": {
                    "bots": bots_count,
                    "users": users_count,
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
        
        # Get all bots with complete details
        cursor.execute("""
            SELECT 
                name, bio, personality, starting_dialogue,
                ticker_symbol, contract_address, ticker,
                creator, created_date, image, twitter
            FROM bots
        """)
        bots = [{
            "name": row[0],
            "bio": row[1],
            "personality": row[2],
            "starting_dialogue": row[3],
            "ticker_symbol": row[4],
            "contract_address": row[5],
            "ticker": row[6],
            "creator": row[7],
            "created_date": row[8],
            "image": row[9].hex() if row[9] else None,
            "twitter": row[10]
        } for row in cursor.fetchall()]
        
        # Get all users with complete details
        cursor.execute("SELECT * FROM users")
        users = [{
            "wallet_address": row[0],
            "username": row[1],
            "network": row[2],
            "favourite_agents": json.loads(row[3]),
            "created_date": row[4]
        } for row in cursor.fetchall()]
        
        # Get detailed chat statistics
        cursor.execute("""
            SELECT 
                bot_name,
                user_id,
                COUNT(*) as message_count,
                MIN(timestamp) as first_message,
                MAX(timestamp) as last_message,
                COUNT(CASE WHEN role = 'user' THEN 1 END) as user_messages,
                COUNT(CASE WHEN role = 'assistant' THEN 1 END) as bot_messages
            FROM chat_history
            GROUP BY bot_name, user_id
        """)
        
        chat_stats = [{
            "bot_name": row[0],
            "user_id": row[1],
            "message_count": row[2],
            "first_message": row[3],
            "last_message": row[4],
            "user_messages": row[5],
            "bot_messages": row[6]
        } for row in cursor.fetchall()]
        
        # Get overall statistics
        cursor.execute("SELECT COUNT(*) FROM chat_history")
        total_messages = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM chat_history WHERE role = 'user'")
        total_user_messages = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM chat_history WHERE role = 'assistant'")
        total_bot_messages = cursor.fetchone()[0]
        
        # Get most active bots and users
        cursor.execute("""
            SELECT bot_name, COUNT(*) as usage_count
            FROM chat_history
            GROUP BY bot_name
            ORDER BY usage_count DESC
            LIMIT 5
        """)
        most_active_bots = [{
            "bot_name": row[0],
            "message_count": row[1]
        } for row in cursor.fetchall()]
        
        cursor.execute("""
            SELECT user_id, COUNT(*) as usage_count
            FROM chat_history
            GROUP BY user_id
            ORDER BY usage_count DESC
            LIMIT 5
        """)
        most_active_users = [{
            "user_id": row[0],
            "message_count": row[1]
        } for row in cursor.fetchall()]
        
        conn.close()
        
        return JSONResponse(
            status_code=200,
            content={
                "database_summary": {
                    "total_bots": len(bots),
                    "total_users": len(users),
                    "total_messages": total_messages,
                    "total_user_messages": total_user_messages,
                    "total_bot_messages": total_bot_messages,
                    "active_conversations": len(chat_stats)
                },
                "bots": bots,
                "users": users,
                "chat_statistics": chat_stats,
                "most_active": {
                    "bots": most_active_bots,
                    "users": most_active_users
                },
                "timestamp": datetime.now().isoformat()
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
