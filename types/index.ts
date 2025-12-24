// ==================== ENUMS ====================

export enum UserStatus {
  ONLINE = "ONLINE",
  IDLE = "IDLE",
  DND = "DND",
  INVISIBLE = "INVISIBLE",
  OFFLINE = "OFFLINE",
}

export enum ChannelType {
  TEXT = "TEXT",
  VOICE = "VOICE",
  ANNOUNCEMENT = "ANNOUNCEMENT",
  STAGE = "STAGE",
  FORUM = "FORUM",
}

export enum MessageType {
  DEFAULT = "DEFAULT",
  SYSTEM = "SYSTEM",
  MEMBER_JOIN = "MEMBER_JOIN",
  MEMBER_LEAVE = "MEMBER_LEAVE",
  CHANNEL_PINNED = "CHANNEL_PINNED",
  REPLY = "REPLY",
}

export enum MentionType {
  USER = "USER",
  ROLE = "ROLE",
  CHANNEL = "CHANNEL",
  EVERYONE = "EVERYONE",
  HERE = "HERE",
}

export enum FriendRequestStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
}

export enum NotificationType {
  MESSAGE = "MESSAGE",
  MENTION = "MENTION",
  FRIEND_REQUEST = "FRIEND_REQUEST",
  SERVER_INVITE = "SERVER_INVITE",
  SYSTEM = "SYSTEM",
}

// ==================== AUTH TYPES ====================

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  userName: string | null;
  displayName: string | null;
  image: string | null;
  banner: string | null;
  bio: string | null;
  status: UserStatus;
  customStatus: string | null;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  accountId: string;
  providerId: string;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  scope: string | null;
  expiresAt: Date | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Verification {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== SERVER TYPES ====================

export interface Server {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  banner: string | null;
  inviteCode: string;
  isPublic: boolean;
  ownerId: string;
  categories: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  position: number;
  serverId: string;
  channels?: Channel[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: ChannelType;
  position: number;
  isPrivate: boolean;
  serverId: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  bitrate: number | null;
  userLimit: number | null;
}

// ==================== MEMBER & ROLE TYPES ====================

export interface Member {
  id: string;
  userId: string;
  serverId: string;
  nickname: string | null;
  joinedAt: Date;
  isMuted: boolean;
  isDeafened: boolean;
  user: User;
}

export interface Role {
  id: string;
  name: string;
  color: string | null;
  position: number;
  serverId: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions: bigint;
}

export interface MemberRole {
  id: string;
  memberId: string;
  roleId: string;
}

export interface ChannelPermission {
  id: string;
  channelId: string;
  roleId: string;
  allow: bigint;
  deny: bigint;
}

export interface ChannelMember {
  id: string;
  channelId: string;
  memberId: string;
  permissions: bigint;
  createdAt: Date;
}

// ==================== MESSAGE TYPES ====================

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  isPinned: boolean;
  isEdited: boolean;
  channelId: string;
  memberId: string;
  userId: string;
  replyToId: string | null;
  createdAt: Date;
  updatedAt: Date;
  attachments?: Attachment[];
  embeds?: Embed[];
  reactions?: Reaction[];
  mentions?: Mention[];
  member: Member;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  messageId: string | null;
  directMessageId: string | null;
  createdAt: Date;
}

export interface Embed {
  id: string;
  title: string | null;
  description: string | null;
  url: string | null;
  color: string | null;
  image: string | null;
  thumbnail: string | null;
  messageId: string;
}

export interface Reaction {
  id: string;
  emoji: string;
  messageId: string;
  userId: string;
  createdAt: Date;
}

export interface Mention {
  id: string;
  type: MentionType;
  targetId: string;
  messageId: string;
}

// ==================== DIRECT MESSAGE TYPES ====================

export interface Conversation {
  id: string;
  isGroup: boolean;
  name: string | null;
  icon: string | null;
  updatedAt: Date;
  createdAt: Date;

  participants: ConversationParticipant[];
  messages?: DirectMessage[];
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  conversationId: string;
  isHidden: boolean;
  joinedAt: Date;
  lastReadAt: Date | null;
  user: User;
  conversation: Conversation;
}

export interface DirectMessage {
  id: string;
  content: string;
  conversationId: string;
  senderId: string;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  sender: User;
  attachments: {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
    messageId: string | null;
    directMessageId: string | null;
    createdAt: Date;
  }[];
}

// ==================== FRIEND & BLOCK TYPES ====================

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  createdAt: Date;
}

export interface Block {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: Date;
}

// ==================== SERVER MANAGEMENT TYPES ====================

export interface Invite {
  id: string;
  code: string;
  serverId: string;
  maxUses: number | null;
  uses: number;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface Ban {
  id: string;
  serverId: string;
  usersId: string;
  reason: string | null;
  createdAt: Date;
}

export interface Emoji {
  id: string;
  name: string;
  url: string;
  serverId: string;
  createdAt: Date;
}

// ==================== NOTIFICATION TYPE ====================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}
