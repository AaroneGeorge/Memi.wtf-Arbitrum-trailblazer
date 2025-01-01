import chromadb
from chromadb.utils import embedding_functions

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sqlite3
import uuid

from query_pipelines.default.entrypoint import entrypoint

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    user_query: str
    history: Optional[str] = None
    pipeline: Optional[str] = "default_pipeline"

class ChatResponse(BaseModel):
    response: str

class DatabaseEntry(BaseModel):
    question: str
    answer: str

@app.get("/health")
async def check_health():
    return {"response": "healthy"}

# ChatAPI endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        response = execute_pipeline(request.pipeline, request.user_query)
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def execute_pipeline(pipeline_name, user_query):
    
    if pipeline_name == "chat":
        return entrypoint(user_query, pipeline_name)
    elif pipeline_name == "function":
        return entrypoint(user_query, pipeline_name)
    else:
        raise ValueError(f"Invalid pipeline name: {pipeline_name}")

# Modify the add_database_entry function to handle pipeline-specific databases
@app.post("/db/add")
def add_database_entry(entry: DatabaseEntry, pipeline: Optional[str] = "default"):
    try:
        entry_id = add_to_master_db(entry.question, entry.answer)
        update_downstream_dbs(entry.question, entry.answer, entry_id, pipeline)
        return {"message": "Entry added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
def add_to_master_db(question, answer):
    conn = sqlite3.connect("databases/master/master.db")
    create_table_if_not_exists(conn)

    entry_id = str(uuid.uuid4())
    cursor = conn.cursor()
    cursor.execute("INSERT INTO question_answer_pairs (id, question, answer) VALUES (?, ?, ?)", (entry_id, question, answer))
    conn.commit()
    conn.close()

    return entry_id

def create_table_if_not_exists(conn):
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS question_answer_pairs (
            id TEXT PRIMARY KEY,
            question TEXT NOT NULL,
            answer TEXT NOT NULL
        )
    """)
    conn.commit()

def update_downstream_dbs(question, answer, entry_id, pipeline_name="default"):
    def init_vdb_items(pipeline_name):
        # Set database path based on pipeline
        db_path = f"./databases/{pipeline_name}_vdb"
        client = chromadb.PersistentClient(path=db_path)
        embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="BAAI/bge-large-en-v1.5")
        # Collection name follows the same pattern
        collection_name = f"{pipeline_name}_vdb"
        collection = client.get_or_create_collection(
            name=collection_name,
            embedding_function=embedding_func,
            metadata={"hnsw:space": "cosine"}
        )
        return client, embedding_func, collection

    def add_qn_vdb(question, entry_id, collection, embedding_func):
        embed_data = embedding_func([question])    
        ids_list = [entry_id]
        collection.add(
            embeddings=embed_data,
            ids=ids_list
        )

    # Initialize and add to the appropriate database
    client, embedding_func, collection = init_vdb_items(pipeline_name)
    add_qn_vdb(question, entry_id, collection, embedding_func)
