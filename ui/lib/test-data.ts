export const testBots = [
  {
    name: "Anya Bot",
    bio: "A friendly AI assistant who loves peanuts and helping others",
    personality: "Cheerful and energetic",
    starting_dialogue: "Waku waku! How can I help you today?",
    ticker_symbol: "$ANYA",
    contract_address: "0x36fc8adf3f639f42e30a7e3e5e72905a2f9c346f",
    ticker: "ANYA",
    creator: "0x123...abc",
    created_date: "2024-03-15T00:00:00Z",
    image: "/assets/anyachan.jpg",
    twitter: "@AnyaBot",
    price: 0.0156,
    marketCap: 28941567,
    volume: 2456123,
    change: 3.45,
  },
  {
    name: "Trading Bot",
    bio: "Expert crypto trading assistant with market insights",
    personality: "Professional and analytical",
    starting_dialogue: "Ready to analyze the markets together?",
    ticker_symbol: "$TRADE",
    contract_address: "0x456...def",
    ticker: "TRADE",
    creator: "0x789...ghi",
    created_date: "2024-03-14T00:00:00Z",
    image: "/assets/trading-bot.jpg",
    twitter: "@TradingBot",
    price: 0.0234,
    marketCap: 19876543,
    volume: 789012,
    change: 5.67,
  },
  {
    name: "Luna AI",
    bio: "Your personal DeFi and trading companion",
    personality: "Friendly and knowledgeable",
    starting_dialogue: "Hello! Ready to explore DeFi together?",
    ticker_symbol: "$LUNA",
    contract_address: "0x789...xyz",
    ticker: "LUNA",
    creator: "0x456...def",
    created_date: "2024-03-13T00:00:00Z",
    image: "/assets/luna-bot.jpg",
    twitter: "@LunaAI",
    price: 0.0089,
    marketCap: 8945672,
    volume: 567890,
    change: -2.34,
  },
  // Add more test bots as needed
];

export const testUsers = {
  "0x123...abc": {
    username: "CryptoWhale",
    wallet_address: "0x123...abc",
    network: "arbitrum",
    favourite_agents: ["Anya Bot"],
    created_date: "2024-01-01T00:00:00Z",
    chat_summary: {
      "Anya Bot": {
        last_message: "Waku waku! See you later!",
        timestamp: "2024-03-15T12:00:00Z"
      }
    }
  }
};

export const testChatHistory = {
  "Anya Bot": {
    messages: [
      {
        message: "Waku waku! How can I help you today?",
        role: "assistant",
        expression: "excited",
        timestamp: "2024-03-15T11:55:00Z"
      },
      {
        message: "Hi Anya! Can you help me with trading?",
        role: "user",
        expression: null,
        timestamp: "2024-03-15T11:56:00Z"
      },
      {
        message: "Of course! I'd love to help you understand trading better!",
        role: "assistant",
        expression: "happy",
        timestamp: "2024-03-15T11:57:00Z"
      }
    ],
    user_id: "0x123...abc",
    bot_name: "Anya Bot",
    timestamp: "2024-03-15T11:57:00Z"
  }
}; 