export interface Bot {
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
  price: number;
  marketCap: number;
  volume: number;
  change: number;
}

export interface ChatMessage {
  message: string;
  role: string;
  expression: string | null;
  timestamp: string;
}

export type ChatHistory = {
  user_id: string;
  bot_name: string;
  messages: ChatMessage[];
  timestamp: string;
}; 