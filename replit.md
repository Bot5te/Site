# CV Management System - Replit Guide

## Overview

This is a full-stack CV management system built for managing worker resumes from different nationalities (Philippines, Ethiopia, Kenya). The application provides a public interface for viewing CVs and an admin interface for managing uploads and data.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with Shadcn/ui components
- **UI Components**: Radix UI primitives with custom styling
- **Language**: Arabic (RTL) support with English fallbacks

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **File Uploads**: Multer for handling multipart form data
- **Development**: Vite for development server and HMR
- **Build**: ESBuild for production bundling

### Data Storage
- **Database**: PostgreSQL with Neon serverless driver (production ready)
- **ORM**: Drizzle ORM with Zod for schema validation
- **Data Persistence**: DatabaseStorage class with full CRUD operations
- **File Storage**: Local filesystem in `uploads/` directory

## Key Components

### Database Schema (`shared/schema.ts`)
- **CVs Table**: Stores CV metadata (name, age, nationality, file info)
- **Users Table**: Admin user authentication
- **Validation**: Zod schemas for type-safe data validation

### File Upload System
- **Supported Formats**: PDF, JPEG, PNG
- **File Size Limit**: 5MB per file
- **Storage**: Local filesystem with timestamp-based naming
- **Validation**: File type and size validation with error handling

### Authentication
- **Admin Login**: Simple password-based authentication
- **Session Management**: Express sessions (configured for PostgreSQL)
- **Access Control**: Admin-only routes for CV management

### UI Components
- **CV Cards**: Grid layout with nationality filtering
- **File Preview**: Modal-based CV viewing
- **Admin Panel**: CRUD operations for CV management
- **Responsive Design**: Mobile-first approach with RTL support

## Data Flow

1. **Public Access**: Users browse CVs by nationality, search by name, preview files
2. **Admin Upload**: Admins log in, upload CV files with metadata
3. **File Processing**: Server validates, stores files, saves metadata to database
4. **Data Fetching**: React Query manages API calls and caching
5. **State Updates**: Optimistic updates with server synchronization

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL driver
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **express**: Web server framework
- **multer**: File upload handling
- **wouter**: Lightweight routing

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

## Deployment Strategy

### Development
- **Command**: `npm run dev`
- **Port**: 5000 (configured in .replit)
- **Features**: Hot reload, error overlay, development logging

### Production Build
- **Client Build**: Vite builds React app to `dist/public`
- **Server Build**: ESBuild bundles server to `dist/index.js`
- **Start Command**: `npm run start`

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **File Uploads**: `uploads/` directory auto-created

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Deployment**: Autoscale with build/run commands
- **Port Mapping**: 5000 → 80 for external access

## Changelog

```
Changelog:
- June 16, 2025. Initial setup
- June 16, 2025. Updated branding to "إنجاز وجدارة لإستقدام العمالة المنزلية"
- June 16, 2025. Implemented PostgreSQL database with Neon driver for data persistence
- June 16, 2025. Enhanced mobile responsiveness across all components
- June 16, 2025. Added custom logo and updated UI styling
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## Development Notes

- The application uses in-memory storage for development but is configured for PostgreSQL in production
- File uploads are stored locally - consider cloud storage for production scaling
- Admin authentication is basic - implement proper JWT or OAuth for production
- Arabic RTL support is implemented but may need refinement for complex layouts
- Database migrations are handled via `npm run db:push` using Drizzle Kit