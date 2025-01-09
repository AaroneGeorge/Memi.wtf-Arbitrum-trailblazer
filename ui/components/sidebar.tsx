"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, Plus, User, Heart, History, User2 } from "lucide-react";
import DecryptedText from "./DecryptedText";

const routes = [
  {
    label: "Home",
    icon: Home,
    href: "/",
  },
  {
    label: "Create Agent",
    icon: Plus,
    href: "/create",
  },
  {
    label: "Profile",
    icon: User,
    href: "/profile",
  },
  {
    label: "Favourites",
    icon: Heart,
    href: "/favourites",
  },
  {
    label: "Chat History",
    icon: History,
    href: "/history",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-zinc-950 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-5">
          {/* similar gif urls; */}
          {/* https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbms0bmI5aTIxaGQ2bnFieDk4cDFmNWZuZXdtcjljZGsydjA1eDczZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/d3QPCL3xEdTgc/giphy.gif
              https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWNtbG96eGFzNDF2Mm05ZzA3czk5am8xMm4zOGxhZTdsOTNoYWZuciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/GwqWjjJsCV5NS/giphy.gif
              https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXBhNjBkaDZqY2x0eGVjY2lyNzZiOXpldTN3dnEwb3YwbmgwaXgxZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/WAyw8s7sq1v6U/giphy.gif
              https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcW5jbzcyMnhleHpteWt0ZWR1eXduNDhoMXB3Nnk4ZTZ3eXZxcm81ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/SdvbTgJsHmsZa/giphy.gif
              https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjZjdHdtNHkwMm9udmlrMWkwNXkwa2lsOWR3Nm10Z2kwaHF2ajF0ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/4QZK21zlzVIyc/giphy.gif
              https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMW5pNXF2OGdqbmM2dHJkbW5kOHY2cnJqY2o5Z2tjejF6bDBwMm1qMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/Ok4B0vEAQItI4/giphy.gif 
          */}
          <Image
            src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcW5jbzcyMnhleHpteWt0ZWR1eXduNDhoMXB3Nnk4ZTZ3eXZxcm81ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/SdvbTgJsHmsZa/giphy.gif"
            alt="Logo"
            width={100}
            height={100}
          />
        </Link>
        <div className="space-y-4">
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start pl-6 mb-1",
                  pathname === route.href &&
                    "bg-[#f78da7] text-pink-50 hover:bg-[#d87590]"
                )}
                asChild
              >
                <Link href={route.href}>
                  <route.icon
                    className={cn(
                      "mr-2 h-5 w-5",
                      pathname === route.href
                        ? "text-pink-200"
                        : "text-zinc-400"
                    )}
                  />
                  <DecryptedText text={route.label} />
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
