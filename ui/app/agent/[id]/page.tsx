"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Send, ExternalLink, Lock, Check, ImageIcon, Mic, BookOpen } from "lucide-react";
import { IconBrandDiscord, IconBrandTwitter, IconBrandTelegram } from '@tabler/icons-react';
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

// Add this helper function to fetch Telegram bot details
const getTelegramBotDetails = async (token: string) => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json();
    if (data.ok) {
      return {
        firstName: data.result.first_name,
        username: data.result.username
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching Telegram bot details:', error);
    return null;
  }
};

// Add Discord bot details fetching function
const getDiscordBotDetails = async (DISCORD_APPLICATION_ID: string, DISCORD_API_TOKEN: string) => {
  try {
    const response = await fetch(`/api/discord/${DISCORD_APPLICATION_ID}`, {
      headers: {
        'Authorization': `Bot ${DISCORD_API_TOKEN}`
      }
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
      return {
        name: data.name,
        username: data.bot_public ? data.name : 'Private Bot'
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching Discord bot details:', error);
    return null;
  }
};

// Update the getSocialLinks function
const getSocialLinks = async (agent: Agent) => {
  const links: { type: string; url: string; enabled: boolean; username?: string }[] = [];

  // Check GU trade
  if (agent.gu) {
    links.push({
      type: 'gu',
      url: `https://gu.exchange/coin/${agent.gu}`,
      enabled: true,
      username: agent.gu
    })
  }

  // Check Twitter
  if (agent.twitter) {
    links.push({
      type: 'twitter',
      url: `https://x.com/${agent.twitter}`,
      enabled: true,
      username: agent.twitter
    });
  }

  // Check Discord
  if (agent.clients?.includes('discord') && agent.secrets?.DISCORD_APPLICATION_ID && agent.secrets?.DISCORD_API_TOKEN) {
    const botDetails = await getDiscordBotDetails(
      agent.secrets.DISCORD_APPLICATION_ID,
      agent.secrets.DISCORD_API_TOKEN
    );
    if (botDetails) {
      links.push({
        type: 'discord',
        url: `https://discord.com/oauth2/authorize?client_id=${agent.secrets.DISCORD_APPLICATION_ID}&scope=bot&permissions=8`,
        enabled: true,
        username: botDetails.name
      });
    }
  }

  // Check Telegram
  if (agent.clients?.includes('telegram') && agent.secrets?.TELEGRAM_BOT_TOKEN) {
    const botDetails = await getTelegramBotDetails(agent.secrets.TELEGRAM_BOT_TOKEN);
    if (botDetails) {
      links.push({
        type: 'telegram',
        url: `https://t.me/${botDetails.username}`,
        enabled: true,
        username: botDetails.firstName
      });
    }
  }

  return links;
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
  const [socialLinks, setSocialLinks] = useState<Array<{ type: string; url: string; enabled: boolean; username?: string }>>([]);

  useEffect(() => {
    const fetchAgentAndSocials = async () => {
      try {
        if (typeof id === "string") {
          const agentData = await getAgentDetails(id);
          if (agentData) {
            setAgent(agentData);
            const links = await getSocialLinks(agentData);
            setSocialLinks(links);
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

    fetchAgentAndSocials();
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        });

      window.ethereum.on('accountsChanged', function(accounts: string[]) {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_ELIZA_BACKEND_URL}/${agent.agentId}/message`, {
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
        className={`rounded-lg p-3 text-sm max-w-[80%] ${msg.role === "user"
          ? "bg-pink-600 text-white ml-12"
          : "bg-zinc-800 text-zinc-200"
          }`}
      >
        <div className="whitespace-pre-wrap">
          {formatBulletPoints(msg.message)}
        </div>
        {msg.expression && (
          <div className={`text-xs mt-2 italic ${msg.expression === "Searching the web..."
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
                  {`$${agent.ticker.toUpperCase()}`}
                </span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400 text-sm">
                {socialLinks.map((link, index) => (
                  <Link
                    key={link.type}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-zinc-300 hover:text-pink-500 transition-colors"
                  >

                    {link.type === 'gu' && (
                      <>
                        <div className="w-7 h-7 flex items-center justify-center">
                          <svg width="25" height="25" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.0135 63.3504L19.027 68.7017L28.3918 67.3639L43.9999 61.5666L56.0404 62.0125L60.9458 51.7558L68.5268 43.7288L72.0944 30.7964L59.162 18.31L60.0539 15.1884L68.5268 16.0803L70.7566 14.2965L68.9728 10.283L64.5133 7.60732L59.162 7.16138L56.0404 9.83704L59.162 14.7424L58.2701 17.4181L54.7026 16.0803L49.7972 12.5127L43.5539 10.283L41.3242 12.0668L35.081 15.1884L36.8648 19.6478L27.4999 20.0938L28.8378 17.864L29.2837 15.6343L27.054 13.4046H23.9324L21.2567 15.1884L22.1486 19.2019L25.7162 20.5397L23.0405 28.1208V43.7288L18.1351 54.4315L15.0135 63.3504Z" fill="#44FFD2"></path> <ellipse cx="62.5782" cy="11.4892" rx="0.848325" ry="0.790839" fill="#001A17"></ellipse> <ellipse cx="25.4217" cy="16.3924" rx="0.848327" ry="0.790839" fill="#001A17"></ellipse> <path d="M19.9127 36.8158C19.9127 37.8465 19.0587 38.4087 18.1705 38.4087C17.2823 38.4087 16.6293 37.6438 16.6293 36.8158C16.6293 35.9878 17.4163 35.2229 18.3045 35.2229C19.1927 35.2229 19.9127 35.8163 19.9127 36.8158Z" fill="#001A17"></path> <path d="M15.6412 44.0552C15.8288 45.3296 14.8706 46.7725 14.3681 47.3347C13.6837 48.303 11.8888 48.709 11.1852 47.7095C10.4816 46.7101 11.9223 45.0547 13.1619 43.4306C14.4016 41.8065 15.4067 42.4624 15.6412 44.0552Z" fill="#001A17"></path> <path d="M14.1 77.6935C14.6897 75.5946 17.4504 75.6633 18.288 75.5071C19.1256 75.351 20.8008 75.5071 21.7389 76.9126C23.0054 78.8101 21.0688 79.6299 19.3266 80.0047C17.5844 80.3795 13.363 80.317 14.1 77.6935Z" fill="#001A17"></path> <path d="M75.2606 43.7497C73.1968 44.7992 72.6361 43.4999 72.6138 42.719C72.6138 41.3448 74.4708 41.3306 75.6961 40.9075C77.1703 40.3985 77.8404 42.4379 75.2606 43.7497Z" fill="#001A17"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M71.4747 16.1395C70.3878 18.0154 68.5376 18.1277 62.4261 16.5622C59.3805 16.1546 59.4418 18.2377 65.0084 21.5428C69.5113 24.2164 72.3122 28.0498 73.1498 29.6322C75.7477 35.1998 73.6081 38.3855 72.7564 39.6536L72.7564 39.6537C72.6525 39.8083 72.5678 39.9345 72.5132 40.0329C72.3709 40.2894 72.0943 40.6385 71.7724 41.0448L71.7724 41.0448C70.9574 42.0735 69.8519 43.4688 69.8999 44.6554C69.962 46.1892 71.2896 46.1142 72.95 46.0203C73.0817 46.0129 73.2154 46.0053 73.3508 45.9985C75.1935 45.9048 75.9306 47.0916 74.7579 49.4341C73.5853 51.7766 69.8999 53.4944 67.7222 52.9947C65.5444 52.495 66.4155 50.9021 66.7506 50.3399C66.8352 50.1978 66.9905 49.9978 67.1645 49.7738C67.679 49.1115 68.3569 48.2387 67.8562 48.0286C67.3688 47.8242 67.2182 47.9832 65.9608 49.3107C65.4893 49.8085 64.8621 50.4705 64.0033 51.3393C62.0724 53.2926 61.1238 55.7272 60.2233 58.0385L60.2233 58.0385C59.655 59.497 59.1059 60.9064 58.3411 62.1148C56.3968 65.187 49.6872 64.2098 48.0333 63.969L47.955 63.9576C46.4474 63.7389 44.4706 63.4891 43.8341 65.1444C43.1975 66.7998 44.5042 67.7056 46.4474 68.3302C48.3906 68.9549 51.9085 71.5785 49.9317 75.7325C47.955 79.8865 39.8136 81.6981 36.6308 81.823C33.448 81.9479 30.7007 81.0734 29.193 78.4186C27.6853 75.7637 30.5666 72.7654 31.8398 71.6097C32.7398 70.7927 33.8576 70.3504 35.3113 69.7751L35.3114 69.775L35.3118 69.7749L35.3125 69.7746C35.9148 69.5363 36.5748 69.275 37.3009 68.9549C39.7801 67.8617 39.5791 66.7373 39.2776 66.3001C38.9761 65.8628 38.172 65.2694 35.5587 67.4245C33.4681 69.1485 31.3596 70.35 30.5666 70.7352C23.0618 74.2645 17.7348 69.8607 15.356 67.0184C12.9772 64.1762 13.2118 56.3991 18.0698 50.496C22.9278 44.593 21.9897 38.971 21.0851 35.4729C20.7785 34.287 20.26 33.1908 19.7622 32.1382C18.7914 30.0857 17.8989 28.1986 18.8069 26.1341C20.0876 23.222 22.446 22.3463 23.4109 21.988L23.4109 21.988C23.4809 21.962 23.5435 21.9387 23.5979 21.9176C24.402 21.6053 24.5025 21.4179 24.469 21.2305C24.4422 21.0806 23.9888 21.0223 23.7654 21.0119L23.7722 21.0043C21.6198 20.814 20.1806 18.8378 20.1806 16.6704C20.1806 14.152 22.7392 11.923 25.4407 11.923C28.1422 11.923 29.9637 13.7772 29.9637 16.2956C29.9637 17.5658 29.3555 18.7385 28.406 19.589C27.9836 20.6012 29.673 19.864 31.3037 18.6069C31.8509 18.1851 32.2295 17.332 32.6866 16.302C33.6849 14.0526 35.0576 10.9596 39.3781 9.6742C45.5948 7.8246 49.2005 10.7213 52.5467 13.4096L52.679 13.5159C55.8954 16.0987 56.2362 16.0008 57.0389 15.7702C57.0807 15.7582 57.1237 15.7458 57.1685 15.7334C58.0113 15.5007 57.1675 14.2107 56.4251 13.0757L56.4247 13.0751C56.3703 12.992 56.3165 12.9097 56.2639 12.8288L56.2503 12.8078C54.9311 11.3237 54.4487 9.83055 55.1048 8.69809C56.2817 6.66697 61.2049 5.14397 65.6116 7.36292C71.4747 10.0177 72.6516 14.1083 71.4747 16.1395ZM43.1976 12.1727C41.9803 12.3706 39.6219 13.2947 38.5405 14.5777C37.8035 15.4522 35.2907 18.5756 40.8858 18.6693C46.4809 18.763 47.5195 15.6396 47.352 14.9213C47.1845 14.2029 46.4809 11.8292 43.1976 12.1727ZM68.8115 13.8742C68.2782 15.2536 65.2757 15.5083 62.1052 14.4431C58.9347 13.3778 56.9703 11.0849 57.5036 9.70549C58.0368 8.32612 60.3302 7.54711 63.5007 8.61233C66.6712 9.67755 69.3447 12.4949 68.8115 13.8742ZM25.2395 19.2003C26.8123 19.2003 28.0873 18.0117 28.0873 16.5455C28.0873 15.0792 26.8123 13.8906 25.2395 13.8906C23.6667 13.8906 22.3917 15.0792 22.3917 16.5455C22.3917 18.0117 23.6667 19.2003 25.2395 19.2003ZM49.6638 16.9827C49.9586 15.6084 50.8587 15.3898 51.2719 15.4523C51.942 15.4523 52.7461 16.1394 52.7126 17.1701C52.6791 18.2008 52.009 18.7005 51.406 18.8879C50.8029 19.0753 49.2952 18.7005 49.6638 16.9827ZM16.9642 63.3328C16.723 61.5838 16.9754 60.501 17.1317 60.1783C17.6343 59.3037 18.5724 59.6161 19.544 60.8342C20.5156 62.0523 21.0852 63.083 21.2527 64.1137C21.4202 65.1444 21.1857 66.2063 19.745 66.3C18.3044 66.3937 17.2657 65.5192 16.9642 63.3328ZM52.7126 61.0841C53.3268 61.1673 54.7697 61.0716 55.6274 60.0221C56.6995 58.7103 55.5939 56.9613 54.6223 56.5865C53.6507 56.2117 51.9085 55.8993 51.205 56.8988C50.5014 57.8983 49.9318 58.9602 50.5684 60.0221C51.0776 60.8717 52.2101 61.0841 52.7126 61.0841ZM46.1459 21.4803C48.6922 20.4309 50.5572 21.9176 51.1715 22.7921C55.7615 27.3834 56.1635 35.2542 56.1635 37.6904C56.1635 40.1266 57.5707 47.3414 61.122 44.468C64.4871 41.7453 64.4531 36.3024 64.4403 34.2509C64.4395 34.1373 64.4389 34.0341 64.4389 33.9424C64.4389 32.1933 63.4338 28.5078 59.1788 26.5713C54.9239 24.6349 54.6893 21.1367 56.1635 19.6375C57.6377 18.1384 60.1839 19.0441 63.4338 23.6666C66.6836 28.2892 67.3872 37.1906 67.3202 39.252C67.2532 41.3134 65.444 44.0619 63.9028 45.6548C62.5029 47.1017 61.6283 48.394 60.5255 50.0232C60.4142 50.1876 60.3006 50.3555 60.1839 50.5272C58.8618 52.4734 56.1635 53.2133 53.6842 52.0889C51.381 51.0443 51.179 46.3417 51.0024 42.2285C50.9721 41.5243 50.9426 40.8374 50.9034 40.189C50.6354 35.7539 47.2515 30.6004 45.8109 28.5078C44.3702 26.4152 42.9631 22.7921 46.1459 21.4803ZM32.2084 32.3809C34.2186 30.0072 35.4583 28.9275 38.9761 28.508C41.8574 28.1644 42.159 25.2597 41.7904 24.0416C41.1626 21.9666 36.8319 20.8558 32.778 23.0109C28.724 25.166 25.5747 27.7272 25.3067 32.6308C25.2357 33.9293 25.179 35.2208 25.1247 36.4592C24.974 39.8974 24.8412 42.9266 24.4691 44.5619C24.104 46.1662 23.6091 47.6524 23.1359 49.0734C22.0891 52.217 21.1487 55.0411 21.9563 58.1171C23.1289 62.5834 25.5747 65.6755 29.8967 65.2383C33.0239 64.9219 35.0285 63.4118 36.4817 62.3171C37.0368 61.8989 37.5115 61.5413 37.9375 61.3341C39.4787 60.5845 41.0869 59.9286 42.695 59.6788C44.3032 59.4289 49.1911 56.2915 48.7927 52.6513C48.5845 50.7488 48.5718 48.7445 48.5593 46.7605C48.5416 43.9563 48.5241 41.1928 47.9551 38.8149C46.9835 34.7546 44.6383 31.4127 40.2493 31.1628C35.8603 30.9129 32.5434 37.4407 33.515 39.5333C34.4867 41.6259 37.2675 41.6259 39.3447 38.1903C40.6865 35.971 42.6177 37.2533 43.9347 39.5333C44.4037 40.3454 45.7439 45.4364 44.3702 49.8091C42.9966 54.1817 40.1823 58.3357 36.2288 58.1171C32.7855 57.9267 30.6337 56.5242 29.1596 51.2145C27.6854 45.9049 29.1363 36.0086 32.2084 32.3809Z" fill="#001A17"></path></svg>
                        </div>
                        <span className="text-[#1DA1F2] hover:text-[#1A91DA]">{link.username}</span>
                      </>
                    )}

                    {link.type === 'twitter' && (
                      <>
                        <IconBrandTwitter className="w-4 h-4 text-[#1DA1F2]" />
                        <span className="text-[#1DA1F2] hover:text-[#1A91DA]">{link.username}</span>
                      </>
                    )}
                    {link.type === 'discord' && (
                      <>
                        <IconBrandDiscord className="w-4 h-4 text-[#5865F2]" />
                        <span className="text-[#5865F2] hover:text-[#4752C4]">
                          {link.username || 'Discord'}
                        </span>
                      </>
                    )}
                    {link.type === 'telegram' && (
                      <>
                        <IconBrandTelegram className="w-4 h-4 text-[#0088cc]" />
                        <span className="text-[#0088cc] hover:text-[#0077b3]">{link.username}</span>
                      </>
                    )}
                    {index < socialLinks.length - 1 && (
                      <span className="text-zinc-600 ml-2">•</span>
                    )}
                  </Link>
                ))}
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

      {/* Update the social connections cards to show enabled status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className={`bg-zinc-900 border-zinc-800 p-6 flex flex-col items-center text-center transition-colors cursor-pointer ${agent.clients && Array.isArray(agent.clients) && agent.clients.includes('discord')
          ? 'hover:border-[#5865F2]/50'
          : 'hover:border-pink-500/50'
          }`}>
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <IconBrandDiscord className="w-6 h-6 text-[#5865F2]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Discord Integration</h3>
          <p className="text-sm text-zinc-400 mb-4">Connect your agent with Discord server</p>
          {agent.clients && Array.isArray(agent.clients) && agent.clients.includes('discord') ? (
            <span className="text-green-500 text-sm flex items-center gap-1">
              <Check className="w-4 h-4" /> Connected
            </span>
          ) : (
            <span className="text-red-500 text-sm flex items-center gap-1">
              <Lock className="w-4 h-4" /> Locked
            </span>
          )}
        </Card>

        <Card className={`bg-zinc-900 border-zinc-800 p-6 flex flex-col items-center text-center transition-colors cursor-pointer ${agent.twitter ? 'hover:border-[#1DA1F2]/50' : 'hover:border-pink-500/50'
          }`}>
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <IconBrandTwitter className="w-6 h-6 text-[#1DA1F2]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Twitter Integration</h3>
          <p className="text-sm text-zinc-400 mb-4">Connect your agent with Twitter</p>
          {agent.twitter ? (
            <span className="text-green-500 text-sm flex items-center gap-1">
              <Check className="w-4 h-4" /> Connected
            </span>
          ) : (
            <span className="text-red-500 text-sm flex items-center gap-1">
              <Lock className="w-4 h-4" /> Locked
            </span>
          )}
        </Card>

        <Card className={`bg-zinc-900 border-zinc-800 p-6 flex flex-col items-center text-center transition-colors cursor-pointer ${agent.clients && Array.isArray(agent.clients) && agent.clients.includes('telegram')
          ? 'hover:border-[#0088cc]/50'
          : 'hover:border-pink-500/50'
          }`}>
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <IconBrandTelegram className="w-6 h-6 text-[#0088cc]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Telegram Integration</h3>
          <p className="text-sm text-zinc-400 mb-4">Connect your agent with Telegram</p>
          {agent.clients && Array.isArray(agent.clients) && agent.clients.includes('telegram') ? (
            <span className="text-green-500 text-sm flex items-center gap-1">
              <Check className="w-4 h-4" /> Connected
            </span>
          ) : (
            <span className="text-red-500 text-sm flex items-center gap-1">
              <Lock className="w-4 h-4" /> Locked
            </span>
          )}
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
