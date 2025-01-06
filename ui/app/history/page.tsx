"use client";

import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { getImageSrc } from "@/lib/utils";
interface ChatMessage {
  message: string;
  role: string;
  expression: string | null;
  timestamp: string;
}

interface ChatHistory {
  user_id: string;
  bot_name: string;
  messages: ChatMessage[];
  timestamp: string;
}

interface Bot {
  name: string;
  bio: string;
  image: string;
  // ... other bot fields
}

export default function HistoryPage() {
  const { address, isConnected } = useAccount();
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [bots, setBots] = useState<{ [key: string]: Bot }>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;

      try {
        // Get user info to get list of bots they've chatted with
        const userResponse = await fetch(`http://127.0.0.1:8000/users/${address}`);
        const userData = await userResponse.json();

        // Get all bots info
        const botsResponse = await fetch('http://127.0.0.1:8000/bots');
        const botsData = await botsResponse.json();
        const botsMap = botsData.bots.reduce((acc: any, bot: Bot) => {
          acc[bot.name] = bot;
          return acc;
        }, {});
        setBots(botsMap);

        // Get chat history for each bot the user has chatted with
        const histories = await Promise.all(
          Object.keys(userData.chat_summary).map(async (botName) => {
            const chatResponse = await fetch(
              `http://127.0.0.1:8000/chats/${address}/${botName}`
            );
            return chatResponse.json();
          })
        );

        setChatHistories(histories);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchData();
  }, [address]);

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6 max-w-2xl h-[80vh] flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-6">Chat History</h1>
          <p className="text-zinc-400 mb-6">
            Please connect your wallet to view your chat history
          </p>
          <w3m-button />
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-6">Chat History</h1>
      <div className="space-y-4">
        {chatHistories.map((chat) => {
          const bot = bots[chat.bot_name];
          const lastMessage = chat.messages[chat.messages.length - 1];
          
          return (
            <Link key={chat.bot_name} href={`/agent/${chat.bot_name}`}>
              <Card className="bg-zinc-900 border-zinc-800 p-4 hover:border-pink-500/50 transition-colors">
                <div className="flex items-start gap-4">
                  <Image
                    src={getImageSrc(bot?.image) || "/assets/anyachan.jpg"}
                    alt={chat.bot_name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">
                        {chat.bot_name}
                      </h3>
                      <span className="text-sm text-zinc-400">
                        {formatDistanceToNow(new Date(chat.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2">
                      {lastMessage?.message || "No messages"}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
