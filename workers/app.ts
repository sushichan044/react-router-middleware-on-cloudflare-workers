import { createRequestHandler } from "react-router";

import { Hono } from "hono";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore virtual module provided by React Router at build time
import * as build from "virtual:react-router/server-build";

type HonoConfig = {
  Bindings: CloudflareBindings;
};

const app = new Hono<HonoConfig>();

const reactRouterHandler = createRequestHandler(build, import.meta.env.MODE);

app.all("*", async (c) => {
  return reactRouterHandler(c.req.raw);
});

export default app;
