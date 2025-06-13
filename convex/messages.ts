import { v } from "convex/values";
import { internalAction, internalMutation, mutation, query } from "./_generated/server";
import { gateway } from "@vercel/ai-sdk-gateway";
import { streamText } from "ai";
import { internal } from "./_generated/api";

export const createMessage = mutation({
  args: { threadId: v.string(), content: v.string(), by: v.string(), model: v.optional(v.string()) },
  async handler(ctx, args) {
    await ctx.db.insert("messages", {
      threadId: args.threadId,
      content: args.content,
      by: args.by,
    });

    if (args.by === "human" && args.model) {
      const aiMessageId = await ctx.db.insert("messages", {
        threadId: args.threadId,
        content: "",
        by: args.model,
      });

      await ctx.scheduler.runAfter(0, internal.messages.getAiReply, {
        id: aiMessageId,
        prompt: args.content,
        model: args.model,
      });

      // if it's first message generate thread title
      const thread = await ctx.db
        .query("threads")
        .withIndex("by_thread_id", (q) => q.eq("id", args.threadId))
        .first();
      if (thread && thread.title === "New Thread") {
        ctx.scheduler.runAfter(0, internal.threads.generateThreadTitle, {
          threadId: thread._id,
          firstMessage: args.content,
        });
      }
    }
  },
});

export const getMessages = query({
  args: { threadId: v.string() },
  async handler(ctx, { threadId }) {
    return await ctx.db
      .query("messages")
      .withIndex("by_thread_id", (q) => q.eq("threadId", threadId))
      .collect();
  },
});

export const updateMessage = internalMutation({
  args: { id: v.id("messages"), content: v.string() },
  async handler(ctx, args) {
    await ctx.db.patch(args.id, { content: args.content });
  },
});

export const getAiReply = internalAction({
  args: { id: v.id("messages"), prompt: v.string(), model: v.string() },
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
      await ctx.runMutation(internal.messages.updateMessage, {
        id: args.id,
        content: textRecievedSoFar,
      });
    }
  },
});
