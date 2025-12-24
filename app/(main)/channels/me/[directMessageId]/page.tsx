import DirectChatContainer from "@/components/direct-chat/direct-chat-container";
import prisma from "@/lib/prisma";
import { Conversation } from "@/types";

const Page = async ({
  params,
}: {
  params: Promise<{ directMessageId: string }>;
}) => {
  const { directMessageId } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id: directMessageId },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
      messages: {
        include: {
          sender: true,

          attachments: true,
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
    },
  });

  const messages = conversation?.messages.reverse() ?? [];

  return (
    <DirectChatContainer
      data={{
        ...(conversation as unknown as Conversation),
        messages: messages as unknown as Conversation["messages"],
      }}
      conversationId={directMessageId}
    />
  );
};

export default Page;
