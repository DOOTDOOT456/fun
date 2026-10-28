import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

type TileOwner = Id<"users"> | undefined;

const BOARD_SIZE = 20;

const DEFAULTS = {
  health: 100,
  ammo: 30,
  killed: 0,
  team: "cyan" as const,
};

const randomX = (): number => (Math.random() - 0.5) * 12;
const randomZ = (): number => (Math.random() - 0.5) * 12;

export const board = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query("game_board")
      .order("desc")
      .first();
    if (!row) {
      return {
        tiles: {} as unknown as Record<
          string,
          { owner: TileOwner; team: string | undefined; capturedAt: number }
        >,
        updatedAt: 0,
      };
    }
    return {
      tiles: row.tiles as unknown as Record<
        string,
        { owner: TileOwner; team: string | undefined; capturedAt: number }
      >,
      updatedAt: row.updatedAt,
    };
  },
});

export const players = query({
  args: {},
  handler: async (ctx) => {
    // The live game is driven by game_players; return it sorted by lastSeen.
    const cutoff = Date.now() - 30_000;
    const items = await ctx.db
      .query("game_players")
      .filter((q) => q.gt(q.field("lastSeen"), cutoff))
      .collect();
    return items.sort((a, b) => b.lastSeen - a.lastSeen);
  },
});

export const chat = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("game_chat")
      .order("desc")
      .take(80);
    return items.reverse();
  },
});

export const position = mutation({
  args: {
    x: v.number(),
    z: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { x, z } = args;
    const player = await ctx.db
      .query("game_players")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (player) {
      await ctx.db.patch(player._id, {
        x,
        z,
        lastSeen: Date.now(),
      });
    }

    return { ok: true };
  },
});

export const hit = mutation({
  args: {
    targetUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const shooterId = await getAuthUserId(ctx);
    if (!shooterId) throw new Error("Not authenticated");

    const target = await ctx.db
      .query("game_players")
      .filter((q) => q.eq(q.field("userId"), args.targetUserId))
      .first();
    if (!target) throw new Error("Target not found");
    if (target.health <= 0) return { ok: false, reason: "dead" };

    const before = target.health;
    await ctx.db.patch(target._id, {
      health: Math.max(0, target.health - 1),
      lastSeen: Date.now(),
    });

    return { ok: true, beforeHealth: before };
  },
});

export const spawn = mutation({
  args: {
    team: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Look up an existing players row to update it, otherwise create one.
    const existing = await ctx.db
      .query("game_players")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    const team = args.team === "magenta" ? "magenta" : "cyan";
    const entry = {
      userId,
      team,
      x: randomX(),
      z: randomZ(),
      health: DEFAULTS.health,
      ammo: DEFAULTS.ammo,
      killed: 0,
      name: user.name ?? "Player",
      avatarUrl: user.image ?? "",
      lastSeen: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, entry);
    } else {
      await ctx.db.insert("game_players", entry);
    }

    // Also reflect the team in the user profile for the lobby.
    const profile = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    if (profile) {
      await ctx.db.patch(profile._id, { team });
    }

    return { ok: true };
  },
});

export const capture = mutation({
  args: {
    x: v.number(),
    y: v.number(),
    team: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { x, y, team } = args;
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) {
      throw new Error("Out of bounds");
    }

    const key = `${x},${y}`;

    let row = await ctx.db.query("game_board").order("desc").first();
    if (!row) {
      const inserted = await ctx.db.insert("game_board", {
        tiles: {},
        updatedAt: Date.now(),
      });
      row = await ctx.db.get(inserted);
      if (!row) throw new Error("Failed to create board");
    }

    const tiles = { ...row.tiles } as Record<
      string,
      { owner: TileOwner; team: string | undefined; capturedAt: number }
    >;
    const existing = tiles[key];

    if (existing?.owner === userId) {
      return { ok: false, reason: "already_mine" };
    }

    tiles[key] = {
      owner: userId,
      team,
      capturedAt: Date.now(),
    };

    await ctx.db.patch(row._id, {
      tiles,
      updatedAt: Date.now(),
    });

    // Refresh my profile's lastSeen so the roster shows me active.
    const profile = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, { lastSeen: Date.now() });
    }

    return { ok: true };
  },
});

export const sendChat = mutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    const text = args.text.trim();
    if (text.length === 0 || text.length > 280) {
      throw new Error("Message must be 1-280 characters");
    }

    await ctx.db.insert("game_chat", {
      authorId: userId,
      authorName: user?.name ?? "Someone",
      text,
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});
