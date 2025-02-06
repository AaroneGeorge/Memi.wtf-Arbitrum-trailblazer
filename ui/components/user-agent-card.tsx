"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { EditBotModal } from "./edit-bot-modal";

interface UserAgentCardProps {
  id: string;
  name: string;
  description: string;
  ticker: string;
  bio: string;
  personality: string;
  image: string;
  startingDialogue: string;
  price: number;
  marketCap: number;
  volume: number;
  change: number;
  creator: string;
  contract: string;
  twitter: string;
  onEdit: () => void;
}

const DEFAULT_IMAGE = "/assets/anyachan.jpg"

export function UserAgentCard({
  id,
  name,
  description,
  image,
  bio,
  personality,
  startingDialogue,
  ticker,
  creator,
  contract,
  twitter,
  onEdit,
}: UserAgentCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditSuccess = () => {
    // Refresh the page or update the bot list
    onEdit();
  };

  return (
    <>
      <Card className="bg-zinc-900 border-zinc-800 hover:border-pink-500/50 transition-colors h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12">
                <Image
                  src={image || DEFAULT_IMAGE}
                  alt={name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{name}</h3>
                <p className="text-sm text-zinc-400">{description}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-pink-500"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Pencil className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-zinc-300 line-clamp-3">{bio}</p>
        </CardContent>
      </Card>

      <EditBotModal
        bot={{
          name,
          bio,
          personality,
          starting_dialogue: startingDialogue,
          ticker_symbol: ticker,
          contract_address: contract,
          ticker,
          creator,
          twitter,
        }}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
