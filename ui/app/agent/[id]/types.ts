export type Bot = {
  name: string;
  bio: string;
  personality: string;
  starting_dialogue: string;
  ticker_symbol: string;
  contract_address: string;
  ticker: string;
  creator: string;
  created_date: string;
  image: string;
  twitter: string;
};

export type ChatMessage = {
  message: string;
  role: "user" | "assistant";
  expression: string | null;
  timestamp: string;
};

export type ChatHistory = {
  user_id: string;
  bot_name: string;
  messages: ChatMessage[];
  timestamp: string;
}; 