import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const adjectives = ['Brave', 'Swift', 'Clever', 'Mystic', 'Crypto', 'Digital', 'Alpha', 'Beta', 'Noble', 'Quantum'];
const nouns = ['Trader', 'Wizard', 'Pioneer', 'Explorer', 'Hunter', 'Voyager', 'Knight', 'Sage', 'Master', 'Guardian'];

export function generateRandomUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${adjective}${noun}${number}`;
}
