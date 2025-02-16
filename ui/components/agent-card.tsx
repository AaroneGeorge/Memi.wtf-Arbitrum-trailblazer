"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AgentCardProps } from "@/app/types";
import type { ReactNode } from "react";

export function AgentCard({
  agentProfileId,
  name,
  description,
  image,
  bio,
  className = "",
  imageClassName = "",
}: AgentCardProps) {
  const router = useRouter();
  const { favorites, toggleFavorite } = useFavorites();

  // Handle bio formatting
  const formattedBio: ReactNode = Array.isArray(bio)
    ? bio[0] || "No bio available"
    : typeof bio === "string"
    ? bio
    : "No bio available";

  const handleCardClick = () => {
    router.push(`/agent/${agentProfileId}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        "group bg-zinc-900/90 backdrop-blur border-zinc-800 hover:border-pink-500/50 transition-all duration-300 overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-pink-500/10",
        className
      )}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start gap-4">
          <div className="relative aspect-square h-14 overflow-hidden">
            <Image
              src={image}
              alt={name}
              fill
              className={cn(
                "object-cover transition-transform duration-300 group-hover:scale-105",
                imageClassName
              )}
            />
          </div>
          <div className="flex-1 space-y-1 overflow-hidden">
            <h3 className="font-semibold text-white truncate text-lg">
              {name}
            </h3>
            <p className="text-sm text-zinc-400 truncate">{description}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-pink-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(agentProfileId);
            }}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-all",
                favorites.includes(agentProfileId)
                  ? "fill-current text-pink-500"
                  : "group-hover:text-pink-500/50"
              )}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-zinc-400 line-clamp-2 group-hover:text-zinc-300 transition-colors">
          {formattedBio}
        </p>
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-pink-500 group-hover:text-zinc-300 transition-colors text-xs"
          >
            Chat Now →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
