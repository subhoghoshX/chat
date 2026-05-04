import { v } from "convex/values";
import { internalAction, internalMutation, mutation, query } from "./_generated/server";
import { streamText } from "ai";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { zenModel } from "./zen";

export const createThread = mutation({
  args: { id: v.string() },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authorized.");

    await ctx.db.insert("threads", {
      id: args.id,
      title: "New Thread",
      isPublic: false,
      userId,
    });
  },
});

export const getThreads = query({
  args: {},
  async handler(ctx) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authorized.");

    return await ctx.db
      .query("threads")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  },
});

export const updateThread = mutation({
  args: { _id: v.id("threads"), title: v.string() },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authorized.");

    const thread = await ctx.db.get(args._id);
    if (!thread) throw new Error("Thread not found.");

    if (thread.userId !== userId) throw new Error("Not authorized to update thread.");

    await ctx.db.patch(args._id, { title: args.title });
  },
});

export const deleteThread = mutation({
  args: { _id: v.id("threads"), threadId: v.string() },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authorized.");

    const thread = await ctx.db.get(args._id);
    if (!thread) throw new Error("Thread not found.");

    if (thread.userId !== userId) throw new Error("Not authorized to delete thread.");

    ctx.db.delete(args._id);

    // also delete the messages in the thread
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  },
});

export const generateThreadTitle = internalAction({
  args: { _threadId: v.id("threads"), firstMessage: v.string() },
  async handler(ctx, args) {
    const { textStream } = streamText({
      model: zenModel("gpt-5-nano"),
      system:
        "You are a helpful assistant that creates concise and informative titles for chat threads based on the user's first message.  Your titles should accurately reflect the topic or intent of the message." +
        "Respond only with the thread title.  The title should be no more than 10 words.",
      prompt: args.firstMessage,
    });

    let textRecievedSoFar = "";

    for await (const textPart of textStream) {
      textRecievedSoFar += textPart;
      await ctx.runMutation(internal.threads.internalUpdateThread, { _id: args._threadId, title: textRecievedSoFar });
    }
  },
});

export const internalUpdateThread = internalMutation({
  args: { _id: v.id("threads"), title: v.string() },
  async handler(ctx, args) {
    ctx.db.patch(args._id, { title: args.title });
  },
});

export const share = mutation({
  args: { _id: v.id("threads") },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authorized to share the thread.");

    const thread = await ctx.db.get(args._id);

    if (!thread) throw new Error("Thread not found.");
    if (thread.userId !== userId) throw new Error("Not authorized to share the thread.");

    await ctx.db.patch(thread._id, { isPublic: true });

    return thread._id;
  },
});

export const cloneToCurrentUser = mutation({
  args: { _id: v.id("threads") },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authorized.");

    const thread = await ctx.db.get(args._id);

    if (!thread) throw new Error("Thread not found.");
    if (!thread.isPublic) throw new Error("Thread is not shared");

    const newThreadId = crypto.randomUUID();

    await ctx.db.insert("threads", {
      id: newThreadId,
      isPublic: false,
      title: thread.title,
      userId,
    });

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_threadId", (q) => q.eq("threadId", thread.id))
      .filter((q) => q.eq(q.field("userId"), thread.userId))
      .collect();
    for (const message of messages) {
      await ctx.db.insert("messages", {
        userId,
        threadId: newThreadId,
        by: message.by,
        content: message.content,
        files: message.files,
      });
    }

    return newThreadId;
  },
});
