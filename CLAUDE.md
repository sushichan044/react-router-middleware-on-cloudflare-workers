# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build the application for production
- `pnpm typecheck` - Run TypeScript type checking and generate Cloudflare types
- `pnpm deploy` - Build and deploy to Cloudflare Workers
- `pnpm preview` - Preview production build locally
- `pnpm typegen` - Generate Cloudflare Worker / React Router types

## Architecture Overview

This is a React Router v7 application running on Cloudflare Workers with unstable middleware enabled. The architecture demonstrates how to inject server-side context (like API clients) into React Router's context system.

### Key Architecture Components

1. **Dual Application Structure**:
   - `workers/app.ts` - Main Cloudflare Worker entry point using Hono
   - `app/` - React Router application code

2. **Context Injection Pattern**:
   - `workers/app.ts` creates API client and injects it into React Router context
   - `app/context.ts` defines centralized context creators with accessor utilities for Cloudflare bindings, execution context, and API client
   - Routes can access these contexts using React Router's context API

3. **API Integration**:
   - `workers/api/index.ts` - Simple Hono API routes (/health, /slow)
   - API client is created using Hono's `hc` client and injected into all React Router requests
   - Demonstrates server-to-server communication within the same Worker

### Important Files

- `react-router.config.ts` - Enables v8 middleware and Vite environment API
- `workers/app.ts:37-44` - Context injection into React Router
- `app/context.ts` - Centralized context definition and accessor utilities
- `workers/api/index.ts` - API route definitions

### Development Notes

- Uses React Router v7 with v8 middleware feature
- TypeScript configuration includes Cloudflare Workers types
- Hono is used for both API routes and middleware
- Tailwind CSS for styling
- Centralized context management pattern using `app/context.ts`
