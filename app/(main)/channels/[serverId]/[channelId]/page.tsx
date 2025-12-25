import ChatContainer from "@/components/chat/channel-chat-container";
import prisma from "@/lib/prisma";
import { Channel } from "@/types";
import { notFound } from "next/navigation";

const Page = async ({
  params,
}: {
  params: Promise<{ serverId: string; channelId: string }>;
}) => {
  const { serverId, channelId } = await params;

  const channel = await prisma.channel.findUnique({
    where: { id: channelId, serverId: serverId },
    include: {
      server: true,
      messages: {
        include: {
          attachments: true,
          member: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
        take: 30,
      },
      category: true,
      permissions: true,
    },
  });

  if (!channel) {
    notFound();
  }

  return (
    <ChatContainer
      // channelId={channel.id}
      // channelName={channel.name}
      initData={channel as Channel}
      serverId={serverId}
    />
  );
};

export default Page;
