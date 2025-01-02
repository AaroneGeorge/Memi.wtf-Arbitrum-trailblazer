"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    name: string;
    walletAddress: string;
  };
  onSave: (profile: { name: string; walletAddress: string }) => void;
}

export function ProfileDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: ProfileDialogProps) {
  const [name, setName] = useState(profile.name);
  const [walletAddress, setWalletAddress] = useState(profile.walletAddress);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">Username</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">
              Wallet Address
            </label>
            <Input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => {
              onSave({ name, walletAddress });
              onOpenChange(false);
            }}
            className="bg-pink-600 hover:bg-pink-700"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
