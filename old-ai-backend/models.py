from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class Bot(BaseModel):
    name: str
    bio: str
    personality: str
    starting_dialogue: str
    ticker_symbol: Optional[str] = None
    contract_address: Optional[str] = None
    ticker: Optional[str] = None
    creator: str  # wallet address
    image: Optional[bytes] = None
    twitter: Optional[str] = None

class User(BaseModel):
    username: str
    wallet_address: str
    network: str
    favourite_agents: List[str] = []

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