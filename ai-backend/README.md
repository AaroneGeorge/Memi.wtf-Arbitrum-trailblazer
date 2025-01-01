# AI Chat Bot API

A FastAPI-based backend service that allows creation and interaction with personalized chat bots. Each bot can have its own personality, bio, and starting dialogue.

## Setup

1. Clone the repository
2. Setup virtual environment:

```bash
python3 -m venv venv # create virtual environment
source venv/bin/activate # activate virtual environment
```

3. Install dependencies

```bash
pip3 install -r requirements.txt
```

or

4. Create a `.env` file in the root directory:

```
TOGETHER_AI_KEY=your_together_ai_key
ADMIN_KEY=your_secure_admin_key
```

5. Run the server:

```bash
uvicorn api-server:app --reload
```

## API Documentation

### Health Check

```bash
GET /health

Response:
{
    "status": "healthy"
}
```

### Create a New Bot

```bash
POST /bots/create

Request Body:
{
    "name": "eliza",
    "bio": "loves taylor swift songs",
    "personality": "shy, smart",
    "starting_dialogue": "hey sunshine!"
}

Response:
{
    "message": "Bot eliza created successfully"
}
```

### Get Bot's Starting Dialogue

```bash
GET /bots/{bot_name}/dialogue

Response:
{
    "starting_dialogue": "hey sunshine!"
}
```

### Chat with Bot

```bash
POST /chat

Request Body:
{
    "bot_name": "eliza",
    "user_id": "user123",
    "message": "Hi Eliza! Do you like to dance?"
}

Response:
{
    "response": {
        "content": "Yes, I absolutely love dancing to Taylor Swift songs!",
        "expression": "blushes while swaying slightly to imaginary music",
        "role": "assistant"
    }
}
```

### Get Chat History

```bash
GET /chats/{user_id}/{bot_name}

Response:
{
    "user_id": "user123",
    "bot_name": "eliza",
    "messages": [
        {
            "message": "Hi Eliza! Do you like to dance?",
            "role": "user",
            "expression": null,
            "timestamp": "2024-03-20 10:30:15"
        },
        {
            "message": "Yes, I absolutely love dancing to Taylor Swift songs!",
            "role": "assistant",
            "expression": "blushes while swaying slightly to imaginary music",
            "timestamp": "2024-03-20 10:30:16"
        }
    ],
    "timestamp": "2024-03-20 10:30:20"
}
```

### Delete Chat History

```bash
DELETE /chats/{user_id}/{bot_name}

Response:
{
    "message": "Successfully deleted 10 messages",
    "deleted_count": 10
}
```

### Clear Database (Admin Only)

```bash
DELETE /db/clear?admin_key=your-secure-admin-key

Response:
{
    "message": "Database cleared successfully",
    "deleted_counts": {
        "bots": 5,
        "messages": 100
    }
}
```

### Get Database Status (Admin Only)

```bash
GET /db/status?admin_key=your-secure-admin-key

Response:
{
    "bots": [
        {
            "name": "eliza",
            "bio": "loves taylor swift songs",
            "personality": "shy, smart",
            "starting_dialogue": "hey sunshine!"
        }
    ],
    "chat_statistics": [
        {
            "bot_name": "eliza",
            "user_id": "user123",
            "message_count": 10,
            "first_message": "2024-03-20 10:30:15",
            "last_message": "2024-03-20 11:45:30"
        }
    ],
    "total_messages": 10,
    "total_bots": 1,
    "active_conversations": 1
}
```

## Testing Guide

1. First, create a bot:

```bash
curl -X POST "http://localhost:8000/bots/create" \
-H "Content-Type: application/json" \
-d '{
    "name": "eliza",
    "bio": "loves taylor swift songs",
    "personality": "shy, smart",
    "starting_dialogue": "hey sunshine!"
}'
```

2. Start a conversation:

```bash
curl -X POST "http://localhost:8000/chat" \
-H "Content-Type: application/json" \
-d '{
    "bot_name": "eliza",
    "user_id": "user123",
    "message": "Hi Eliza! Do you like to dance?"
}'
```

3. Check chat history:

```bash
curl "http://localhost:8000/chats/user123/eliza"
```

4. Delete conversation:

```bash
curl -X DELETE "http://localhost:8000/chats/user123/eliza"
```

## Error Handling

The API includes comprehensive error handling:

- 400: Bad Request (e.g., duplicate bot name)
- 403: Forbidden (invalid admin key)
- 404: Not Found (bot or chat history not found)
- 500: Internal Server Error

All errors return a JSON response with details:

```json
{
  "error": "Error message",
  "type": "ErrorType",
  "path": "/endpoint/path"
}
```

## Database Structure

The system uses SQLite with two main tables:

1. `bots`: Stores bot configurations

   - name (PRIMARY KEY)
   - bio
   - personality
   - starting_dialogue

2. `chat_history`: Stores conversations
   - id (PRIMARY KEY)
   - user_id
   - bot_name
   - message
   - role
   - expression
   - timestamp

## Security Notes

1. Admin endpoints require an `admin_key` parameter
2. Database operations are protected against SQL injection
3. All endpoints include error handling
4. CORS is enabled for all origins (customize as needed)

## Best Practices

1. Always use unique user_ids for different users
2. Keep bot names unique
3. Regularly backup the database
4. Monitor the database size using the /db/status endpoint
5. Use meaningful bot personalities and bios for better responses
