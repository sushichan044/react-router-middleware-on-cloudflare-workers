import { Hono } from "hono";

const app = new Hono();

export const apiRoutes = app
  .get("/health", (c) => {
    return c.json({ status: "ok" });
  })
  .get("/slow", async (c) => {
    // wait 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return c.json({ message: "ok" });
  });

export type APIRoutes = typeof apiRoutes;
