export interface Agent {
  id: string;
  name: string;
  ticker: string;
  bio: string[];
  lore: string[];
  knowledge: string[];
  messageExamples: MessageExample[][];
  topics: string[];
  adjectives: string[];
  twitter: string;
  profileImage: string;
  owner: string;
  agentProfileId: string;
  createdAt?: Date;
} 