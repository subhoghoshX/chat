import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const promote = mutation({
  args: { userId: v.string() },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authorized");

    const threads = await ctx.db
      .query("temporary_threads")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    for (const thread of threads) {
      await ctx.db.insert("threads", {
        id: thread.id,
        isPublic: thread.isPublic,
        title: thread.title,
        userId,
      });
      await ctx.db.delete(thread._id);

      const messages = await ctx.db
        .query("temporary_messages")
        .withIndex("by_threadId", (q) => q.eq("threadId", thread.id))
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .collect();

      for (const message of messages) {
        await ctx.db.insert("messages", {
          threadId: thread.id,
          content: message.content,
          by: message.by,
          userId,
          files: [],
        });
        await ctx.db.delete(message._id);
      }
    }
  },
});
