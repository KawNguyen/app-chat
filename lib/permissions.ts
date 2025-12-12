/**
 * Permission constants for Discord-like permission system
 * Using bitfield for efficient permission checks
 */

export const Permissions = {
  // General Server Permissions
  VIEW_CHANNEL: 1n << 0n, // 1
  MANAGE_CHANNELS: 1n << 1n, // 2
  MANAGE_ROLES: 1n << 2n, // 4
  MANAGE_SERVER: 1n << 3n, // 8
  CREATE_INVITE: 1n << 4n, // 16
  CHANGE_NICKNAME: 1n << 5n, // 32
  MANAGE_NICKNAMES: 1n << 6n, // 64
  KICK_MEMBERS: 1n << 7n, // 128
  BAN_MEMBERS: 1n << 8n, // 256
  ADMINISTRATOR: 1n << 9n, // 512 - All permissions

  // Text Channel Permissions
  SEND_MESSAGES: 1n << 10n, // 1024
  EMBED_LINKS: 1n << 11n, // 2048
  ATTACH_FILES: 1n << 12n, // 4096
  ADD_REACTIONS: 1n << 13n, // 8192
  USE_EXTERNAL_EMOJIS: 1n << 14n, // 16384
  MENTION_EVERYONE: 1n << 15n, // 32768
  MANAGE_MESSAGES: 1n << 16n, // 65536
  READ_MESSAGE_HISTORY: 1n << 17n, // 131072
  SEND_TTS_MESSAGES: 1n << 18n, // 262144

  // Voice Channel Permissions
  CONNECT: 1n << 20n, // 1048576
  SPEAK: 1n << 21n, // 2097152
  VIDEO: 1n << 22n, // 4194304
  MUTE_MEMBERS: 1n << 23n, // 8388608
  DEAFEN_MEMBERS: 1n << 24n, // 16777216
  MOVE_MEMBERS: 1n << 25n, // 33554432
  USE_VOICE_ACTIVITY: 1n << 26n, // 67108864
  PRIORITY_SPEAKER: 1n << 27n, // 134217728
} as const;

/**
 * Default permissions for @everyone role
 */
export const DEFAULT_PERMISSIONS =
  Permissions.VIEW_CHANNEL |
  Permissions.SEND_MESSAGES |
  Permissions.EMBED_LINKS |
  Permissions.ATTACH_FILES |
  Permissions.ADD_REACTIONS |
  Permissions.READ_MESSAGE_HISTORY |
  Permissions.CONNECT |
  Permissions.SPEAK |
  Permissions.USE_VOICE_ACTIVITY;

/**
 * Administrator has all permissions
 */
export const ADMIN_PERMISSIONS = Object.values(Permissions).reduce(
  (acc, perm) => acc | perm,
  0n,
);

/**
 * Check if a permission set includes a specific permission
 */
export function hasPermission(
  userPermissions: bigint,
  permission: bigint,
): boolean {
  // Administrator has all permissions
  if (
    (userPermissions & Permissions.ADMINISTRATOR) ===
    Permissions.ADMINISTRATOR
  ) {
    return true;
  }
  return (userPermissions & permission) === permission;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  userPermissions: bigint,
  ...permissions: bigint[]
): boolean {
  if (
    (userPermissions & Permissions.ADMINISTRATOR) ===
    Permissions.ADMINISTRATOR
  ) {
    return true;
  }
  return permissions.some((perm) => (userPermissions & perm) === perm);
}

/**
 * Add permissions to a permission set
 */
export function addPermissions(
  currentPermissions: bigint,
  ...permissions: bigint[]
): bigint {
  return permissions.reduce((acc, perm) => acc | perm, currentPermissions);
}

/**
 * Remove permissions from a permission set
 */
export function removePermissions(
  currentPermissions: bigint,
  ...permissions: bigint[]
): bigint {
  return permissions.reduce((acc, perm) => acc & ~perm, currentPermissions);
}

/**
 * Calculate final permissions for a member in a channel
 * Priority: Administrator > Channel Member Override > Role Permissions
 */
export function calculateChannelPermissions(params: {
  memberRolePermissions: bigint[]; // All role permissions for this member
  channelRolePermissions: { allow: bigint; deny: bigint }[]; // Channel-specific role overrides
  channelMemberPermissions?: bigint; // Direct member override for this channel
}): bigint {
  const {
    memberRolePermissions,
    channelRolePermissions,
    channelMemberPermissions,
  } = params;

  // Start with base role permissions (OR all roles)
  let permissions = memberRolePermissions.reduce((acc, perm) => acc | perm, 0n);

  // Check for administrator
  if (hasPermission(permissions, Permissions.ADMINISTRATOR)) {
    return ADMIN_PERMISSIONS;
  }

  // Apply channel role overrides (deny first, then allow)
  let channelDeny = 0n;
  let channelAllow = 0n;

  for (const override of channelRolePermissions) {
    channelDeny |= override.deny;
    channelAllow |= override.allow;
  }

  // Apply deny then allow
  permissions &= ~channelDeny;
  permissions |= channelAllow;

  // If channel member override exists, use it directly (highest priority)
  if (channelMemberPermissions !== undefined) {
    return channelMemberPermissions;
  }

  return permissions;
}

/**
 * Permission labels for UI
 */
export const PermissionLabels: Record<string, string> = {
  VIEW_CHANNEL: "View Channel",
  MANAGE_CHANNELS: "Manage Channels",
  MANAGE_ROLES: "Manage Roles",
  MANAGE_SERVER: "Manage Server",
  CREATE_INVITE: "Create Invite",
  CHANGE_NICKNAME: "Change Nickname",
  MANAGE_NICKNAMES: "Manage Nicknames",
  KICK_MEMBERS: "Kick Members",
  BAN_MEMBERS: "Ban Members",
  ADMINISTRATOR: "Administrator",
  SEND_MESSAGES: "Send Messages",
  EMBED_LINKS: "Embed Links",
  ATTACH_FILES: "Attach Files",
  ADD_REACTIONS: "Add Reactions",
  USE_EXTERNAL_EMOJIS: "Use External Emojis",
  MENTION_EVERYONE: "Mention @everyone",
  MANAGE_MESSAGES: "Manage Messages",
  READ_MESSAGE_HISTORY: "Read Message History",
  SEND_TTS_MESSAGES: "Send TTS Messages",
  CONNECT: "Connect",
  SPEAK: "Speak",
  VIDEO: "Video",
  MUTE_MEMBERS: "Mute Members",
  DEAFEN_MEMBERS: "Deafen Members",
  MOVE_MEMBERS: "Move Members",
  USE_VOICE_ACTIVITY: "Use Voice Activity",
  PRIORITY_SPEAKER: "Priority Speaker",
};
