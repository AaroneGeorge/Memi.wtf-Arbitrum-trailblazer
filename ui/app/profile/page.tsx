"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileDialog } from "@/components/profile-dialog";
import { Edit2 } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Alpha Trader",
    walletAddress: "0x1234...5678",
  });
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="border-pink-800 text-pink-100 hover:bg-pink-950"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Name</label>
            <div className="text-lg font-medium text-white">{profile.name}</div>
          </div>
          <div>
            <label className="text-sm text-zinc-400">Wallet Address</label>
            <div className="text-lg font-medium text-white">
              {profile.walletAddress}
            </div>
          </div>
        </div>

        <ProfileDialog
          open={isEditing}
          onOpenChange={setIsEditing}
          profile={profile}
          onSave={setProfile}
        />
      </Card>
    </div>
  );
}
