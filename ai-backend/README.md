# AI Chat Bot API

A FastAPI-based backend service that allows creation and interaction with personalized chat bots. Each bot can have its own personality, bio, starting dialogue, and blockchain-related information.

## Setup

1. Clone the repository
2. Setup virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:

```bash
pip3 install -r requirements.txt
```

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
    "starting_dialogue": "hey sunshine!",
    "ticker_symbol": "ETH",
    "contract_address": "0x123...",
    "ticker": "ETH/USD",
    "creator": "0xabc...", // wallet address
    "image": "base64_encoded_image_string", // optional
    "twitter": "@eliza_bot" // optional
}

Response:
{
    "message": "Bot eliza created successfully"
}
```

### Get All Bots

```bash
GET /bots

Response:
{
    "bots": [
        {
            "name": "eliza",
            "bio": "loves taylor swift songs",
            "personality": "shy, smart",
            "starting_dialogue": "hey sunshine!",
            "ticker_symbol": "ETH",
            "contract_address": "0x123...",
            "ticker": "ETH/USD",
            "creator": "0xabc...",
            "created_date": "2024-03-20T10:30:15",
            "image": "hex_encoded_image_data",
            "twitter": "@eliza_bot"
        }
    ]
}
```

### Create a New User

```bash
POST /users

Request Body:
{
    "username": "crypto_trader",
    "wallet_address": "0xabc...",
    "network": "ethereum",
    "favourite_agents": [] // optional
}

Response:
{
    "message": "User crypto_trader created successfully"
}
```

### Get User Information

```bash
GET /users/{wallet_address}

Response:
{
    "wallet_address": "0xabc...",
    "username": "crypto_trader",
    "network": "ethereum",
    "favourite_agents": ["eliza", "other_bot"],
    "created_date": "2024-03-20T10:30:15",
    "created_bots": ["bot1", "bot2"],
    "chat_summary": {
        "eliza": 10,
        "other_bot": 5
    }
}
```

### Chat with Bot

```bash
POST /chat

Request Body:
{
    "bot_name": "eliza",
    "user_id": "0xabc...", // wallet address
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
    "user_id": "0xabc...",
    "bot_name": "eliza",
    "messages": [
        {
            "message": "Hi Eliza!",
            "role": "user",
            "expression": null,
            "timestamp": "2024-03-20T10:30:15"
        },
        {
            "message": "Hello! Nice to meet you!",
            "role": "assistant",
            "expression": "smiles warmly",
            "timestamp": "2024-03-20T10:30:16"
        }
    ],
    "timestamp": "2024-03-20T10:30:20"
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
        "users": 10,
        "messages": 100
    }
}
```

### Get Database Status (Admin Only)

```bash
GET /db/status?admin_key=your-secure-admin-key

Response:
{
    "database_summary": {
        "total_bots": 10,
        "total_users": 50,
        "total_messages": 1000,
        "total_user_messages": 500,
        "total_bot_messages": 500,
        "active_conversations": 30
    },
    "bots": [...],
    "users": [...],
    "chat_statistics": [
        {
            "bot_name": "eliza",
            "user_id": "0xabc...",
            "message_count": 100,
            "first_message": "2024-03-20T10:30:15",
            "last_message": "2024-03-20T11:45:30",
            "user_messages": 50,
            "bot_messages": 50
        }
    ],
    "most_active": {
        "bots": [
            {
                "bot_name": "eliza",
                "message_count": 500
            }
        ],
        "users": [
            {
                "user_id": "0xabc...",
                "message_count": 300
            }
        ]
    },
    "timestamp": "2024-03-20T12:00:00.000Z"
}
```

### Update User Information

```bash
PUT /users/{wallet_address}

Request Body:
{
    "username": "new_username",
    "wallet_address": "0xabc...",
    "network": "ethereum",
    "favourite_agents": ["bot1", "bot2"]
}

Response:
{
    "message": "User updated successfully",
    "user": {
        "wallet_address": "0xabc...",
        "username": "new_username",
        "network": "ethereum",
        "favourite_agents": ["bot1", "bot2"],
        "created_date": "2024-03-20T10:30:15"
    }
}
```

### Update Bot Information

```bash
PUT /bots/{bot_name}

Request Body:
{
    "name": "eliza",
    "bio": "updated bio",
    "personality": "updated personality",
    "starting_dialogue": "new greeting",
    "ticker_symbol": "ETH",
    "contract_address": "0x123...",
    "ticker": "ETH/USD",
    "creator": "0xabc...",
    "image": "base64_encoded_image_string",
    "twitter": "@new_twitter"
}

Response:
{
    "message": "Bot updated successfully",
    "bot": {
        "name": "eliza",
        "bio": "updated bio",
        "personality": "updated personality",
        "starting_dialogue": "new greeting",
        "ticker_symbol": "ETH",
        "contract_address": "0x123...",
        "ticker": "ETH/USD",
        "creator": "0xabc...",
        "created_date": "2024-03-20T10:30:15",
        "image": "hex_encoded_image_data",
        "twitter": "@new_twitter"
    }
}

## Database Structure

The system uses SQLite with three main tables:

1. `bots`: Stores bot configurations
   - name (PRIMARY KEY)
   - bio
   - personality
   - starting_dialogue
   - ticker_symbol
   - contract_address
   - ticker
   - creator (wallet address)
   - created_date
   - image (BLOB)
   - twitter

2. `users`: Stores user information
   - wallet_address (PRIMARY KEY)
   - username
   - network
   - favourite_agents (JSON string)
   - created_date

3. `chat_history`: Stores conversations
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

1. Always use wallet addresses as user IDs
2. Keep bot names unique
3. Store images as base64 strings when sending to API
4. Regularly backup the database
5. Monitor database size using /db/status endpoint
6. Use meaningful bot personalities and bios for better responses

## Error Handling

All endpoints return appropriate HTTP status codes:

- 200: Success
- 400: Bad Request (e.g., duplicate bot/user)
- 403: Forbidden (invalid admin key)
- 404: Not Found (bot/user not found)
- 500: Internal Server Error

Error responses include detailed messages:
```json
{
    "detail": "Error message"
}
```
