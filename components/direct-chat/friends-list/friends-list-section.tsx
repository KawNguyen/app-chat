import { EmptyState } from "./empty-state";
import { FriendItem } from "./friend-item";

type TabType = "online" | "all" | "pending" | "blocked";

interface Friend {
  id: string;
  userName: string | null;
  displayName: string | null;
  image: string | null;
  status: string;
  customStatus?: string | null;
}

interface FriendsListSectionProps {
  friends: Friend[];
  activeTab: TabType;
  onlineCount: number;
  getUserStatus: (userId: string) => string | undefined;
  onCreateConversation: (friendId: string) => void;
  isCreatingConversation: boolean;
}

export const FriendsListSection = ({
  friends,
  activeTab,
  onlineCount,
  getUserStatus,
  onCreateConversation,
  isCreatingConversation,
}: FriendsListSectionProps) => (
  <>
    <h2 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
      {activeTab === "online"
        ? `Online — ${onlineCount}`
        : `All Friends — ${friends.length}`}
    </h2>

    {friends.length === 0 ? (
      <EmptyState message="No one around to play with Wumpus." />
    ) : (
      <div className="space-y-1">
        {friends.map((friend) => {
          const currentStatus = getUserStatus(friend.id) || friend.status;
          return (
            <FriendItem
              key={friend.id}
              friend={friend}
              currentStatus={currentStatus}
              onMessage={() => onCreateConversation(friend.id)}
              isCreatingConversation={isCreatingConversation}
            />
          );
        })}
      </div>
    )}
  </>
);
