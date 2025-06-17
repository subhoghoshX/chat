import { v } from "convex/values";
import { internalAction, internalMutation, mutation, query } from "./_generated/server";
import { supportedModels } from "../utils/supported-models";
import { api, internal } from "./_generated/api";
import { ModelMessage, streamText } from "ai";
import { gateway } from "@vercel/ai-sdk-gateway";
import { temporaryMessageFields } from "./schema";

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

      const prevMessages = await ctx.db
        .query("temporary_messages")
        .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
        .collect();

      const aiMessageId = await ctx.db.insert("temporary_messages", {
        threadId: args.threadId,
        content: "",
        by: args.model,
        userId: args.userId,
      });

      await ctx.scheduler.runAfter(0, internal.temporary_messages.getAiReply, {
        _id: aiMessageId,
        model: args.model,
        prevMessages: prevMessages,
      });

      // if it's first message generate thread title
      const thread = await ctx.db
        .query("temporary_threads")
        .withIndex("by_threadId", (q) => q.eq("id", args.threadId))
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
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
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
  args: {
    _id: v.id("temporary_messages"),
    model: v.string(),
    prevMessages: v.array(
      v.object({ ...temporaryMessageFields, _id: v.id("temporary_messages"), _creationTime: v.number() }),
    ),
  },
  async handler(ctx, args) {
    const messagesToFeedAi: ModelMessage[] = args.prevMessages.map((message) => ({
      role: message.by === "human" ? "user" : "assistant",
      content: [{ type: "text", text: message.content }],
    }));
    const { textStream } = streamText({
      model: gateway(args.model),
      messages: messagesToFeedAi,
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

export const branchOff = mutation({
  args: { threadId: v.string(), messageId: v.id("temporary_messages"), userId: v.string() },
  async handler(ctx, args) {
    if (!args.userId) throw new Error("userId is required.");

    const messages = await ctx.runQuery(api.temporary_messages.get, { threadId: args.threadId, userId: args.userId });
    const messagesToCopy: typeof messages = [];
    for (const message of messages) {
      if (message._id === args.messageId) {
        messagesToCopy.push(message);
        break;
      } else {
        messagesToCopy.push(message);
      }
    }

    const newThreadId = crypto.randomUUID();

    for (const messageToCopy of messagesToCopy) {
      await ctx.db.insert("temporary_messages", {
        userId: args.userId,
        threadId: newThreadId,
        by: messageToCopy.by,
        content: messageToCopy.content,
      });
    }

    const thread = await ctx.db
      .query("temporary_threads")
      .withIndex("by_threadId", (q) => q.eq("id", args.threadId))
      .first();
    if (!thread) throw new Error("Thread not found");

    ctx.db.insert("temporary_threads", {
      id: newThreadId,
      title: `🌿 ${thread.title}`,
      userId: args.userId,
      isPublic: false,
    });

    return newThreadId;
  },
});
