"use client";

import { Suspense, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Video, UserPlus, CircleUser } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { trpc } from "@/lib/trpc/react";
import { ChatArea } from "./components/chat-area";
import { DirectMessageProfile } from "./components/direct-message-profile";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { MessageInput } from "../message-input";
import { Conversation, DirectMessage, User } from "@/types";
import { useCurrentUser } from "@/providers/user-provider";
import { useFriendActions } from "@/hooks/use-friend-actions";

interface DirectChatContainerProps {
  initData: Conversation;
  conversationId: string;
}

export default function DirectChatContainer({
  initData,
  conversationId,
}: DirectChatContainerProps) {
  const [collapsed, setCollapsed] = useState(true);
  const memberPanelRef = useRef<ImperativePanelHandle>(null);
  const { user } = useCurrentUser();

  const sendMessage = trpc.conversation.sendConversationMessage.useMutation();

  const handleSendMessage = (content: string) => {
    sendMessage.mutate({ conversationId, content });
  };

  const otherUser = initData?.participants.find((p) => p.userId !== user?.id)
    ?.user as User;

  const displayName = otherUser?.displayName || otherUser?.userName || "User";

  const { data: conversationData } =
    trpc.conversation.getConversationById.useQuery(
      { conversationId },
      { enabled: !!conversationId }
    );

  const isFriend = conversationData?.isFriend ?? false;
  const friendRequestStatus = conversationData?.friendRequestStatus;

  const {
    removeFriendMutation,
    sendFriendRequestMutation,
    handleRemoveFriend,
    handleSendFriendRequest,
  } = useFriendActions({
    user: otherUser,
    conversationId,
  });

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 h-full">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b px-4 py-2.5 bg-background shadow-sm">
          <div className="flex items-center gap-3">
            {otherUser && (
              <UserAvatar user={otherUser as User} size="sm" showStatus />
            )}
            <div>
              <h1 className="text-base font-semibold">{displayName}</h1>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Video className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <UserPlus className="h-5 w-5" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => {
                if (collapsed) {
                  memberPanelRef.current?.expand();
                } else {
                  memberPanelRef.current?.collapse();
                }
              }}
            >
              <CircleUser className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Chat Area */}
        <ResizablePanelGroup direction="horizontal" className="flex h-full">
          <ResizablePanel
            defaultSize={80}
            minSize={80}
            maxSize={100}
            className="h-full flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-hidden">
              <Suspense
                fallback={
                  <div className="p-6 space-y-4">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-4 w-96" />
                        </div>
                      </div>
                    ))}
                  </div>
                }
              >
                <ChatArea
                  initData={initData.messages as DirectMessage[]}
                  conversationId={conversationId}
                  otherUser={otherUser}
                  isFriend={isFriend}
                  friendRequestStatus={friendRequestStatus?.status}
                  onSendFriendRequest={handleSendFriendRequest}
                  onRemoveFriend={handleRemoveFriend}
                  sendFriendRequestMutation={sendFriendRequestMutation}
                  removeFriendMutation={removeFriendMutation}
                />
              </Suspense>
            </div>
            <div className="shrink-0 px-3 pb-3">
              <MessageInput
                channelName={
                  otherUser?.displayName || otherUser?.userName || ""
                }
                onSendMessage={handleSendMessage}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle disabled />
          <ResizablePanel
            ref={memberPanelRef}
            defaultSize={20}
            minSize={0}
            collapsible={true}
            onCollapse={() => {
              setCollapsed(true);
            }}
            onExpand={() => {
              setCollapsed(false);
            }}
          >
            {otherUser && (
              <DirectMessageProfile
                user={otherUser}
                isFriend={isFriend}
                friendRequestStatus={friendRequestStatus?.status}
                onSendFriendRequest={handleSendFriendRequest}
                onRemoveFriend={handleRemoveFriend}
                sendFriendRequestMutation={sendFriendRequestMutation}
                removeFriendMutation={removeFriendMutation}
              />
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Profile Sidebar */}
    </div>
  );
}
