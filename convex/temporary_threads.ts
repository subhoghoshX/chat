import { v } from "convex/values";
import { internalAction, internalMutation, mutation, query } from "./_generated/server";
import { generateText } from "ai";
import { gateway } from "@vercel/ai-sdk-gateway";
import { internal } from "./_generated/api";

export const create = mutation({
  args: { id: v.string(), userId: v.string() },
  async handler(ctx, args) {
    if (!args.userId.trim()) throw new Error("userId is required");

    await ctx.db.insert("temporary_threads", {
      id: args.id,
      title: "New Thread",
      isPublic: false,
      userId: args.userId,
    });
  },
});

export const get = query({
  args: { userId: v.string() },
  async handler(ctx, args) {
    if (!args.userId.trim()) throw new Error("userId is required");

    return await ctx.db
      .query("temporary_threads")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

export const update = mutation({
  args: { _id: v.id("temporary_threads"), title: v.string(), userId: v.string() },
  async handler(ctx, args) {
    if (!args.userId.trim()) throw new Error("userId is required");

    const thread = await ctx.db.get(args._id);
    if (!thread) throw new Error("Thread not found.");

    if (thread.userId !== args.userId) throw new Error("Not authorized to update thread.");

    ctx.db.patch(args._id, { title: args.title });
  },
});

export const deleteThread = mutation({
  args: { _id: v.id("temporary_threads"), threadId: v.string(), userId: v.string() },
  async handler(ctx, args) {
    if (!args.userId.trim()) throw new Error("userId is required");

    const thread = await ctx.db.get(args._id);
    if (!thread) throw new Error("Thread not found.");

    if (thread.userId !== args.userId) throw new Error("Not authorized to delete thread.");

    ctx.db.delete(args._id);

    // also delete the messages in the thread
    const messages = await ctx.db
      .query("temporary_messages")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  },
});

export const generateTitle = internalAction({
  args: { _threadId: v.id("temporary_threads"), firstMessage: v.string() },
  async handler(ctx, args) {
    const { text } = await generateText({
      model: gateway("vertex/gemini-2.0-flash-001"),
      system:
        "You are a helpful assistant that creates concise and informative titles for chat threads based on the user's first message.  Your titles should accurately reflect the topic or intent of the message." +
        "Respond only with the thread title.  The title should be no more than 10 words.",
      prompt: args.firstMessage,
    });

    await ctx.runMutation(internal.temporary_threads._updateTitle, { _id: args._threadId, title: text });
  },
});

export const _updateTitle = internalMutation({
  args: { _id: v.id("temporary_threads"), title: v.string() },
  async handler(ctx, args) {
    ctx.db.patch(args._id, { title: args.title });
  },
});
