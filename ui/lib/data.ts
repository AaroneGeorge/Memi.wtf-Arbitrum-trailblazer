export const agents = [
  {
    id: "sasha",
    name: "Sasha",
    ticker: "$SASHA",
    description: "AI Trading Assistant",
    bio: "Expert in crypto trading and market analysis",
    personality: "Professional, friendly, and detail-oriented",
    image: "/placeholder.svg?height=50&width=50",
    startingDialogue:
      "Hi! I'm Sasha, your AI trading assistant. How can I help you today?",
    price: 0.0112,
    marketCap: 14682124,
    volume: 1324231,
    change: 7.1232,
    creator: "@alpha_kid69",
    contract: "F92uei..94e",
    twitter: "@sasha_terminal",
  },
  {
    id: "luna",
    name: "Luna",
    ticker: "$LUNA",
    description: "Market Analysis Expert",
    bio: "Specialized in technical analysis and trend prediction",
    personality: "Analytical and precise",
    image: "/placeholder.svg?height=50&width=50",
    startingDialogue: "Welcome! Ready to analyze some market trends?",
    price: 0.0156,
    marketCap: 28941567,
    volume: 2456123,
    change: 3.45,
    creator: "@crypto_wizard",
    contract: "A73bcd..1fe",
    twitter: "@luna_markets",
  },
];

export type Agent = (typeof agents)[0];

export const chatHistory = [
  {
    id: 1,
    agentId: "sasha",
    agentName: "Sasha",
    agentImage: "/placeholder.svg?height=50&width=50",
    preview: "Let's analyze the recent market trends...",
    date: "2024-01-01T10:00:00Z",
    messages: [
      { role: "assistant", content: "Hi! Ready to look at today's market?" },
      { role: "user", content: "Yes, what's your take on ETH?" },
      {
        role: "assistant",
        content: "Let's analyze the recent market trends...",
      },
    ],
  },
  // Add more chat history items
];
