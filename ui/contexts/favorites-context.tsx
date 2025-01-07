"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAccount } from 'wagmi';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

type FavoritesContextType = {
  favorites: string[];
  toggleFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const { address } = useAccount();

  // Fetch favorites when wallet is connected
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!address) {
        setFavorites([]);
        return;
      }

      try {
        const response = await fetch(`${backendUrl}/users/${address}`);
        const data = await response.json();
        setFavorites(data.favourite_agents || []);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setFavorites([]);
      }
    };

    fetchFavorites();
  }, [address]);

  const toggleFavorite = async (id: string) => {
    if (!address) return;

    try {
      // Get current user data
      const userResponse = await fetch(`${backendUrl}/users/${address}`);
      const userData = await userResponse.json();

      // Update favorites list
      const newFavorites = favorites.includes(id)
        ? favorites.filter(fav => fav !== id)
        : [...favorites, id];

      // Update user data on backend
      const response = await fetch(`${backendUrl}/users/${address}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData, // Keep existing user data
          favourite_agents: newFavorites,
        }),
      });

      if (response.ok) {
        setFavorites(newFavorites);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
