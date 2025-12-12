import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Permissions, calculateChannelPermissions } from "@/lib/permissions";

export const permissionRouter = router({
  /**
   * Fetch tất cả permissions của user cho một server
   * Chỉ cần gọi 1 lần khi vào server, sau đó cache ở client
   */
  getServerPermissions: protectedProcedure
    .input(
      z.object({
        serverId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Get member info with roles
      const member = await prisma.member.findFirst({
        where: {
          userId: ctx.user.id,
          serverId: input.serverId,
        },
        include: {
          roles: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                  permissions: true,
                  position: true,
                },
              },
            },
          },
        },
      });

      if (!member) {
        throw new Error("You are not a member of this server");
      }

      // Get all role permissions
      const rolePermissions = member.roles.map((mr) => mr.role.permissions);

      // Check if user is server owner
      const server = await prisma.server.findUnique({
        where: { id: input.serverId },
        select: { ownerId: true },
      });

      const isOwner = server?.ownerId === ctx.user.id;

      // Get ALL channels in server with their permissions
      const channels = await prisma.channel.findMany({
        where: { serverId: input.serverId },
        include: {
          permissions: {
            where: {
              roleId: {
                in: member.roles.map((mr) => mr.role.id),
              },
            },
            select: {
              roleId: true,
              allow: true,
              deny: true,
            },
          },
          members: {
            where: {
              memberId: member.id,
            },
            select: {
              permissions: true,
            },
          },
        },
      });

      // Calculate permissions for each channel
      const channelPermissions = channels.map((channel) => {
        // Owner has all permissions
        if (isOwner) {
          return {
            channelId: channel.id,
            channelName: channel.name,
            channelType: channel.type,
            isPrivate: channel.isPrivate,
            categoryId: channel.categoryId,
            permissions: Object.values(Permissions).reduce(
              (acc, p) => acc | p,
              0n,
            ),
            canView: true,
            canSend: true,
            canManage: true,
          };
        }

        // Calculate final permissions
        const finalPermissions = calculateChannelPermissions({
          memberRolePermissions: rolePermissions,
          channelRolePermissions: channel.permissions,
          channelMemberPermissions: channel.members[0]?.permissions,
        });

        // For private channels, check if user has explicit access
        const canView = channel.isPrivate
          ? channel.members.length > 0 || // Has explicit access
            (finalPermissions & Permissions.VIEW_CHANNEL) ===
              Permissions.VIEW_CHANNEL
          : (finalPermissions & Permissions.VIEW_CHANNEL) ===
            Permissions.VIEW_CHANNEL;

        return {
          channelId: channel.id,
          channelName: channel.name,
          channelType: channel.type,
          isPrivate: channel.isPrivate,
          categoryId: channel.categoryId,
          permissions: finalPermissions,
          canView,
          canSend:
            (finalPermissions & Permissions.SEND_MESSAGES) ===
            Permissions.SEND_MESSAGES,
          canManage:
            (finalPermissions & Permissions.MANAGE_CHANNELS) ===
            Permissions.MANAGE_CHANNELS,
        };
      });

      // Group channels by category
      const categories = await prisma.category.findMany({
        where: { serverId: input.serverId },
        orderBy: { position: "asc" },
      });

      const grouped = categories.map((category) => ({
        categoryId: category.id,
        categoryName: category.name,
        position: category.position,
        channels: channelPermissions
          .filter((cp) => cp.categoryId === category.id && cp.canView)
          .sort((a, b) => {
            const chA = channels.find((c) => c.id === a.channelId);
            const chB = channels.find((c) => c.id === b.channelId);
            return (chA?.position || 0) - (chB?.position || 0);
          }),
      }));

      // Add uncategorized channels
      const uncategorized = channelPermissions.filter(
        (cp) => !cp.categoryId && cp.canView,
      );

      return {
        isOwner,
        memberRoles: member.roles.map((mr) => ({
          id: mr.role.id,
          name: mr.role.name,
          permissions: mr.role.permissions,
          position: mr.role.position,
        })),
        categories: grouped,
        uncategorizedChannels: uncategorized,
        // All channels (for quick lookup by channelId)
        channelPermissionsMap: Object.fromEntries(
          channelPermissions.map((cp) => [cp.channelId, cp]),
        ),
      };
    }),

  /**
   * Check single permission for a specific channel
   * Sử dụng khi cần verify permission realtime (ví dụ: trước khi delete message)
   */
  checkChannelPermission: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        permission: z.string(), // "SEND_MESSAGES", "MANAGE_CHANNELS", etc.
      }),
    )
    .query(async ({ ctx, input }) => {
      const channel = await prisma.channel.findUnique({
        where: { id: input.channelId },
        select: { serverId: true },
      });

      if (!channel) {
        throw new Error("Channel not found");
      }

      const member = await prisma.member.findFirst({
        where: {
          userId: ctx.user.id,
          serverId: channel.serverId,
        },
        include: {
          roles: {
            include: {
              role: {
                select: {
                  id: true,
                  permissions: true,
                },
              },
            },
          },
        },
      });

      if (!member) {
        return { hasPermission: false };
      }

      const rolePermissions = member.roles.map((mr) => mr.role.permissions);
      const channelPerms = await prisma.channel.findUnique({
        where: { id: input.channelId },
        include: {
          permissions: {
            where: {
              roleId: {
                in: member.roles.map((mr) => mr.role.id),
              },
            },
          },
          members: {
            where: { memberId: member.id },
          },
        },
      });

      const finalPermissions = calculateChannelPermissions({
        memberRolePermissions: rolePermissions,
        channelRolePermissions: channelPerms?.permissions || [],
        channelMemberPermissions: channelPerms?.members[0]?.permissions,
      });

      const permissionBit =
        Permissions[input.permission as keyof typeof Permissions];
      const hasPermission =
        (finalPermissions & permissionBit) === permissionBit;

      return { hasPermission };
    }),
});
