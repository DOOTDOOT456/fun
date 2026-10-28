import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.string(),
    githubUsername: v.optional(v.string()),
    githubConnected: v.boolean(),
    team: v.optional(v.string()),
    createdAt: v.number(),
    lastSeen: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_team", ["team"])
    .index("by_lastSeen", ["lastSeen"]),

  game_players: defineTable({
    userId: v.string(),
    team: v.optional(v.string()),
    x: v.number(),
    z: v.number(),
    health: v.number(),
    ammo: v.number(),
    killed: v.number(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    lastSeen: v.number(),
  })
    .index("by_lastSeen", ["lastSeen"])
    .index("by_team", ["team"])
    .index("by_userId", ["userId"])
    .index("by_lastSeen", ["lastSeen"])
    .index("by_team", ["team"]),

  game_board: defineTable({
    tiles: v.record(
      v.string(),
      v.object({
        owner: v.optional(v.id("users")),
        team: v.optional(v.string()),
        capturedAt: v.number(),
      }),
    ),
    updatedAt: v.number(),
  })
    .index("by_updated", ["updatedAt"]),

  game_chat: defineTable({
    authorId: v.id("users"),
    authorName: v.string(),
    text: v.string(),
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"]),
});
