import chromadb
from chromadb.utils import embedding_functions
import sqlite3

import requests
import os
from dotenv import load_dotenv

def chat_prompt(chat, pipeline_name):
    # Pass pipeline_name to fetch_similar_entries
    similar_entries = fetch_similar_entries(chat, pipeline_name)
    
    if pipeline_name == "chat":
        prompt = """
        You are an AI designed to help users to buy meme coins and give explanation to meme coins. 
        Given below is the User query:
        {chat}

        Here are a few similar questions that might help you in answering the users questions: {similar_entries}

        NOTE: 
        1. only give the response and nothing else
        2. give the answers in maximum 2 or 3 sentences
        """.format(chat=chat, similar_entries=similar_entries) 
    elif pipeline_name == "function":
        prompt = """
        Given below is the User query:
        {chat}

        Here are a few similar questions that might help you in answering the users questions: {similar_entries}

        NOTE: 
        1. only give the response and nothing else
        """.format(chat=chat, similar_entries=similar_entries) 
    
    return prompt

def entrypoint(chat, pipeline_name):
    prompt = chat_prompt(chat, pipeline_name)                
    endpoint = 'https://api.together.xyz/inference'

    load_dotenv()

    response = requests.post(
        url=endpoint,
        headers={
            "Authorization": f"Bearer {os.getenv('TOGETHER_AI_KEY')}",
            "Content-Type": "application/json"
        },                
        json={
            "model": "meta-llama/Llama-3-70b-chat-hf",
            "max_tokens": 6000,
            "temperature": 0.2,
            "messages": [
                {
                    "content": prompt,
                    "role": "user"
                }
            ]
        },
    )

    if response.status_code == 200:
        content = response.json()
        return content["output"]["choices"][0]["text"]
    else:
        raise Exception(f"Request failed with status code {response.status_code}")
    

def fetch_similar_entries(query, pipeline_name):
    def init_vdb_items(pipeline_name):
        db_path = f"./databases/{pipeline_name}_vdb"
        client = chromadb.PersistentClient(path=db_path)
        embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="BAAI/bge-large-en-v1.5")
        collection_name = f"{pipeline_name}_vdb"
        collection = client.get_or_create_collection(
            name=collection_name,
            embedding_function=embedding_func,
            metadata={"hnsw:space": "cosine"}
        )
        return client, embedding_func, collection

    def query_vdb(question, collection):
        fetched_doc = collection.query(
            query_texts=question,
            n_results=3
        )

        os.makedirs("databases/master", exist_ok=True)
        conn = sqlite3.connect("databases/master/master.db")
        cursor = conn.cursor()
        result = []

        for pair_id in fetched_doc["ids"][0]:
            cursor.execute("SELECT question, answer FROM question_answer_pairs WHERE id = ?", (pair_id,))
            row = cursor.fetchone()
            if row:  # Add check for row existence
                result.append({"question": row[0], "answer": row[1]})

        conn.close()
        return result

    _, _, collection = init_vdb_items(pipeline_name)
    return query_vdb(query, collection)
