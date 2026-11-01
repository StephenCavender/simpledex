import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "EXPO_PUBLIC_",
  client: {
    EXPO_PUBLIC_CONVEX_URL: z.url(),
  },
  // Expo only inlines `process.env.EXPO_PUBLIC_*` when each one is referenced
  // by name, so the variables are listed here instead of passing `process.env`.
  runtimeEnv: {
    EXPO_PUBLIC_CONVEX_URL: process.env.EXPO_PUBLIC_CONVEX_URL,
  },
  emptyStringAsUndefined: true,
});
