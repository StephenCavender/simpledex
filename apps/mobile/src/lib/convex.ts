import { env } from "@simpledex/env/native";
import { ConvexReactClient } from "convex/react";

export const convex = new ConvexReactClient(env.EXPO_PUBLIC_CONVEX_URL);
