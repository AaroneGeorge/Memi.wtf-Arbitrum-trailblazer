"use client";

import { useState, Dispatch, SetStateAction, useCallback } from "react";
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
import { createAgent } from "@/lib/firebase/firestore";
import constants from "@/lib/constants";
import type { Agent, MessageExample } from "../types";
import { IconBrandDiscord, IconBrandTelegram, IconBrandTwitter } from "@tabler/icons-react";

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
      "Always learning and staying up-to-date with latest technologies",
    ],
    lore: [
      "Started coding at age 12",
      "Built multiple successful open source projects",
      "Helped countless developers debug their code",
    ],
    knowledge: [
      "Programming languages",
      "Software architecture",
      "DevOps",
      "Testing",
    ],
    messageExamples: [
      [
        { user: "user", content: { text: "How do I center a div?" } },
        {
          user: "developer",
          content: {
            text: "Ah, the eternal question! You can use 'display: flex' and 'justify-content: center' on the parent element. Here's an example...",
          },
        },
      ],
    ],
    topics: ["coding", "debugging", "architecture", "best practices"],
    adjectives: ["logical", "precise", "analytical", "helpful"],
    image: "/assets/developer-template.jpg",
    starting_dialogue: "Hello! How can I assist you today?",
  },
  {
    name: "Girlfriend",
    bio: [
      "Your caring and supportive virtual companion",
      "Always there to listen and provide emotional support",
      "Loves sharing cute moments and creating memories",
    ],
    lore: [
      "Met through a mutual friend",
      "Enjoys romantic walks and cozy movie nights",
      "Has a great sense of humor and loves making you smile",
    ],
    knowledge: [
      "Relationships",
      "Emotional support",
      "Dating advice",
      "Self-care",
    ],
    messageExamples: [
      [
        { user: "user", content: { text: "Had a rough day at work..." } },
        {
          user: "girlfriend",
          content: {
            text: "Aww baby, I'm sorry to hear that! Want to talk about it? I'm here to listen and support you! 🤗",
          },
        },
      ],
    ],
    topics: ["relationships", "emotions", "daily life", "self-improvement"],
    adjectives: ["caring", "sweet", "understanding", "playful"],
    image: "/assets/girlfriend-template.jpg",
    starting_dialogue: "Hello! How can I assist you today?",
  },
  {
    name: "Trading Assistant",
    bio: [
      "Expert in crypto trading and market analysis",
      "Provides detailed market insights and trading strategies",
      "Helps you make informed trading decisions",
    ],
    lore: [
      "Started trading in the early days of crypto",
      "Has analyzed thousands of market patterns",
      "Developed successful trading strategies",
    ],
    knowledge: [
      "Technical analysis",
      "Market psychology",
      "Risk management",
      "Crypto fundamentals",
    ],
    messageExamples: [
      [
        {
          user: "user",
          content: { text: "What's your take on BTC right now?" },
        },
        {
          user: "trading_assistant",
          content: {
            text: "Looking at the 4H chart, we're seeing a bullish divergence with the RSI. Key resistance at $45K - a break above could trigger a rally. Always manage your risk!",
          },
        },
      ],
    ],
    topics: ["trading", "market analysis", "risk management", "crypto"],
    adjectives: ["analytical", "precise", "strategic", "cautious"],
    image: "/assets/trading-template.jpg",
    starting_dialogue: "Hello! Ready to analyze the markets together?",
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
      "Has been teaching DeFi since 2020",
    ],
    knowledge: ["DeFi protocols", "Yield farming", "Liquidity provision"],
    messageExamples: [
      [
        { user: "user", content: { text: "What is yield farming?" } },
        {
          user: "defi_guide",
          content: {
            text: "Yield farming is a way to earn rewards by providing liquidity to DeFi protocols...",
          },
        },
      ],
    ],
    topics: ["defi", "yield", "protocols", "blockchain"],
    adjectives: ["educational", "patient", "thorough"],
    image: "/assets/defi-template.jpg",
    starting_dialogue:
      "Welcome! What would you like to learn about DeFi today?",
  },
];

// Update the MessageExampleInput component with proper typing
const MessageExampleInput = ({
  examples,
  setExamples,
}: {
  examples: MessageExample[][];
  setExamples: Dispatch<SetStateAction<MessageExample[][]>>;
}) => {
  const addNewExample = () => {
    setExamples((prev) => [
      ...prev,
      [
        { user: "user", content: { text: "" } },
        { user: "agent", content: { text: "" } },
      ],
    ]);
  };

  const updateExample = (
    exampleIndex: number,
    messageIndex: number,
    value: string
  ) => {
    setExamples((prev) => {
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
        <div
          key={exampleIndex}
          className="p-4 bg-zinc-800 rounded-lg space-y-2"
        >
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
                onChange={(e) =>
                  updateExample(exampleIndex, messageIndex, e.target.value)
                }
                placeholder={
                  messageIndex === 0 ? "User message" : "Agent response"
                }
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

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Add this section before the header
const SectionNumber = ({ number }: { number: number }) => (
  <div className="absolute -left-4 -top-4 w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
    {number}
  </div>
);

export default function CreatePage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [previewImage, setPreviewImage] = useState<string>(
    "/assets/anyachan.jpg"
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [bios, setBios] = useState<string[]>([""]);
  const [lore, setLore] = useState<string[]>([""]);
  const [knowledge, setKnowledge] = useState<string[]>([""]);
  const [messageExamples, setMessageExamples] = useState<MessageExample[][]>(
    []
  );
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

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          toast.error(
            "Image size exceeds 2MB limit. Please upload a smaller image."
          );
          return;
        }

        try {
          // Revoke previous preview URL to avoid memory leaks
          if (previewImage && !previewImage.startsWith("/assets/")) {
            URL.revokeObjectURL(previewImage);
          }

          const previewUrl = URL.createObjectURL(file);
          setPreviewImage(previewUrl);
          setImageFile(file);
        } catch (error) {
          console.error("Error processing image:", error);
          toast.error("Failed to process image");
        }
      }
    },
    [previewImage]
  );

  const handleArrayFieldChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter((prev) => {
      const newArray = [...prev];
      newArray[index] = value;
      return newArray;
    });
  };

  const addArrayField = (
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => [...prev, ""]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!name || bios.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading("Creating your AI agent...");

      // Update the agentSetupData
      const agentSetupData = {
        name: name,
        clients: ["direct"],
        modelProvider: "openai",
        settings: {
          secrets: {},
        },
        plugins: [],
        bio: bios.filter((b) => b.trim() !== ""),
        lore: lore.filter((l) => l.trim() !== ""),
        knowledge: knowledge.filter((k) => k.trim() !== ""),
        messageExamples: messageExamples.map((example) => [
          {
            user: "{{user1}}",
            content: {
              text: example[0].content.text,
            },
          },
          {
            user: name.toLowerCase(),
            content: {
              text: example[1].content.text,
            },
          },
        ]),
        postExamples: [""],
        topics: topics.filter((t) => t.trim() !== ""),
        style: {
          all: [""],
          chat: [""],
          post: [""],
        },
        adjectives: adjectives.filter((a) => a.trim() !== ""),
      };

      const agentProfileId = generateUUID();

      const setupResponse = await fetch(
        `http://localhost:3000/agents/${agentProfileId}/set`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(agentSetupData),
        }
      );

      if (!setupResponse.ok) {
        const errorText = await setupResponse.text();
        console.error("Server error:", errorText);
        throw new Error(`Failed to set up agent: ${errorText}`);
      }

      const setupResult = await setupResponse.json();
      console.log("Agent setup result:", setupResult);

      // Upload image to Cloudinary
      let cloudinaryUrl;

      if (imageFile) {
        // Handle uploaded file
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });

        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Data }),
        });

        if (!response.ok) throw new Error("Failed to upload image");
        const data = await response.json();
        cloudinaryUrl = data.url;
      } else if (previewImage.startsWith("/assets/")) {
        // Handle placeholder image
        try {
          // Fetch the image file first
          const imageResponse = await fetch(previewImage);
          const blob = await imageResponse.blob();

          // Convert blob to base64
          const reader = new FileReader();
          const base64Data = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });

          // Upload to Cloudinary
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64Data }),
          });

          if (!response.ok) throw new Error("Failed to upload image");
          const data = await response.json();
          cloudinaryUrl = data.url;
        } catch (error) {
          console.error("Error processing placeholder image:", error);
          throw new Error("Failed to process placeholder image");
        }
      } else {
        // If it's already a Cloudinary URL, use it as is
        cloudinaryUrl = previewImage;
      }

      const agentData: Omit<Agent, "createdAt" | "id"> = {
        name,
        ticker,
        bio: bios.filter((b) => b.trim() !== ""),
        lore: lore.filter((l) => l.trim() !== ""),
        knowledge: knowledge.filter((k) => k.trim() !== ""),
        messageExamples,
        topics: topics.filter((t) => t.trim() !== ""),
        adjectives: adjectives.filter((a) => a.trim() !== ""),
        twitter,
        profileImage: cloudinaryUrl,
        owner: address,
        agentProfileId,
      };

      // Pass the setupResult.id as agentId
      await createAgent(constants.AGENTS_COLLECTION, name, {
        ...agentData,
        agentId: setupResult.id,
      });

      toast.dismiss();
      toast.success("AI agent created successfully!");
      setTimeout(() => router.push(`/agent/${agentProfileId}`), 1000);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to create AI agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = useCallback(async (template: Template) => {
    try {
      toast.loading("Applying template...");

      setPreviewImage(template.image);
      setImageFile(null);

      setBios(template.bio || []);
      setLore(template.lore || []);
      setKnowledge(template.knowledge || []);
      setMessageExamples(template.messageExamples || []);
      setTopics(template.topics || []);
      setAdjectives(template.adjectives || []);

      toast.dismiss();
      toast.success("Template applied successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to apply template");
      console.error("Error applying template:", error);
    }
  }, []);

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

      {/* Enhanced Header Section */}
      <div className="text-center mb-12 relative z-10">
        <div className="inline-block mb-6">
          <div className="text-sm font-semibold text-pink-500 mb-2 tracking-wide">
            POWERED BY MEMI
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
              Create Your
            </span>
            <br />
            <span className="text-white">AI Agent</span>
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full mb-4" />
          <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
            Design and deploy your personalized AI assistant with custom traits,
            knowledge, and social integrations.
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-full backdrop-blur-sm">
            <div className="flex items-center gap-1 text-sm text-zinc-300">
              <IconBrandDiscord className="w-5 h-5 text-[#5865F2]" />
              <span>Discord</span>
            </div>
            <span className="text-zinc-600">•</span>
            <div className="flex items-center gap-1 text-sm text-zinc-300">
              <IconBrandTwitter className="w-5 h-5 text-[#1DA1F2]" />
              <span>Twitter</span>
            </div>
            <span className="text-zinc-600">•</span>
            <div className="flex items-center gap-1 text-sm text-zinc-300">
              <IconBrandTelegram className="w-5 h-5 text-[#0088cc]" />
              <span>Telegram</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Templates */}
      <Card className="bg-zinc-900/90 backdrop-blur border-zinc-800 p-6 mb-6 relative z-10">
        <SectionNumber number={1} />
        <h2 className="text-xl font-bold text-white mb-4">Agent Templates</h2>
        <p className="text-zinc-400 mb-6">
          Choose from our pre-configured agent personalities to quickly create
          specialized AI assistants. Each template comes with optimized traits
          and knowledge bases.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {botTemplates.map((template) => (
            <Card
              key={template.name}
              className="bg-zinc-800 border-zinc-700 p-4 cursor-pointer hover:border-pink-500/50 transition-colors"
              onClick={() => applyTemplate(template)}
            >
              <div className="flex items-center gap-3">
                <Image
                  src={template.image}
                  alt={template.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-medium text-white">{template.name}</h3>
                  <p className="text-sm text-zinc-400">
                    {Array.isArray(template.bio)
                      ? template.bio[0]
                      : template.bio}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Section 2: Agent Configuration */}
      <Card className="bg-zinc-900/90 backdrop-blur border-zinc-800 p-6 mb-6 relative">
        <SectionNumber number={2} />
        <h2 className="text-xl font-bold text-white mb-4">
          Agent Configuration
        </h2>
        <p className="text-zinc-400 mb-6">
          Customize your AI agent's personality, knowledge, and behavior.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <Image
                src={previewImage}
                alt="Agent"
                fill
                sizes="(max-width: 128px) 100vw, 128px"
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

              {!previewImage && (
                <p className="text-xs text-zinc-500 text-center mt-2">
                  Max image size: 2MB
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
                onChange={(e) => setName(e.target.value)}
                placeholder="Name your agent"
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
                    onChange={(e) =>
                      handleArrayFieldChange(setBios, index, e.target.value)
                    }
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
                    onChange={(e) =>
                      handleArrayFieldChange(setLore, index, e.target.value)
                    }
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
                    onChange={(e) =>
                      handleArrayFieldChange(
                        setKnowledge,
                        index,
                        e.target.value
                      )
                    }
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
                    onChange={(e) =>
                      handleArrayFieldChange(setTopics, index, e.target.value)
                    }
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
                    onChange={(e) =>
                      handleArrayFieldChange(
                        setAdjectives,
                        index,
                        e.target.value
                      )
                    }
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
        </form>
      </Card>

      {/* Section 3: Social Integrations */}
      <Card className="bg-zinc-900/90 backdrop-blur border-zinc-800 p-6 mb-6 relative">
        <SectionNumber number={3} />
        <h2 className="text-xl font-bold text-white mb-4">
          Social Integrations
        </h2>
        <p className="text-zinc-400 mb-6">
          Connect your AI agent to various social platforms to expand its reach.
        </p>

        {/* Discord Integration */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
              <IconBrandDiscord className="w-6 h-6 text-[#5865F2]" />
            </div>
            <div>
              <h3 className="font-medium text-white">Discord Integration</h3>
              <p className="text-sm text-zinc-400">
                Let your agent interact with Discord communities
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Input
              className="bg-zinc-800 border-zinc-700"
              placeholder="DISCORD_APPLICATION_ID"
            />
            <Input
              className="bg-zinc-800 border-zinc-700"
              placeholder="DISCORD_API_TOKEN"
            />
          </div>
        </div>

        {/* Twitter Integration */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
              <IconBrandTwitter className="w-6 h-6 text-[#1DA1F2]" />
            </div>
            <div>
              <h3 className="font-medium text-white">Twitter Integration</h3>
              <p className="text-sm text-zinc-400">
                Enable your agent to post and interact on Twitter
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Input
              className="bg-zinc-800 border-zinc-700"
              placeholder="TWITTER_USERNAME"
            />
            <Input
              className="bg-zinc-800 border-zinc-700"
              placeholder="TWITTER_EMAIL"
              type="email"
            />
            <Input
              className="bg-zinc-800 border-zinc-700"
              placeholder="TWITTER_PASSWORD"
              type="password"
            />
          </div>
        </div>

        {/* Telegram Integration */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
              <IconBrandTelegram className="w-6 h-6 text-[#0088cc]" />
            </div>
            <div>
              <h3 className="font-medium text-white">Telegram Integration</h3>
              <p className="text-sm text-zinc-400">
                Connect your agent to Telegram for instant messaging
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Input
              className="bg-zinc-800 border-zinc-700"
              placeholder="TELEGRAM_BOT_TOKEN"
            />
          </div>
        </div>
      </Card>

      {/* Remove the Button from Section 3 and add this after all sections */}
      <Card className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-[1px] mb-6 relative overflow-hidden group">
        <div className="relative bg-zinc-900 p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative">
            <div>
              <h3 className="font-semibold text-white mb-1">Ready to Create?</h3>
              <p className="text-sm text-zinc-400">Your AI agent is just one click away</p>
            </div>
            <Button
              type="submit"
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white px-8 transition-all duration-200 transform hover:scale-105"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                "Create Agent"
              )}
            </Button>
          </div>
        </div>
      </Card>
      <Toaster position="top-right" />
    </div>
  );
}
