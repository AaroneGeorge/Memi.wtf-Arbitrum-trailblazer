"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, Plus, User, Heart, History } from "lucide-react";

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
        <Link href="/" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">M</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={pathname === route.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start pl-6 mb-1",
                pathname === route.href &&
                  "bg-pink-950 text-pink-50 hover:bg-pink-900"
              )}
              asChild
            >
              <Link href={route.href}>
                <route.icon
                  className={cn(
                    "mr-2 h-5 w-5",
                    pathname === route.href ? "text-pink-200" : "text-zinc-400"
                  )}
                />
                {route.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
