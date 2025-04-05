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
  owner,
  creatorName,
}: AgentCardProps) {
  const router = useRouter();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Check if this agent is favorited
  const isFavorited = isFavorite
    ? isFavorite(agentProfileId)
    : favorites.includes(agentProfileId);

  // Handle bio formatting
  const formattedBio: ReactNode = Array.isArray(bio)
    ? bio[0] || "No bio available"
    : typeof bio === "string"
    ? bio
    : "No bio available";

  // Format the description to show "Created by username" or "Created by wallet address"
  const formattedDescription =
    description ||
    (creatorName
      ? `Created by ${creatorName}`
      : owner
      ? `Created by ${owner.slice(0, 6)}...${owner.slice(-4)}`
      : "Unknown creator");

  const handleCardClick = () => {
    router.push(`/agent/${agentProfileId}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        "group bg-zinc-900/90 backdrop-blur border-zinc-800 hover:border-[#f78da7] transition-all duration-300 overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-[#f78da7]/10",
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
            <p className="text-sm text-zinc-400 truncate">
              {formattedDescription}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "transition-colors",
              isFavorited
                ? "text-pink-500 hover:text-pink-400"
                : "text-zinc-400 hover:text-[#f78da7]"
            )}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(agentProfileId);
            }}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-all duration-300",
                isFavorited
                  ? "fill-current animate-pulse" // Add animation for filled heart
                  : "group-hover:text-[#f78da7] hover:scale-150"
              )}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-zinc-400 line-clamp-2 group-hover:text-zinc-300 transition-colors">
          {formattedBio}
        </p>
        <div className="mt-4 flex justify-between items-center">
          {/* Show a small label for favorited agents */}
          {isFavorited && (
            <span className="text-xs text-[#f78da7] flex items-center">
              <Heart className="h-3 w-3 fill-current mr-1" /> Favorited
            </span>
          )}
          <div className={isFavorited ? "ml-auto" : ""}>
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-[#f78da7] group-hover:text-zinc-300 transition-colors text-xs"
            >
              Chat Now →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
