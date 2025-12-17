import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { AddFriendDialog } from "@/components/direct-chat/components/add-friend-dialog";

type TabType = "online" | "all" | "pending" | "blocked";

interface FriendsHeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pendingRequestsCount: number;
}

export const FriendsHeader = ({
  activeTab,
  setActiveTab,
  pendingRequestsCount,
}: FriendsHeaderProps) => (
  <header className="flex shrink-0 items-center justify-between border-b px-4 py-3">
    <div className="flex items-center gap-4">
      <h1 className="text-base font-semibold flex items-center gap-2">
        <Users className="w-5 h-5" />
        Friends
      </h1>
      <div className="h-6 w-px bg-border" />
      <div className="flex items-center gap-2">
        <Button
          variant={activeTab === "online" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("online")}
          className="h-8"
        >
          Online
        </Button>
        <Button
          variant={activeTab === "all" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("all")}
          className="h-8"
        >
          All
        </Button>
        <Button
          variant={activeTab === "pending" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("pending")}
          className="h-8"
        >
          Pending{" "}
          {pendingRequestsCount > 0 && (
            <Badge
              className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
              variant={"destructive"}
            >
              {pendingRequestsCount}
            </Badge>
          )}
        </Button>
        <AddFriendDialog />
      </div>
    </div>
  </header>
);
