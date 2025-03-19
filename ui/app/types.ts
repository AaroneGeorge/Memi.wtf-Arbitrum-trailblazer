export interface MessageExample {
  user: string;
  content: {
    text: string;
  };
}

export interface Agent {
  name: string;
  ticker: string;
  bio: string[];
  lore: string[];
  knowledge: string[];
  messageExamples: MessageExample[][];
  topics: string[];
  adjectives: string[];
  twitter: string;
  gu: string;
  profileImage: string;
  owner: string;
  agentId: string;
  agentProfileId: string;
  createdAt?: string;
  clients?: string[];
  secrets?: Record<string, string>;
  plugins?: string[];
}

export interface ChatMessage {
  message: string;
  role: string;
  expression: string | null;
  timestamp: string;
}

export interface ChatHistory {
  user_id: string;
  bot_name: string;
  messages: ChatMessage[];
  timestamp: string;
}

export interface AgentCardProps {
  agentProfileId: string;
  name: string;
  description?: string;
  image: string;
  bio?: string | string[];
  className?: string;
  imageClassName?: string;
  owner?: string;
  creatorName?: string;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
    };
  }
} 
