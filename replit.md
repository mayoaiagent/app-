# Replit.md

## Overview

This is a full-stack web application built with a modern React frontend and Express.js backend. The application implements a points-based system with Stripe payment integration, user authentication, and a PostgreSQL database. It's designed as a mobile-first web app with a clean, modern UI using shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Store**: PostgreSQL-backed sessions using connect-pg-simple
- **Payment Processing**: Stripe integration for point purchases
- **API Design**: RESTful endpoints with JSON responses

### Database Architecture
- **Database**: PostgreSQL with Neon serverless connection
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Users, transactions, and point packages tables with proper relations
- **Migrations**: Drizzle Kit for schema management

## Key Components

### Authentication System
- Session-based authentication using Passport.js
- Password hashing with Node.js crypto (scrypt)
- Protected routes with authentication middleware
- User registration and login with form validation

### Points System
- Users can purchase point packages through Stripe
- Transaction history tracking for all point activities
- Support for different transaction types (purchase, bonus, spend)
- Real-time balance updates

### Payment Integration
- Stripe Elements integration for secure payment processing
- Payment intent creation and confirmation flow
- Customer management and payment history
- Error handling and user feedback

### UI Components
- Mobile-first responsive design
- Dark/light theme support through CSS variables
- Comprehensive UI component library (buttons, forms, cards, etc.)
- Toast notifications for user feedback
- Loading states and error handling

## Data Flow

1. **Authentication Flow**: Users log in → Passport validates credentials → Session created → User data cached in React Query
2. **Dashboard Flow**: Protected route → Fetch user data and transactions → Display points balance and recent activity
3. **Purchase Flow**: Select package → Create Stripe payment intent → Process payment → Update user points → Refresh dashboard
4. **Transaction Flow**: All point changes create transaction records → Real-time updates to user balance

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection with WebSocket support
- **@stripe/stripe-js & @stripe/react-stripe-js**: Payment processing
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Type-safe database operations
- **passport & passport-local**: Authentication
- **react-hook-form & @hookform/resolvers**: Form handling
- **zod**: Schema validation

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority & clsx**: Conditional styling utilities

## Deployment Strategy

### Build Process
- Frontend: Vite builds React app to `dist/public`
- Backend: esbuild compiles TypeScript server to `dist/index.js`
- Single build command handles both frontend and backend

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `STRIPE_SECRET_KEY`: Stripe server-side key
- `VITE_STRIPE_PUBLIC_KEY`: Stripe client-side key

### Development Setup
- Hot reload for both frontend and backend
- Database migrations with Drizzle Kit
- TypeScript checking across the entire codebase
- Vite dev server with Express API integration

### Production Considerations
- Static file serving from Express
- Session persistence in PostgreSQL
- Database connection pooling with Neon
- Error handling and logging middleware
- Stripe webhook integration for payment confirmations

## Recent Changes

### January 27, 2025
- ✓ Fixed React hooks error in AuthPage by moving redirect logic after hook calls
- ✓ Connected React Native mobile app to backend API
- ✓ Configured Stripe payment integration with live keys
- ✓ Database schema initialized with users, transactions, and point packages
- ✓ All authentication endpoints working (register, login, logout, user)
- ✓ Points purchasing system fully operational
- ✓ Mobile-first web interface with responsive design