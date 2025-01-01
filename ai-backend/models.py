from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class Bot(BaseModel):
    name: str
    bio: str
    personality: str
    starting_dialogue: str

class ChatMessage(BaseModel):
    content: str
    expression: Optional[str] = None
    role: str

class ChatRequest(BaseModel):
    bot_name: str
    user_id: str
    message: str

class ChatResponse(BaseModel):
    response: ChatMessage 

class ChatHistoryResponse(BaseModel):
    user_id: str
    bot_name: str
    messages: List[Dict]
    timestamp: datetime 