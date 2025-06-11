import { query } from "./_generated/server";

export const getThreads = query({
  args: {},
  async handler(ctx) {
    return await ctx.db.query("threads").collect();
  },
});
