"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";

interface AgentCardProps {
  id: string;
  name: string;
  description: string;
  image?: string;
  bio: string;
}

const DEFAULT_IMAGE = "/assets/anyachan.jpg"

export function AgentCard({
  id,
  name,
  description,
  image,
  bio,
}: AgentCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(id);

  return (
    <Link href={`/agent/${id}`}>
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
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(id);
              }}
            >
              <Heart className={`h-5 w-5 ${favorite ? "fill-current" : ""}`} />
            </Button>
          </div>
          <p className="text-sm text-zinc-300 line-clamp-3">{bio}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
