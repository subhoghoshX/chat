import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createThread = mutation({
  args: { id: v.string() },
  async handler(ctx, args) {
    await ctx.db.insert("threads", {
      id: args.id,
      title: "New Thread",
      isPublic: false,
    });
  },
});

export const getThreads = query({
  args: {},
  async handler(ctx) {
    return await ctx.db.query("threads").collect();
  },
});
