import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const messageFields = {
  threadId: v.string(),
  content: v.string(),
  by: v.string(),
  userId: v.string(),
  files: v.array(v.object({ storageId: v.id("_storage"), type: v.string() })),
};

export const temporaryMessageFields = {
  threadId: v.string(),
  content: v.string(),
  by: v.string(),
  userId: v.string(),
};

export default defineSchema({
  threads: defineTable({
    id: v.string(),
    title: v.string(),
    isPublic: v.boolean(),
    userId: v.string(),
  }).index("by_threadId", ["id"]),

  messages: defineTable(messageFields).index("by_threadId", ["threadId"]).index("by_userId", ["userId"]),

  // for unauthenticated users, these will be moved to
  // permanent tables above when they authenticate
  temporary_threads: defineTable({
    id: v.string(),
    title: v.string(),
    isPublic: v.boolean(),
    userId: v.string(),
  }).index("by_threadId", ["id"]),

  temporary_messages: defineTable(temporaryMessageFields).index("by_threadId", ["threadId"]),
});
