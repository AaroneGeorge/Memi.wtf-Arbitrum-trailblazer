"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAccount } from "wagmi";
import { getFavoriteAgents, toggleFavoriteAgent } from "@/lib/firebase/firestore";

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (agentId: string) => Promise<void>;
  isFavorite: (agentId: string) => boolean;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  toggleFavorite: async () => {},
  isFavorite: () => false,
  loading: true
});

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();

  // Load favorites from Firebase when wallet connects
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      try {
        if (isConnected && address) {
          const userFavorites = await getFavoriteAgents(address);
          setFavorites(userFavorites);
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [address, isConnected]);

  const toggleFavorite = async (agentId: string) => {
    if (!isConnected || !address) {
      console.log("Wallet not connected. Cannot toggle favorite.");
      return;
    }

    try {
      const { isFavorite } = await toggleFavoriteAgent(address, agentId);
      
      // Update local state based on the toggle result
      if (isFavorite) {
        setFavorites(prev => [...prev, agentId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== agentId));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const isFavorite = (agentId: string) => {
    return favorites.includes(agentId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};
