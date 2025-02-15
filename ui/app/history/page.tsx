"use client";

import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { getImageSrc } from "@/lib/utils";
import WalletConnectButton from "@/components/wallet-connect-button";
import Squares from "@/components/Squares";
import { testBots, testUsers, testChatHistory } from "@/lib/test-data";

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

export default function HistoryPage() {
  const { address, isConnected } = useAccount();
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [bots, setBots] = useState<{ [key: string]: typeof testBots[0] }>({});

  useEffect(() => {
    if (!address) return;

    // Get user's chat history from test data
    const userChats = testUsers[address as keyof typeof testUsers]?.chat_summary || {};
    
    // Create chat histories from test data
    const histories = Object.entries(userChats).map(([botName, summary]) => ({
      user_id: address,
      bot_name: botName,
      messages: testChatHistory[botName]?.messages || [],
      timestamp: summary.timestamp
    }));

    setChatHistories(histories);

    // Create bots map
    const botsMap = testBots.reduce((acc, bot) => {
      acc[bot.name] = bot;
      return acc;
    }, {} as { [key: string]: typeof testBots[0] });
    setBots(botsMap);
  }, [address]);

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6 max-w-2xl h-[80vh] flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <Squares
            speed={0.5}
            squareSize={40}
            direction="diagonal"
            borderColor="#fff"
          />
        </div>
        <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-6">Chat History</h1>
          <p className="text-zinc-400 mb-6">
            Please connect your wallet to view your chat history
          </p>
          <WalletConnectButton />
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
                  <div className="relative aspect-square h-10 overflow-hidden rounded-full">
                    <Image
                      src={getImageSrc(bot?.image) || "/assets/anyachan.jpg"}
                      alt={chat.bot_name}
                      fill
                      className="object-cover"
                    />
                  </div>
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
