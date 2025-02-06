"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bot } from "@/lib/types";

interface EditBotModalProps {
  bot: Bot;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export function EditBotModal({ bot, isOpen, onClose, onSuccess }: EditBotModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: bot.name,
    bio: bot.bio,
    personality: bot.personality,
    starting_dialogue: bot.starting_dialogue,
    ticker_symbol: bot.ticker_symbol,
    contract_address: bot.contract_address,
    ticker: bot.ticker,
    creator: bot.creator,
    twitter: bot.twitter || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${backendUrl}/bots/${bot.name}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        console.error("Failed to update bot");
      }
    } catch (error) {
      console.error("Error updating bot:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Edit Agent: {bot.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter Handle</Label>
              <Input
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700"
                placeholder="@username"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticker_symbol">Ticker Symbol</Label>
                <Input
                  id="ticker_symbol"
                  name="ticker_symbol"
                  value={formData.ticker_symbol}
                  onChange={handleChange}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="ETH"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticker">Ticker</Label>
                <Input
                  id="ticker"
                  name="ticker"
                  value={formData.ticker}
                  onChange={handleChange}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="ETH/USD"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_address">Contract Address</Label>
              <Input
                id="contract_address"
                name="contract_address"
                value={formData.contract_address}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700"
                placeholder="0x..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personality">Personality</Label>
              <Textarea
                id="personality"
                name="personality"
                value={formData.personality}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700 min-h-[60px]"
                placeholder="Describe the agent's personality..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700 min-h-[60px]"
                placeholder="Write a brief bio..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="starting_dialogue">Starting Dialogue</Label>
              <Textarea
                id="starting_dialogue"
                name="starting_dialogue"
                value={formData.starting_dialogue}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700 min-h-[60px]"
                placeholder="Enter the initial greeting..."
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-700 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-pink-500 hover:bg-pink-600"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 