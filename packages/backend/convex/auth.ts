import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import Discord from "@auth/core/providers/discord";
import { query, MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx: MutationCtx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }
      const userId = await ctx.db.insert("users", {
        name: args.profile?.name as string | undefined,
        email: args.profile?.email as string | undefined,
        image: args.profile?.image as string | undefined,
      });
      return userId;
    },
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.auth.getUserIdentity();
  },
});
