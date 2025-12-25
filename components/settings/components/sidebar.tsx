import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { User } from "@/types";
import { LogOut, LucideIcon, Pencil } from "lucide-react";
import { useState } from "react";

export function Sidebar({
  nav,
  activeSection,
  setActiveSection,
  user,
  logout,
}: {
  nav: { key: string; label: string; icon: LucideIcon }[];
  activeSection: string;
  setActiveSection: (section: string) => void;
  user: User;
  logout: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <aside className="hidden md:flex w-64 border-r bg-muted/30 flex-col">
      <div className="flex-1 overflow-y-auto p-2">
        <Button
          variant="ghost"
          className={`flex-1 justify-start gap-2 h-auto px-2 py-1.5 w-full ${
            activeSection === "profiles"
              ? "bg-muted font-medium"
              : "hover:bg-muted/60 text-muted-foreground"
          }`}
          onClick={() => setActiveSection("profiles")}
        >
          <UserAvatar user={user} size="lg" />
          <div className="flex-1 text-left overflow-hidden">
            <div className="text-md font-semibold text-foreground truncate">
              {user.displayName}
            </div>
            <div className="text-muted-foreground truncate flex items-center gap-2">
              <span>Edit Profile</span> <Pencil className="size-3" />
            </div>
          </div>
        </Button>
        <SearchBar
          className="w-full my-4 mb-2"
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <nav className="space-y-1">
          {nav.map((item) => {
            if (item.key === "profiles") return null;
            const Icon = item.icon;
            const active = item.key === activeSection;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                  active
                    ? "bg-muted font-medium"
                    : "hover:bg-muted/60 text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-red-400 hover:text-red-400/90"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
