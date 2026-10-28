import { httpRouter } from "convex/server";
import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub({
      // Configure these in Settings → Environment:
      // clientId: process.env.GITHUB_CLIENT_ID,
      // clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
});

const http = httpRouter();
auth.addHttpRoutes(http);

export default http;
