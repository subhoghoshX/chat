import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  threads: defineTable({
    title: v.string(),
    isPublic: v.boolean(),
  }),
});
