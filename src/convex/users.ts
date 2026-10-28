import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const profile = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    return {
      _id: user._id,
      name: profile?.name ?? user.name ?? "Player",
      email: user.email ?? "",
      avatarUrl: profile?.avatarUrl ?? user.image ?? "",
      githubUsername: profile?.githubUsername ?? null,
      githubConnected: profile?.githubConnected ?? false,
      team: profile?.team ?? null,
      createdAt: profile?.createdAt ?? user._creationTime,
    };
  },
});

export const ensureUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    avatarUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existing) {
      return {
        _id: userId,
        name: existing.name,
        email: existing.email,
        avatarUrl: existing.avatarUrl,
        githubUsername: existing.githubUsername ?? null,
        githubConnected: existing.githubConnected,
        team: existing.team ?? null,
        createdAt: existing.createdAt,
      };
    }

    const now = Date.now();
    await ctx.db.insert("profiles", {
      userId,
      name: args.name,
      email: args.email,
      avatarUrl: args.avatarUrl,
      githubConnected: false,
      createdAt: now,
    });

    return {
      _id: userId,
      name: args.name,
      email: args.email,
      avatarUrl: args.avatarUrl,
      githubUsername: null,
      githubConnected: false,
      team: null,
      createdAt: now,
    };
  },
});

export const setTeam = mutation({
  args: {
    team: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      team: args.team,
      lastSeen: Date.now(),
    });

    // Sync the live game_players row to match the chosen team.
    const player = await ctx.db
      .query("game_players")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    if (player) {
      await ctx.db.patch(player._id, { team: args.team });
    }

    return { ok: true };
  },
});

export const updateUserGitHub = mutation({
  args: {
    githubUsername: v.string(),
    githubConnected: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      githubUsername: args.githubUsername,
      githubConnected: args.githubConnected,
    });

    return { success: true };
  },
});
