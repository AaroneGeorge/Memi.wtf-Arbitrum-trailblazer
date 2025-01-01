from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import chromadb
from chromadb.utils import embedding_functions
import os
from models import Bot, ChatRequest, ChatResponse, ChatMessage
from chat_handler import generate_bot_response

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
