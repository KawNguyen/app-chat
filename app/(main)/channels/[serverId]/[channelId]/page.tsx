import ChatContainer from "@/components/chat/chat-container";
import prisma from "@/lib/prisma";

const Page = async ({
  params,
}: {
  params: Promise<{ serverId: string; channelId: string }>;
}) => {
  const { channelId } = await params;

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: {
      id: true,
      name: true,
    },
  });

  if (!channel) {
    return <div>Channel not found</div>;
  }

  return <ChatContainer channelId={channel.id} channelName={channel.name} />;
};

export default Page;
