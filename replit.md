# OmeClone

## Overview

OmeClone is an anonymous video chat application similar to Omegle. Users can instantly connect with random strangers for video and text chat without requiring login or registration. The application uses WebRTC for peer-to-peer video/audio streaming and WebSocket for real-time signaling and text messaging.

## User Preferences

Preferred communication style: Simple, everyday language.
Database changes: Must notify user before making schema changes as they require manual execution on Turso.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query for server state, React hooks for local state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite
- **Animations**: Framer Motion for UI animations

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/` (Home, Chat, NotFound)
- Reusable components in `client/src/components/`
- UI primitives from shadcn/ui in `client/src/components/ui/`
- Custom hooks in `client/src/hooks/`

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **API Pattern**: REST endpoints for reports, WebSocket for real-time chat signaling

The server handles:
- WebSocket connections for user matching and WebRTC signaling
- REST API for user reports
- Static file serving in production
- Vite dev server integration in development

### Real-time Communication
- **WebRTC**: Peer-to-peer video/audio using Google STUN server (`stun:stun.l.google.com:19302`)
- **WebSocket**: Server-side signaling at `/ws` path for user matching and ICE candidate exchange
- **Matching System**: Queue-based random pairing of connected users

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Located in `shared/schema.ts`
- **Migrations**: Managed via `drizzle-kit push`

Current schema includes:
- `reports` table for user reports (id, reason, createdAt)

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database schema and TypeScript types
- `routes.ts`: API route definitions with Zod validation

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Database queries and schema management
- **connect-pg-simple**: Session storage (available but not currently implemented)

### WebRTC Infrastructure
- **Google STUN Server**: `stun:stun.l.google.com:19302` for NAT traversal

### UI Framework
- **shadcn/ui**: Pre-built accessible components based on Radix UI primitives
- **Tailwind CSS**: Utility-first styling with custom theme configuration
- **Framer Motion**: Animation library for smooth UI transitions

### Development Tools
- **Vite**: Development server with HMR
- **esbuild**: Production bundling for server code
- **TypeScript**: Type checking across the codebase