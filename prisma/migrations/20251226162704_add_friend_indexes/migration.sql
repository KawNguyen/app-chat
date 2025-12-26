-- CreateIndex
CREATE INDEX "friend_requests_senderId_receiverId_idx" ON "friend_requests"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "friend_requests_receiverId_senderId_idx" ON "friend_requests"("receiverId", "senderId");

-- CreateIndex
CREATE INDEX "friends_userId_friendId_idx" ON "friends"("userId", "friendId");

-- CreateIndex
CREATE INDEX "friends_friendId_userId_idx" ON "friends"("friendId", "userId");
