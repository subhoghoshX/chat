import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  threads: defineTable({
    id: v.string(),
    title: v.string(),
    isPublic: v.boolean(),
    userId: v.string(),
  }).index("by_thread_id", ["id"]),

  messages: defineTable({
    threadId: v.string(),
    content: v.string(),
    by: v.string(),
    userId: v.string(),
    files: v.array(v.object({ storageId: v.id("_storage"), type: v.string() })),
  }).index("by_thread_id", ["threadId"]),

  // for unauthenticated users, these will be moved to
  // permanent tables above when they authenticate
  temporary_threads: defineTable({
    id: v.string(),
    title: v.string(),
    isPublic: v.boolean(),
    userId: v.string(),
  }).index("by_thread_id", ["id"]),

  temporary_messages: defineTable({
    threadId: v.string(),
    content: v.string(),
    by: v.string(),
    userId: v.string(),
  }).index("by_thread_id", ["threadId"]),
});
