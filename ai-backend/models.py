from pydantic import BaseModel
from typing import Optional, List

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