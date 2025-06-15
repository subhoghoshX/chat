import { v } from "convex/values";
import { internalAction, internalMutation, mutation, query } from "./_generated/server";
import { supportedModels } from "../utils/supported-models";
import { internal } from "./_generated/api";
import { streamText } from "ai";
import { gateway } from "@vercel/ai-sdk-gateway";

export const create = mutation({
  args: {
    threadId: v.string(),
    content: v.string(),
    by: v.string(),
    userId: v.string(),
    model: v.optional(v.string()),
  },
  async handler(ctx, args) {
    if (!args.userId.trim()) throw new Error("userId is required");

    await ctx.db.insert("temporary_messages", {
      threadId: args.threadId,
      content: args.content,
      by: args.by,
      userId: args.userId,
    });

    if (args.by === "human" && args.model) {
      const modelsForUnauthenticateduser = supportedModels
        .filter((model) => model.for === "ALL")
        .map((model) => model.name) as string[];

      if (!modelsForUnauthenticateduser.includes(args.model)) {
        throw new Error("User is not authorized to use the model");
      }

      const aiMessageId = await ctx.db.insert("temporary_messages", {
        threadId: args.threadId,
        content: "",
        by: args.model,
        userId: args.userId,
      });

      await ctx.scheduler.runAfter(0, internal.temporary_messages.getAiReply, {
        _id: aiMessageId,
        prompt: args.content,
        model: args.model,
      });

      // if it's first message generate thread title
      const thread = await ctx.db
        .query("temporary_threads")
        .withIndex("by_thread_id", (q) => q.eq("id", args.threadId))
        .first();
      if (thread && thread.title === "New Thread") {
        ctx.scheduler.runAfter(0, internal.temporary_threads.generateTitle, {
          _threadId: thread._id,
          firstMessage: args.content,
        });
      }
    }
  },
});

export const get = query({
  args: { threadId: v.string(), userId: v.string() },
  async handler(ctx, args) {
    if (!args.userId.trim()) throw new Error("userId is required");

    return await ctx.db
      .query("temporary_messages")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

export const update = internalMutation({
  args: { _id: v.id("temporary_messages"), content: v.string() },
  async handler(ctx, args) {
    await ctx.db.patch(args._id, { content: args.content });
  },
});

export const getAiReply = internalAction({
  args: { _id: v.id("temporary_messages"), prompt: v.string(), model: v.string() },
  async handler(ctx, args) {
    const { textStream } = streamText({
      model: gateway(args.model),
      prompt: args.prompt,
      onError(error: unknown) {
        console.log(error);
      },
    });

    let textRecievedSoFar = "";

    for await (const textPart of textStream) {
      textRecievedSoFar += textPart;
      await ctx.runMutation(internal.temporary_messages.update, {
        _id: args._id,
        content: textRecievedSoFar,
      });
    }
  },
});
