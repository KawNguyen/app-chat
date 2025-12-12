import DirectChatContainer from "@/components/direct-chat/direct-chat-container";

const Page = async ({
  params,
}: {
  params: Promise<{ directMessageId: string }>;
}) => {
  const { directMessageId } = await params;

  return <DirectChatContainer conversationId={directMessageId} />;
};

export default Page;
