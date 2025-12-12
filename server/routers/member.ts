import prisma from "@/lib/prisma";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { eventEmitter } from "../event-emitter";
import { notifyMemberLeave, notifyMemberUpdate } from "@/lib/ws-notify";
import { observable } from "@trpc/server/observable";

export const memberRouter = router({
  // Get all members of a server
  getServerMembers: protectedProcedure
    .input(z.object({ serverId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is a member of the server
      const userMember = await prisma.member.findFirst({
        where: {
          serverId: input.serverId,
          userId: ctx.user.id,
        },
      });

      if (!userMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this server",
        });
      }

      const members = await prisma.member.findMany({
        where: { serverId: input.serverId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              userName: true,
              displayName: true,
              image: true,
              status: true,
            },
          },
          roles: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                  position: true,
                },
              },
            },
          },
        },
        orderBy: {
          joinedAt: "asc",
        },
      });

      // Transform data to match the expected format
      return members.map((member) => ({
        id: member.id,
        oderId: member.userId,
        serverId: member.serverId,
        nickname: member.nickname,
        joinedAt: member.joinedAt,
        user: {
          id: member.user.id,
          name:
            member.user.displayName ||
            member.user.name ||
            member.user.userName ||
            "Unknown",
          username: member.user.userName,
          image: member.user.image,
          status: member.user.status,
        },
        roles: member.roles.map((mr) => ({
          id: mr.role.id,
          name: mr.role.name,
          color: mr.role.color,
          position: mr.role.position,
        })),
      }));
    }),

  // Get a specific member
  getMember: protectedProcedure
    .input(
      z.object({
        serverId: z.string(),
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Check if requester is a member of the server
      const requesterMember = await prisma.member.findFirst({
        where: {
          serverId: input.serverId,
          userId: ctx.user.id,
        },
      });

      if (!requesterMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this server",
        });
      }

      const member = await prisma.member.findFirst({
        where: {
          serverId: input.serverId,
          userId: input.userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              userName: true,
              displayName: true,
              image: true,
              status: true,
              bio: true,
              banner: true,
              customStatus: true,
              createdAt: true,
            },
          },
          roles: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                  position: true,
                },
              },
            },
          },
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      return {
        id: member.id,
        userId: member.userId,
        serverId: member.serverId,
        nickname: member.nickname,
        joinedAt: member.joinedAt,
        user: {
          id: member.user.id,
          name:
            member.user.displayName ||
            member.user.name ||
            member.user.userName ||
            "Unknown",
          username: member.user.userName,
          image: member.user.image,
          status: member.user.status,
          bio: member.user.bio,
          banner: member.user.banner,
          customStatus: member.user.customStatus,
          createdAt: member.user.createdAt,
        },
        roles: member.roles.map((mr) => ({
          id: mr.role.id,
          name: mr.role.name,
          color: mr.role.color,
          position: mr.role.position,
        })),
      };
    }),

  onMemberListUpdate: protectedProcedure
    .input(
      z.object({
        serverId: z.string(),
      }),
    )
    .subscription(({ input }) => {
      return observable<{ userId: string }>((emit) => {
        const onMemberJoin = (data: { serverId: string; userId: string }) => {
          if (data.serverId === input.serverId) {
            emit.next({ userId: data.userId });
          }
        };
        eventEmitter.on("member:join", onMemberJoin);

        return () => {
          eventEmitter.off("member:join", onMemberJoin);
        };
      });
    }),

  // Update member nickname
  updateNickname: protectedProcedure
    .input(
      z.object({
        serverId: z.string(),
        nickname: z.string().max(32).optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const member = await prisma.member.findFirst({
        where: {
          serverId: input.serverId,
          userId: ctx.user.id,
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this server",
        });
      }

      const updatedMember = await prisma.member.update({
        where: { id: member.id },
        data: { nickname: input.nickname },
      });

      // Notify member update
      eventEmitter.emit("member:update", {
        serverId: input.serverId,
        memberId: member.id,
      });
      await notifyMemberUpdate(input.serverId, member.id);

      return updatedMember;
    }),

  // Kick member (owner/admin only)
  kickMember: protectedProcedure
    .input(
      z.object({
        serverId: z.string(),
        memberId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get server to check ownership
      const server = await prisma.server.findUnique({
        where: { id: input.serverId },
        select: { ownerId: true },
      });

      if (!server) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Server not found",
        });
      }

      // Only owner can kick for now (can extend with role permissions)
      if (server.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the server owner can kick members",
        });
      }

      // Get member to kick
      const memberToKick = await prisma.member.findUnique({
        where: { id: input.memberId },
        select: { userId: true },
      });

      if (!memberToKick) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      // Cannot kick the owner
      if (memberToKick.userId === server.ownerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot kick the server owner",
        });
      }

      await prisma.member.delete({
        where: { id: input.memberId },
      });

      // Notify member leave
      eventEmitter.emit("member:leave", {
        serverId: input.serverId,
        userId: memberToKick.userId,
      });
      await notifyMemberLeave(input.serverId, memberToKick.userId);

      return { success: true };
    }),
});
