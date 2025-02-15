"use client";

import { useState, Dispatch, SetStateAction } from "react";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus } from "lucide-react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import WalletConnectButton from "@/components/wallet-connect-button";
import { HoverTooltip } from "@/components/hover-tooltip";
import Squares from "@/components/Squares";
import { generateRandomUsername } from "@/lib/utils";

// Define MessageExample type to avoid repetition
type MessageExample = {
  user: string;
  content: {
    text: string;
  };
};

// First, let's define an interface for our template structure
interface Template {
  name: string;
  bio: string[];
  lore: string[];
  knowledge: string[];
  messageExamples: MessageExample[][];
  topics: string[];
  adjectives: string[];
  image: string;
  starting_dialogue: string;
}

// Update the botTemplates array to match the interface
const botTemplates: Template[] = [
  {
    name: "Developer",
    bio: [
      "Expert software developer with full-stack experience",
      "Passionate about clean code and best practices",
      "Always learning and staying up-to-date with latest technologies"
    ],
    lore: [
      "Started coding at age 12",
      "Built multiple successful open source projects",
      "Helped countless developers debug their code"
    ],
    knowledge: ["Programming languages", "Software architecture", "DevOps", "Testing"],
    messageExamples: [
      [
        { user: "user", content: { text: "How do I center a div?" } },
        { user: "developer", content: { text: "Ah, the eternal question! You can use 'display: flex' and 'justify-content: center' on the parent element. Here's an example..." } }
      ]
    ],
    topics: ["coding", "debugging", "architecture", "best practices"],
    adjectives: ["logical", "precise", "analytical", "helpful"],
    image: "/assets/developer-template.jpg",
    starting_dialogue: "Hello! How can I assist you today?"
  },
  {
    name: "Girlfriend",
    bio: [
      "Your caring and supportive virtual companion",
      "Always there to listen and provide emotional support",
      "Loves sharing cute moments and creating memories"
    ],
    lore: [
      "Met through a mutual friend",
      "Enjoys romantic walks and cozy movie nights",
      "Has a great sense of humor and loves making you smile"
    ],
    knowledge: ["Relationships", "Emotional support", "Dating advice", "Self-care"],
    messageExamples: [
      [
        { user: "user", content: { text: "Had a rough day at work..." } },
        { user: "girlfriend", content: { text: "Aww baby, I'm sorry to hear that! Want to talk about it? I'm here to listen and support you! 🤗" } }
      ]
    ],
    topics: ["relationships", "emotions", "daily life", "self-improvement"],
    adjectives: ["caring", "sweet", "understanding", "playful"],
    image: "/assets/girlfriend-template.jpg",
    starting_dialogue: "Hello! How can I assist you today?"
  },
  {
    name: "Trading Assistant",
    bio: [
      "Expert in crypto trading and market analysis",
      "Provides detailed market insights and trading strategies",
      "Helps you make informed trading decisions"
    ],
    lore: [
      "Started trading in the early days of crypto",
      "Has analyzed thousands of market patterns",
      "Developed successful trading strategies"
    ],
    knowledge: ["Technical analysis", "Market psychology", "Risk management", "Crypto fundamentals"],
    messageExamples: [
      [
        { user: "user", content: { text: "What's your take on BTC right now?" } },
        { user: "trading_assistant", content: { text: "Looking at the 4H chart, we're seeing a bullish divergence with the RSI. Key resistance at $45K - a break above could trigger a rally. Always manage your risk!" } }
      ]
    ],
    topics: ["trading", "market analysis", "risk management", "crypto"],
    adjectives: ["analytical", "precise", "strategic", "cautious"],
    image: "/assets/trading-template.jpg",
    starting_dialogue: "Hello! Ready to analyze the markets together?"
  },
  {
    name: "DeFi Guide",
    bio: [
      "Your personal guide to decentralized finance",
      "Expert in DeFi protocols and strategies",
    ],
    lore: [
      "Started in traditional finance",
      "Discovered crypto in 2015",
      "Has been teaching DeFi since 2020"
    ],
    knowledge: ["DeFi protocols", "Yield farming", "Liquidity provision"],
    messageExamples: [
      [
        { user: "user", content: { text: "What is yield farming?" } },
        { user: "defi_guide", content: { text: "Yield farming is a way to earn rewards by providing liquidity to DeFi protocols..." } }
      ]
    ],
    topics: ["defi", "yield", "protocols", "blockchain"],
    adjectives: ["educational", "patient", "thorough"],
    image: "/assets/defi-template.jpg",
    starting_dialogue: "Welcome! What would you like to learn about DeFi today?"
  }
];

// Update the MessageExampleInput component with proper typing
const MessageExampleInput = ({ 
  examples,
  setExamples
}: {
  examples: MessageExample[][];
  setExamples: Dispatch<SetStateAction<MessageExample[][]>>;
}) => {
  const addNewExample = () => {
    setExamples(prev => [...prev, [
      { user: "user", content: { text: "" } },
      { user: "agent", content: { text: "" } }
    ]]);
  };

  const updateExample = (exampleIndex: number, messageIndex: number, value: string) => {
    setExamples(prev => {
      const newExamples = [...prev];
      newExamples[exampleIndex][messageIndex].content.text = value;
      return newExamples;
    });
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-zinc-200">
        Message Examples <span className="text-red-500">*</span>
      </label>
      {examples.map((example, exampleIndex) => (
        <div key={exampleIndex} className="p-4 bg-zinc-800 rounded-lg space-y-2">
          {example.map((message, messageIndex) => (
            <div key={messageIndex} className="flex gap-2">
              <div className="w-24 flex-shrink-0">
                <Input
                  className="bg-zinc-700 border-zinc-600"
                  value={message.user}
                  disabled
                />
              </div>
              <Input
                className="bg-zinc-700 border-zinc-600 flex-grow"
                value={message.content.text}
                onChange={(e) => updateExample(exampleIndex, messageIndex, e.target.value)}
                placeholder={messageIndex === 0 ? "User message" : "Agent response"}
              />
            </div>
          ))}
        </div>
      ))}
      <Button
        type="button"
        onClick={addNewExample}
        className="bg-zinc-700 hover:bg-zinc-600 w-full"
      >
        Add Example Conversation
      </Button>
    </div>
  );
};

export default function CreatePage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [image, setImage] = useState<string>("/assets/anyachan.jpg");
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [bios, setBios] = useState<string[]>([""]);
  const [lore, setLore] = useState<string[]>([""]);
  const [knowledge, setKnowledge] = useState<string[]>([""]);
  const [messageExamples, setMessageExamples] = useState<MessageExample[][]>([]);
  const [topics, setTopics] = useState<string[]>([""]);
  const [adjectives, setAdjectives] = useState<string[]>([""]);
  const [twitter, setTwitter] = useState("memionarb");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateName = (value: string) => {
    return value.replace(/[^a-zA-Z0-9]/g, "");
  };

  const validateTicker = (value: string) => {
    return value.replace(/[\$]/g, "");
  };

  const validateTwitter = (value: string) => {
    return value.replace(/[@]/g, "");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error(
          "Image size exceeds 1MB limit. Please upload an image less than 1MB.",
          {
            duration: 2500,
          },
        );
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArrayFieldChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter(prev => {
      const newArray = [...prev];
      newArray[index] = value;
      return newArray;
    });
  };

  const addArrayField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, ""]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!name || bios.length === 0 || lore.length === 0 || knowledge.length === 0 || 
        topics.length === 0 || adjectives.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!image) {
      toast.error("Please upload an agent image");
      return;
    }

    const agentData = {
      name,
      ticker,
      bio: bios.filter(b => b.trim() !== ""),
      lore: lore.filter(l => l.trim() !== ""),
      knowledge: knowledge.filter(k => k.trim() !== ""),
      messageExamples,
      topics: topics.filter(t => t.trim() !== ""),
      adjectives: adjectives.filter(a => a.trim() !== ""),
      twitter,
      image
    };

    // Log the complete agent data
    console.log("Creating Agent with data:", JSON.stringify(agentData, null, 2));

    try {
      setIsSubmitting(true);
      toast.loading("Creating your AI agent...");
      
      // Simulate success after 2 seconds
      setTimeout(() => {
        toast.dismiss();
        toast.success("AI agent created successfully!", {
          duration: 5000,
        });

        // Reset form
        setImage("/assets/anyachan.jpg");
        setName("");
        setTicker("");
        setBios([""]);
        setLore([""]);
        setKnowledge([""]);
        setMessageExamples([]);
        setTopics([""]);
        setAdjectives([""]);
        setTwitter("");

        // Redirect to home
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }, 2000);

    } catch (error: any) {
      console.error("Error creating AI agent:", error);
      toast.error(error.message || "Failed to create AI agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (template: Template) => {
    setBios(template.bio || []);
    setLore(template.lore || []);
    setKnowledge(template.knowledge || []);
    setMessageExamples(template.messageExamples || []);
    setTopics(template.topics || []);
    setAdjectives(template.adjectives || []);
    setImage(template.image);
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6 max-w-2xl h-[80vh] flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <Squares
            speed={0.5}
            squareSize={40}
            direction="diagonal"
            borderColor="#fff"
            hoverFillColor="#222"
          />
        </div>
        <Card className="bg-zinc-900 border-zinc-700 p-6 text-center z-10">
          <h1 className="text-2xl font-bold text-white mb-6 z-10">
            Create AI Agent
          </h1>
          <p className="text-zinc-400 mb-6">
            Please connect your wallet to create an AI agent
          </p>
          <WalletConnectButton />
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="fixed inset-0">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#fff"
          hoverFillColor="#222"
        />
      </div>
      <Card className="bg-zinc-900/90 backdrop-blur border-zinc-800 p-6 relative z-10">
        <h1 className="text-2xl font-bold text-white mb-6">Create AI Agent</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <Image
                src={image}
                alt="Agent"
                fill
                className="rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 bg-zinc-800 rounded-full p-2 cursor-pointer hover:bg-pink-500/50 transition-colors">
                <ImagePlus className="h-4 w-4 text-zinc-200" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              {!image && (
                <p className="text-xs text-zinc-500 text-center mt-2">
                  Max image size: 50KB
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-200">
                Agent Name <span className="text-red-500">*</span>
              </label>
              <Input
                required
                className="bg-zinc-800 border-zinc-700"
                value={name}
                onChange={(e) => setName(validateName(e.target.value))}
                placeholder="Use only letters and numbers"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-200">
                Ticker <span className="text-red-500">*</span>
              </label>
              <Input
                required
                className="bg-zinc-800 border-zinc-700"
                placeholder="SYMBOL"
                value={ticker}
                onChange={(e) => setTicker(validateTicker(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-200">
                Bio Entries <span className="text-red-500">*</span>
              </label>
              {bios.map((bio, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    required
                    className="bg-zinc-800 border-zinc-700"
                    value={bio}
                    onChange={(e) => handleArrayFieldChange(setBios, index, e.target.value)}
                  />
                  {index === bios.length - 1 && (
                    <Button
                      type="button"
                      onClick={() => addArrayField(setBios)}
                      className="bg-zinc-700 hover:bg-zinc-600"
                    >
                      +
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-200">
                Lore <span className="text-red-500">*</span>
              </label>
              {lore.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    required
                    className="bg-zinc-800 border-zinc-700"
                    value={item}
                    onChange={(e) => handleArrayFieldChange(setLore, index, e.target.value)}
                  />
                  {index === lore.length - 1 && (
                    <Button
                      type="button"
                      onClick={() => addArrayField(setLore)}
                      className="bg-zinc-700 hover:bg-zinc-600"
                    >
                      +
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-200">
                Knowledge <span className="text-red-500">*</span>
              </label>
              {knowledge.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    required
                    className="bg-zinc-800 border-zinc-700"
                    value={item}
                    onChange={(e) => handleArrayFieldChange(setKnowledge, index, e.target.value)}
                  />
                  {index === knowledge.length - 1 && (
                    <Button
                      type="button"
                      onClick={() => addArrayField(setKnowledge)}
                      className="bg-zinc-700 hover:bg-zinc-600"
                    >
                      +
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-200">
                Topics <span className="text-red-500">*</span>
              </label>
              {topics.map((topic, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    required
                    className="bg-zinc-800 border-zinc-700"
                    value={topic}
                    onChange={(e) => handleArrayFieldChange(setTopics, index, e.target.value)}
                  />
                  {index === topics.length - 1 && (
                    <Button
                      type="button"
                      onClick={() => addArrayField(setTopics)}
                      className="bg-zinc-700 hover:bg-zinc-600"
                    >
                      +
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-200">
                Adjectives <span className="text-red-500">*</span>
              </label>
              {adjectives.map((adj, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    required
                    className="bg-zinc-800 border-zinc-700"
                    value={adj}
                    onChange={(e) => handleArrayFieldChange(setAdjectives, index, e.target.value)}
                  />
                  {index === adjectives.length - 1 && (
                    <Button
                      type="button"
                      onClick={() => addArrayField(setAdjectives)}
                      className="bg-zinc-700 hover:bg-zinc-600"
                    >
                      +
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-200 flex items-center">
                Twitter <span className="text-red-500">*</span>
                <HoverTooltip content="Twitter username of the agent" />
              </label>
              <Input
                required
                className="bg-zinc-800 border-zinc-700"
                placeholder="username"
                value={twitter}
                onChange={(e) => setTwitter(validateTwitter(e.target.value))}
              />
            </div>
            <MessageExampleInput 
              examples={messageExamples}
              setExamples={setMessageExamples}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Agent"}
          </Button>
        </form>
      </Card>
      <Card className="bg-zinc-900/90 backdrop-blur border-zinc-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Templates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {botTemplates.map((template) => (
            <Card 
              key={template.name}
              className="bg-zinc-800 border-zinc-700 p-4 cursor-pointer hover:border-pink-500/50 transition-colors"
              onClick={() => applyTemplate(template)}
            >
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-medium text-white">{template.name}</h3>
                  <p className="text-sm text-zinc-400">
                    {Array.isArray(template.bio) ? template.bio[0] : template.bio}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
      <Toaster position="top-right" />
    </div>
  );
}
