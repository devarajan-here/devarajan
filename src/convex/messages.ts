import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const message = args.message.trim();

    if (!name || !email || !message) {
      throw new Error("All fields are required.");
    }
    if (!email.includes("@") || email.startsWith("@") || email.endsWith("@")) {
      throw new Error("Please enter a valid email address.");
    }

    await ctx.db.insert("messages", { name, email, message });
  },
});
