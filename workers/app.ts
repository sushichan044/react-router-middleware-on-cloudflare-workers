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
} from "../app/entry.server";

type HonoConfig = {
  Bindings: CloudflareBindings;
};

const app = new Hono<HonoConfig>();

const reactRouterHandler = createRequestHandler(build, import.meta.env.MODE);

app.all("*", async (c) => {
  const rrCtx: unstable_InitialContext = new Map();

  setCloudflareRRCtx(rrCtx, c.env);
  setExecutionContextRRCtx(rrCtx, c.executionCtx);

  return reactRouterHandler(c.req.raw, rrCtx);
});

export default app;
