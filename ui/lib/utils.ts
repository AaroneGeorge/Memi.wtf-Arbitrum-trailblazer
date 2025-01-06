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

export function getImageSrc(imageData: string): string {
  // Check if the image is already a URL
  if (imageData.startsWith('http://') || imageData.startsWith('https://') || imageData.startsWith('/')) {
    return imageData;
  }

  // Check if the base64 string already includes the data URL prefix
  if (imageData.startsWith('data:image')) {
    return imageData;
  }

  // Check if it's a hex string (contains only hex characters)
  if (/^[0-9a-fA-F]+$/.test(imageData)) {
    // Convert hex to binary
    const binary = imageData.match(/.{1,2}/g)?.map(byte => 
      String.fromCharCode(parseInt(byte, 16))
    ).join('') || '';
    
    // Convert binary to base64
    const base64 = btoa(binary);
    
    // Return as data URL
    return `data:image/png;base64,${base64}`;
  }

  // Otherwise, assume it's a base64 string and add the data URL prefix
  return `data:image/jpeg;base64,${imageData}`;
}
