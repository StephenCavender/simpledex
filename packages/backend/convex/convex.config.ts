import { defineApp } from "convex/server";

const app = defineApp();
app.use("@convex-dev/auth");

export default app;
