import type { hc } from "hono/client";
import { createContext, RouterContextProvider } from "react-router";
import type { APIRoutes } from "../workers/api";

// `createContext()` should be executed in React Router's runtime.
// So, placing it here, not in workers/app.ts
function createContextWithAccessor<T>() {
  const ctx = createContext<T>();

  return {
    get: (provider: Readonly<RouterContextProvider>) => provider.get(ctx),
    set: (provider: RouterContextProvider, value: T) =>
      provider.set(ctx, value),
  };
}

export const cloudflareContext =
  createContextWithAccessor<CloudflareBindings>();

export const apiClientContext =
  createContextWithAccessor<ReturnType<typeof hc<APIRoutes>>>();

export const executionContextContext =
  createContextWithAccessor<ExecutionContext>();
