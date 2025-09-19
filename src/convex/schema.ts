import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  messages: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
  }).index("by_email", ["email"]),
});

export default schema;
