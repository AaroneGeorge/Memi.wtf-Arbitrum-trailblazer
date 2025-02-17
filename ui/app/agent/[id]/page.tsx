"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Send, ExternalLink, Lock, Check, ImageIcon, Mic, BookOpen } from "lucide-react";
import { IconBrandDiscord, IconBrandTwitter } from '@tabler/icons-react';
import Image from "next/image";
import Link from "next/link";
import { getImageSrc } from "@/lib/utils";
import TradingViewWidget from "@/components/TradingViewWidget";
import { getAgentDetails } from "@/lib/firebase/firestore";
import { Agent, ChatMessage } from "@/app/types";
import WalletConnectButton from "@/components/wallet-connect-button";
import { TypingAnimation } from "@/components/typing-animation";

interface AgentResponse {
  user?: string;
  text: string;
  action?: "WEB_SEARCH" | "NONE";
}

// Update the formatLinks function to show truncated links with icons
const formatLinks = (text: string) => {
  // Match URLs, including those starting with www., and handle parentheses
  const urlRegex = /\(?(https?:\/\/[^\s)]+|www\.[^\s)]+)\)?/g;
  
  // Match Twitter handles
  const twitterRegex = /(@\w+)/g;
  
  // First split by URLs
  const parts = text.split(urlRegex);
  const matches = text.match(urlRegex) || [];
  
  return parts.map((part, i) => {
    // If there's a matching URL for this position
    if (matches[i]) {
      // Clean the URL by removing parentheses
      const cleanUrl = matches[i].replace(/^\(|\)$/g, '');
      const url = cleanUrl.startsWith('www.') ? `https://${cleanUrl}` : cleanUrl;
      
      // Get domain name for display
      let displayText = cleanUrl;
      try {
        const urlObj = new URL(url);
        displayText = urlObj.hostname + (urlObj.pathname !== '/' ? '...' : '');
      } catch (e) {
        displayText = cleanUrl.length > 30 ? cleanUrl.substring(0, 30) + '...' : cleanUrl;
      }

      return (
        <Link
          key={`url-${i}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-pink-500 inline-flex items-center gap-1 mx-1"
          title={url}
        >
          <span className="text-sm">{displayText}</span>
          <ExternalLink className="h-4 w-4 flex-shrink-0" />
        </Link>
      );
    }
    
    // Handle Twitter handles
    const twitterParts = part.split(twitterRegex);
    return twitterParts.map((twitterPart, j) => {
      if (twitterPart.match(twitterRegex)) {
        const handle = twitterPart.substring(1); // Remove @ symbol
        return (
          <Link
            key={`twitter-${i}-${j}`}
            href={`https://x.com/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-pink-500 inline-flex items-center gap-1 mx-1"
            title={`@${handle} on Twitter`}
          >
            <span>@{handle}</span>
            <IconBrandTwitter className="h-4 w-4 flex-shrink-0" />
          </Link>
        );
      }
      return twitterPart;
    });
  });
};

// Update the formatBulletPoints function to better handle links in bullet points
const formatBulletPoints = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, index) => {
    const trimmedLine = line.trim();
    
    // Handle bullet points
    if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
      return (
        <div key={index} className="flex gap-2 items-start ml-2 mt-1">
          <span className="text-pink-500 mt-1 flex-shrink-0">•</span>
          <span className="break-words">{formatLinks(trimmedLine.substring(1).trim())}</span>
        </div>
      );
    }
    
    // Handle numbered lists
    if (trimmedLine.match(/^\d+\./)) {
      return (
        <div key={index} className="flex gap-2 items-start ml-2 mt-1">
          <span className="text-pink-500 min-w-[20px] flex-shrink-0">
            {trimmedLine.split('.')[0]}.
          </span>
          <span className="break-words">
            {formatLinks(trimmedLine.substring(trimmedLine.indexOf('.') + 1).trim())}
          </span>
        </div>
      );
    }
    
    // Handle regular text
    return (
      <div key={index} className={index > 0 ? "mt-2" : ""}>
        {formatLinks(trimmedLine)}
      </div>
    );
  });
};

export default function AgentPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        if (typeof id === "string") {
          const agentData = await getAgentDetails(id);
          if (agentData) {
            setAgent(agentData);
          } else {
            setError("Agent not found");
          }
        }
      } catch (error) {
        console.error("Error fetching agent:", error);
        setError("Failed to load agent details");
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        });

      window.ethereum.on('accountsChanged', function (accounts: string[]) {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress("");
        }
      });
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !agent || isSubmitting) return;
    
    if (!walletAddress) {
      setError("Please connect your wallet first");
      return;
    }

    const userMessage: ChatMessage = {
      message: message,
      role: "user",
      expression: null,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsSubmitting(true);
    setIsTyping(true);

    try {
      const response = await fetch(`http://localhost:3001/${agent.agentId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
          userId: walletAddress,
        }),
      });

      const data: AgentResponse[] = await response.json();
      
      if (data && data.length > 0) {
        data.forEach((response) => {
          const agentMessage: ChatMessage = {
            message: response.text,
            role: "assistant",
            expression: response.action === "WEB_SEARCH" ? "Searching the web..." : null,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, agentMessage]);
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
      setIsTyping(false);
    }
  };

  // Update the renderMessage function
  const renderMessage = (msg: ChatMessage, index: number) => (
    <div
      key={index}
      className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
    >
      <div
        className={`rounded-lg p-3 text-sm max-w-[80%] ${
          msg.role === "user"
            ? "bg-pink-600 text-white ml-12"
            : "bg-zinc-800 text-zinc-200"
        }`}
      >
        <div className="whitespace-pre-wrap">
          {formatBulletPoints(msg.message)}
        </div>
        {msg.expression && (
          <div className={`text-xs mt-2 italic ${
            msg.expression === "Searching the web..." 
              ? "text-blue-400"
              : "text-zinc-400"
          }`}>
            *{msg.expression}*
          </div>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <p className="text-zinc-400">Loading agent details...</p>
        </Card>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <p className="text-red-500">{error || "Agent not found"}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative aspect-square h-16 overflow-hidden rounded-full">
              <Image
                src={getImageSrc(agent.profileImage)}
                alt={agent.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
                <span className="text-pink-500">
                  {agent.ticker.toUpperCase()}
                </span>
              </div>
              <div className="text-zinc-400 text-sm">
                Created by {agent.owner} •
                <Link
                  href={`https://x.com/${agent.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-pink-500 hover:underline"
                >
                  <IconBrandTwitter className="inline-block w-4 h-4 ml-1 mr-1" />
                  {agent.twitter}
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-pink-500">
              <Heart className="h-5 w-5" />
            </Button>
            <WalletConnectButton />
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="font-semibold text-white">
                    Chat with {agent.name}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Created by {agent.owner}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="p-4 h-[400px] overflow-y-auto space-y-4"
              ref={chatContainerRef}
            >
              {messages.map((msg, i) => renderMessage(msg, i))}
              {isTyping && (
                <div className="flex gap-2">
                  <TypingAnimation />
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-zinc-800"
            >
              <div className="flex gap-2">
                <Input
                  placeholder={walletAddress ? "Type a message..." : "Connect wallet to chat..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                  disabled={isSubmitting || !walletAddress}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-pink-600 hover:bg-pink-700"
                  disabled={isSubmitting || !walletAddress}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Card>

      {/* New Social Connections Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="bg-zinc-900 border-zinc-800 p-6 flex flex-col items-center text-center hover:border-pink-500/50 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <IconBrandDiscord className="w-6 h-6 text-[#5865F2]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Discord Integration</h3>
          <p className="text-sm text-zinc-400 mb-4">Connect your agent with Discord server</p>
          <span className="text-red-500 text-sm flex items-center gap-1">
            <Lock className="w-4 h-4" /> Locked
          </span>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6 flex flex-col items-center text-center hover:border-pink-500/50 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <IconBrandTwitter className="w-6 h-6 text-[#1DA1F2]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Twitter Integration</h3>
          <p className="text-sm text-zinc-400 mb-4">Connect your agent with Twitter</p>
          <span className="text-green-500 text-sm flex items-center gap-1">
            <Check className="w-4 h-4" /> Unlocked
          </span>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6 flex flex-col items-center text-center hover:border-pink-500/50 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Send className="w-6 h-6 text-[#0088cc]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Telegram Integration</h3>
          <p className="text-sm text-zinc-400 mb-4">Connect your agent with Telegram</p>
          <span className="text-red-500 text-sm flex items-center gap-1">
            <Lock className="w-4 h-4" /> Locked
          </span>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6 flex flex-col items-center text-center hover:border-pink-500/50 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Image Generation</h3>
          <p className="text-sm text-zinc-400 mb-4">Enable AI image generation</p>
          <span className="text-red-500 text-sm flex items-center gap-1">
            <Lock className="w-4 h-4" /> Locked
          </span>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6 flex flex-col items-center text-center hover:border-pink-500/50 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Mic className="w-6 h-6 text-yellow-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Voice Integration</h3>
          <p className="text-sm text-zinc-400 mb-4">Enable voice interactions</p>
          <span className="text-red-500 text-sm flex items-center gap-1">
            <Lock className="w-4 h-4" /> Locked
          </span>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6 flex flex-col items-center text-center hover:border-pink-500/50 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Training</h3>
          <p className="text-sm text-zinc-400 mb-4">Customize agent knowledge</p>
          <span className="text-red-500 text-sm flex items-center gap-1">
            <Lock className="w-4 h-4" /> Locked
          </span>
        </Card>
      </div>
    </div>
  );
}
