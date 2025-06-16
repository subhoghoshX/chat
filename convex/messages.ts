import { v } from "convex/values";
import { internalAction, internalMutation, mutation, query } from "./_generated/server";
import { gateway } from "@vercel/ai-sdk-gateway";
import { type FilePart, type ImagePart, streamText } from "ai";
import { api, internal } from "./_generated/api";

export const createMessage = mutation({
  args: {
    threadId: v.string(),
    content: v.string(),
    by: v.string(),
    model: v.optional(v.string()),
    files: v.array(v.object({ storageId: v.id("_storage"), type: v.string() })),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authorized.");

    await ctx.db.insert("messages", {
      threadId: args.threadId,
      content: args.content,
      by: args.by,
      userId: identity.subject,
      files: args.files,
    });

    if (args.by === "human" && args.model) {
      const aiMessageId = await ctx.db.insert("messages", {
        threadId: args.threadId,
        content: "",
        by: args.model,
        userId: identity.subject,
        files: [],
      });

      await ctx.scheduler.runAfter(0, internal.messages.getAiReply, {
        _id: aiMessageId,
        prompt: args.content,
        model: args.model,
        files: args.files,
      });

      // if it's first message generate thread title
      const thread = await ctx.db
        .query("threads")
        .withIndex("by_threadId", (q) => q.eq("id", args.threadId))
        .first();
      if (thread && thread.title === "New Thread") {
        ctx.scheduler.runAfter(0, internal.threads.generateThreadTitle, {
          _threadId: thread._id,
          firstMessage: args.content,
        });
      }
    }
  },
});

export const getMessages = query({
  args: { threadId: v.string() },
  async handler(ctx, { threadId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authorized.");

    return await ctx.db
      .query("messages")
      .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();
  },
});

export const updateMessage = internalMutation({
  args: { _id: v.id("messages"), content: v.string() },
  async handler(ctx, args) {
    await ctx.db.patch(args._id, { content: args.content });
  },
});

export const getAiReply = internalAction({
  args: {
    _id: v.id("messages"),
    prompt: v.string(),
    model: v.string(),
    files: v.array(v.object({ storageId: v.id("_storage"), type: v.string() })),
  },
  async handler(ctx, args) {
    const fileContents: (ImagePart | FilePart)[] = [];
    for (const file of args.files) {
      const fileUrl = await ctx.storage.getUrl(file.storageId);
      if (fileUrl) {
        if (file.type.startsWith("image/")) fileContents.push({ type: "image" as const, image: fileUrl });
        if (file.type === "application/pdf")
          fileContents.push({ type: "file" as const, data: fileUrl, mediaType: "application/pdf" });
      }
    }

    const { textStream } = streamText({
      model: gateway(args.model),
      messages: [{ role: "user", content: [{ type: "text", text: args.prompt }, ...fileContents] }],
      onError(error: unknown) {
        console.log(error);
      },
    });

    let textRecievedSoFar = "";

    for await (const textPart of textStream) {
      textRecievedSoFar += textPart;
      await ctx.runMutation(internal.messages.updateMessage, {
        _id: args._id,
        content: textRecievedSoFar,
      });
    }
  },
});

export const generateUploadUrl = mutation({
  args: {},
  async handler(ctx) {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  async handler(ctx, args) {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getUserAttachments = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authorized.");

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();
    const files = messages.map((message) => message.files).flat();

    return files;
  },
});

export const branchOff = mutation({
  args: { threadId: v.string(), messageId: v.id("messages") },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authorized.");

    const messages = await ctx.runQuery(api.messages.getMessages, { threadId: args.threadId });
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
      await ctx.db.insert("messages", {
        userId: identity.subject,
        threadId: newThreadId,
        by: messageToCopy.by,
        content: messageToCopy.content,
        files: messageToCopy.files,
      });
    }

    const thread = await ctx.db
      .query("threads")
      .withIndex("by_threadId", (q) => q.eq("id", args.threadId))
      .first();
    if (!thread) throw new Error("Thread not found");

    ctx.db.insert("threads", {
      id: newThreadId,
      title: `🌿 ${thread.title}`,
      userId: identity.subject,
      isPublic: false,
    });

    return newThreadId;
  },
});
