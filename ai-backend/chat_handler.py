import os
from dotenv import load_dotenv
import requests
from models import ChatMessage

load_dotenv()

def generate_bot_response(user_message: str, bot_name: str, bot_bio: str, bot_personality: str, chat_history: list) -> ChatMessage:
    # Format chat history
    formatted_history = "\n".join([
        f"{'User' if role == 'user' else bot_name}: {message}" + (f" `{expression}`" if expression else "")
        for message, role, expression in chat_history[::-1]  # Reverse to get chronological order
    ])
    
    prompt = f"""
    You are a chatbot with the following characteristics:
    Name: {bot_name}
    Bio: {bot_bio}
    Personality: {bot_personality}

    Previous conversation:
    {formatted_history}

    User: {user_message}

    Respond as {bot_name}, maintaining your personality traits. Include both dialogue and expression in your response.
    Format your response as: "dialogue" `expression`
    Example: "Yes, I'd love to!" `smiles shyly while twirling hair`
    """

    response = requests.post(
        url='https://api.together.xyz/inference',
        headers={
            "Authorization": f"Bearer {os.getenv('TOGETHER_AI_KEY')}",
            "Content-Type": "application/json"
        },
        json={
            "model": "meta-llama/Llama-3-70b-chat-hf",
            "max_tokens": 6000,
            "temperature": 0.7,
            "messages": [
                {
                    "content": prompt,
                    "role": "user"
                }
            ]
        },
    )

    if response.status_code != 200:
        raise Exception(f"API request failed with status {response.status_code}")

    # Parse the response
    bot_response = response.json()["output"]["choices"][0]["text"].strip()
    
    # Split into dialogue and expression
    dialogue_parts = bot_response.split("`")
    content = dialogue_parts[0].strip().strip('"')
    expression = dialogue_parts[1].strip() if len(dialogue_parts) > 1 else None

    return ChatMessage(
        content=content,
        expression=expression,
        role="assistant"
    ) 