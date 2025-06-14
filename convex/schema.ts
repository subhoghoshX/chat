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
  }).index("by_thread_id", ["threadId"]),
});
