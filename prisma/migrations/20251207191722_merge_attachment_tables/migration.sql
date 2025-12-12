/*
  Warnings:

  - You are about to drop the `direct_message_attachments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "direct_message_attachments" DROP CONSTRAINT "direct_message_attachments_directMessageId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_userId_fkey";

-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "directMessageId" TEXT,
ALTER COLUMN "messageId" DROP NOT NULL;

-- DropTable
DROP TABLE "direct_message_attachments";

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_directMessageId_fkey" FOREIGN KEY ("directMessageId") REFERENCES "direct_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
