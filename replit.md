# Founder Update Content Generator

## Overview

A specialized AI-powered web application that transforms founder updates into engaging content. The system analyzes founder update text using xAI's Grok model to suggest optimal content format (image or video), then generates blog posts, LinkedIn content, and visual assets using multiple AI services. Built with React frontend and Express backend for rapid MVP deployment.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL store

### Design System
- **Component Library**: shadcn/ui built on Radix UI
- **Styling Approach**: Utility-first with Tailwind CSS
- **Theme**: Neutral color palette with CSS custom properties
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts

## Key Components

### Frontend Components
- **Navigation**: Sticky navigation with smooth scrolling
- **Hero Section**: Landing page with call-to-action buttons
- **Features Grid**: Responsive feature showcase
- **About Section**: Project information and benefits
- **Contact Section**: Quick start guide and GitHub integration
- **Footer**: Site links and branding

### Backend Components
- **Express Server**: RESTful API server with middleware
- **Database Layer**: Drizzle ORM with PostgreSQL
- **Storage Interface**: Abstracted storage layer with in-memory fallback
- **Route Registration**: Modular route organization
- **Development Tools**: Vite integration for hot reloading

### Shared Components
- **Schema Definitions**: Shared TypeScript types and Zod schemas
- **Database Models**: User entity with validation

## Data Flow

1. **Client Requests**: React components make API calls using TanStack Query
2. **Server Processing**: Express routes handle HTTP requests
3. **Data Layer**: Storage interface abstracts database operations
4. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
5. **Response Handling**: JSON responses with error handling middleware

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Router alternative)
- Express.js with TypeScript support
- Drizzle ORM with PostgreSQL adapter

### UI and Styling
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography

### Development Tools
- Vite for build tooling and development server
- TypeScript for type safety
- ESLint and Prettier for code quality

### Database and Storage
- Neon Database for serverless PostgreSQL
- connect-pg-simple for session storage
- Drizzle Kit for database migrations

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with hot module replacement
- Express server with TypeScript compilation via tsx
- Database migrations via Drizzle Kit

### Production Build
- Frontend: Vite build with optimized assets
- Backend: esbuild compilation to single JavaScript file
- Static assets served from Express server

### Environment Configuration
- Environment variables for database connection
- Separate development and production configurations
- Replit-specific optimizations for cloud deployment

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 03, 2025. Redesigned to exact Perplexity-style interface with dark theme and sidebar
- Added smart model selection system with xAI analyzing tasks to choose optimal AI models
- Integrated multi-provider AI system (xAI, Gemini, ready for OpenAI, Anthropic, Runway ML)
- Enhanced UI with professional card layouts and model tracking display
- Added /api/models and /api/recommend endpoints for model intelligence
- Implemented HeyGen V2 API for professional avatar video generation
- Modernized UI with cleaner, minimal design and fewer words
- Added async video processing for better user experience
- Integrated Tavus API for AI avatar video generation with personalized content
- Added Creatomate API for template-based video automation and branded content
- Enhanced model selection with 9 total AI providers including video generation specialists