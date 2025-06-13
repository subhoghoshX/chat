import { v } from "convex/values";
import { internalAction, mutation, query } from "./_generated/server";
import { generateText } from "ai";
import { gateway } from "@vercel/ai-sdk-gateway";
import { api } from "./_generated/api";

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

export const updateThread = mutation({
  args: { id: v.id("threads"), title: v.string() },
  async handler(ctx, args) {
    ctx.db.patch(args.id, { title: args.title });
  },
});

export const generateThreadTitle = internalAction({
  args: { threadId: v.id("threads"), firstMessage: v.string() },
  async handler(ctx, args) {
    const { text } = await generateText({
      model: gateway("vertex/gemini-2.0-flash-001"),
      system:
        "You are a helpful assistant that creates concise and informative titles for chat threads based on the user's first message.  Your titles should accurately reflect the topic or intent of the message." +
        "Respond only with the thread title.  The title should be no more than 10 words.",
      prompt: args.firstMessage,
    });

    await ctx.runMutation(api.threads.updateThread, { id: args.threadId, title: text });
  },
});
