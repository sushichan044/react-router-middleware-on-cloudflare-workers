import {
  createRequestHandler,
  type unstable_InitialContext,
} from "react-router";

import { Hono } from "hono";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore virtual module provided by React Router at build time
import * as build from "virtual:react-router/server-build";
import {
  setCloudflareRRCtx,
  setExecutionContextRRCtx,
  setApiClientRRCtx,
} from "../app/entry.server";
import { apiRoutes, type APIRoutes } from "./api";
import { hc } from "hono/client";

type HonoConfig = {
  Bindings: CloudflareBindings;
  Variables: {
    apiClient: ReturnType<typeof hc<APIRoutes>>;
  };
};

const app = new Hono<HonoConfig>();

app.use(async (c, next) => {
  // api has base path /api
  const apiClient = hc<APIRoutes>(new URL("/api", c.req.url).toString());
  c.set("apiClient", apiClient);
  await next();
});

app.route("/api", apiRoutes);

const reactRouterHandler = createRequestHandler(build, import.meta.env.MODE);

app.all("*", async (c) => {
  const rrCtx: unstable_InitialContext = new Map();

  setCloudflareRRCtx(rrCtx, c.env);
  setExecutionContextRRCtx(rrCtx, c.executionCtx);
  setApiClientRRCtx(rrCtx, c.get("apiClient"));

  return reactRouterHandler(c.req.raw, rrCtx);
});

export default app;
