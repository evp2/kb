# Project Overview

This is a full-stack Kanban board application built with React, Express, and TypeScript. The application provides a drag-and-drop interface for managing tasks across customizable columns, similar to tools like Trello or Jira.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns:

### Frontend Architecture

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Drag & Drop**: React DnD for kanban board interactions

### Backend Architecture

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Validation**: Zod for runtime type checking
- **Session Management**: Express sessions with PostgreSQL storage

## Key Components

### Database Schema

- **columns**: Stores kanban columns with title, color, and position
- **tasks**: Stores individual tasks with title, description, priority, column assignment, and position
- **users**: User authentication data (username/password)

### API Endpoints

- **Columns API**: CRUD operations for kanban columns (`/api/columns`)
- **Tasks API**: CRUD operations for tasks including move functionality (`/api/tasks`)
- **User API**: Authentication and user management (referenced but not fully implemented)

### Frontend Components

- **KanbanBoard**: Main drag-and-drop interface
- **KanbanColumn**: Individual column containers
- **TaskCard**: Draggable task items
- **Modals**: Task creation/editing, column creation, and deletion confirmations
- **SearchBar**: Task filtering functionality

## Data Flow

1. **Client Requests**: Frontend makes HTTP requests to Express API endpoints
2. **Data Validation**: Zod schemas validate incoming data against TypeScript types
3. **Database Operations**: Drizzle ORM handles PostgreSQL database interactions
4. **Response Caching**: TanStack Query caches responses and manages optimistic updates
5. **UI Updates**: React components re-render based on query state changes

## External Dependencies

### Database

- **Neon Database**: Serverless PostgreSQL database
- **Connection**: Uses `@neondatabase/serverless` driver
- **Migrations**: Drizzle Kit manages schema migrations

### UI Libraries

- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Icon library
- **React Hook Form**: Form state management with Zod validation
- **React DnD**: Drag and drop functionality
- **Date-fns**: Date formatting utilities

### Development Tools

- **ESBuild**: Server-side bundling for production
- **TSX**: Development server for TypeScript execution
- **GitHub Integration**: Custom CI actions for GitHub contributions and deployment previews for Pull requests

## Deployment Strategy

### Development Mode

- **Frontend**: Vite dev server with HMR (Hot Module Replacement)
- **Backend**: TSX for direct TypeScript execution
- **Database**: Connects to Neon Database via environment variable

### Production Build

- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Deployment**: Single Node.js process serves both API and static files
- **Environment**: Requires `DATABASE_URL` environment variable

### Key Architectural Decisions

1. **Monorepo Structure**: Shared TypeScript types between client and server reduce duplication
2. **In-Memory Fallback**: MemStorage class provides development fallback when database is unavailable
3. **Type Safety**: Drizzle-Zod integration ensures database schema matches TypeScript types
4. **Component Library**: shadcn/ui provides consistent, accessible UI components
5. **Optimistic Updates**: TanStack Query enables responsive UI with background synchronization
6. **Drag & Drop**: React DnD provides smooth kanban board interactions with proper accessibility
