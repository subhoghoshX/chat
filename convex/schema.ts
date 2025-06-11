import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  threads: defineTable({
    id: v.string(),
    title: v.string(),
    isPublic: v.boolean(),
  }),
  messages: defineTable({
    thread_id: v.string(),
    content: v.string(),
    by: v.string(),
  }).index("by_thread_id", ["thread_id"]),
});
