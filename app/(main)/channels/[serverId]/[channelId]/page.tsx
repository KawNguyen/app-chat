import ChatContainer from "@/components/chat/channel-chat-container";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

const Page = async ({
  params,
}: {
  params: Promise<{ serverId: string; channelId: string }>;
}) => {
  const { serverId, channelId } = await params;

  const channel = await prisma.channel.findUnique({
    where: { id: channelId, serverId: serverId },
  });

  if (!channel) {
    notFound();
  }

  return (
    <ChatContainer
      channelId={channel.id}
      channelName={channel.name}
      serverId={serverId}
    />
  );
};

export default Page;
