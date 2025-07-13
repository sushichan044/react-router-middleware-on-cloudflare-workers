
# Cloudflare Workers + React Router with Context Integration

A comprehensive example demonstrating React Router v7 with unstable middleware feature, running on Cloudflare Workers. This project showcases how to integrate Cloudflare Worker context (bindings, execution context) with React Router's context system, enabling seamless server-side context sharing across your application.

## What This Project Demonstrates

This project solves a common challenge when building full-stack applications with React Router on Cloudflare Workers: **how to inject server-side context (like API clients, database connections, or environment variables) into React Router's context system**.

## Directory Structure

```
├── app/                          # React Router application
│   ├── entry.server.tsx         # Server entry + context definitions
│   ├── root.tsx                 # Root layout component
│   ├── routes/
│   │   └── home.tsx             # Example route using injected context
│   └── routes.ts                # Route configuration
├── workers/                      # Cloudflare Worker code
│   ├── app.ts                   # Main Worker entry point
│   └── api/
│       └── index.ts             # Hono API routes
├── react-router.config.ts       # React Router configuration
├── wrangler.jsonc               # Cloudflare Worker configuration
└── vite.config.ts               # Vite build configuration
```

## Understanding React Router's Context Integration

### 1. Define Context Creators (`app/entry.server.tsx`)

**Why here?** Context creators must be executed within React Router's framework runtime, which has its own context system.

```typescript
// Define context keys
export const cloudflareRRCtx = unstable_createContext<CloudflareBindings>();
export const apiClientRRCtx =
  unstable_createContext<ReturnType<typeof hc<APIRoutes>>>();
export const executionContextRRCtx = unstable_createContext<ExecutionContext>();

// Define setter utilities to inject context instance
export const setCloudflareRRCtx = (ctx: unstable_InitialContext, env: CloudflareBindings) => {
  ctx.set(cloudflareRRCtx, env);
};

export const setApiClientRRCtx = (
  ctx: unstable_InitialContext,
  apiClient: ReturnType<typeof hc<APIRoutes>>
) => {
  ctx.set(apiClientRRCtx, apiClient);
};

export const setExecutionContextRRCtx = (
  ctx: unstable_InitialContext,
  executionContext: ExecutionContext
) => {
  ctx.set(executionContextRRCtx, executionContext);
};
```

### 2. Inject Context in Worker (`workers/app.ts`)

When using `createRequestHandler` to connect React Router with your custom web server, you must inject the React Router context at this layer. This is the bridge between the Worker runtime and React Router's framework runtime.

> [!WARNING]
> If you see an error like this when implementing context injection:
>
> ```plaintext
> Unable to create initial `unstable_RouterContextProvider` instance.
> Please confirm you are returning an instance of `Map<unstable_routerContext, unknown>` from your `getLoadContext` function.
> ```
>
> This error appears when your context injection implementation is incorrect. However, the error message itself refers to the standard React Router approach using `getLoadContext`. When using a custom web server with `createRequestHandler` (like this repository), you should ignore this specific error message and use the implementation pattern shown below instead.
>
> If you implement the pattern correctly as shown in this repository, this error message will not appear.
>
> error ref: <https://github.com/remix-run/react-router/blob/c0e186764e0309415b2de38565995c142f986eb5/packages/react-router/lib/server-runtime/server.ts#L138-L145>

```typescript
import {
  createRequestHandler,
  type unstable_InitialContext,
} from "react-router";
import * as build from "virtual:react-router/server-build";
import {
  setCloudflareRRCtx,
  setExecutionContextRRCtx,
  setApiClientRRCtx,
} from "../app/entry.server";

const reactRouterHandler = createRequestHandler(build, import.meta.env.MODE);

app.all("*", async (c) => {
  const rrCtx: unstable_InitialContext = new Map();

  // Inject React Router's Context
  setCloudflareRRCtx(rrCtx, c.env);
  setExecutionContextRRCtx(rrCtx, c.executionCtx);
  setApiClientRRCtx(rrCtx, c.get("apiClient"));

  // Pass context to React Router
  return reactRouterHandler(c.req.raw, rrCtx);
});
```

### 3. Use Context in Routes (`app/routes/home.tsx`)

```typescript
export function loader({ context }: Route.LoaderArgs) {
  // Access injected context
  const cf = context.get(cloudflareRRCtx);

  return { message: cf.VALUE_FROM_CLOUDFLARE };
}
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Cloudflare account (for deployment)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd react-router-with-container

# Install dependencies
pnpm install

# Generate Cloudflare types
pnpm run typegen
```

### Development

```bash
# Start development server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to see the application.

### Building and Deployment

```bash
# Build for production
pnpm build

# Deploy to Cloudflare Workers
pnpm deploy
```

## Configuration

### Environment Variables

Configure environment variables in `wrangler.jsonc`:

```json
{
  "vars": {
    "VALUE_FROM_CLOUDFLARE": "Hello from Cloudflare"
  }
}
```

### React Router Configuration

The project uses React Router v7 with experimental features enabled in `react-router.config.ts`:

```typescript
export default {
  ssr: true,
  future: {
    unstable_viteEnvironmentApi: true,
    unstable_middleware: true,  // Required for context injection
  },
} satisfies Config;
```

## Learn More

- [React Router Middleware Documentation](https://reactrouter.com/how-to/middleware#custom-server-with-getloadcontext)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Hono Documentation](https://hono.dev/)

## License

MIT
