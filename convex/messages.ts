import { v } from "convex/values";
import { internalAction, mutation, query } from "./_generated/server";
import { gateway } from "@vercel/ai-sdk-gateway";
import { generateText } from "ai";
import { api, internal } from "./_generated/api";

export const createMessage = mutation({
  args: { thread_id: v.string(), content: v.string(), by: v.string() },
  async handler(ctx, args) {
    await ctx.db.insert("messages", {
      thread_id: args.thread_id,
      content: args.content,
      by: args.by,
    });

    if (args.by === "human") {
      await ctx.scheduler.runAfter(0, internal.messages.getAiReply, {
        thread_id: args.thread_id,
        prompt: args.content,
      });
    }
  },
});

export const getMessages = query({
  args: { thread_id: v.optional(v.string()) },
  async handler(ctx, { thread_id }) {
    if (!thread_id) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_thread_id", (q) => q.eq("thread_id", thread_id))
      .collect();
  },
});

export const getAiReply = internalAction({
  args: { thread_id: v.string(), prompt: v.string() },
  async handler(ctx, args) {
    const { text } = await generateText({
      model: gateway("xai/grok-3-beta"),
      prompt: args.prompt,
      // onError(error: unknown) {
      //   console.log(error);
      // },
    });

    await ctx.scheduler.runAfter(0, api.messages.createMessage, {
      thread_id: args.thread_id,
      content: text,
      by: "xai/grok-3-beta",
    });
  },
});
