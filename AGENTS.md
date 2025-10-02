# GrowFarm - Farm Management System

## Project Overview

GrowFarm is a comprehensive farm management system designed for agricultural project tracking, farm monitoring, and harvest management. The system includes an AI assistant named "Daisy" powered by Model Context Protocol (MCP) to help users manage their farms and projects through natural language conversations.

## Architecture

This project uses a **monorepo structure** with the following packages:

### Core Applications

- `./apps/frontend` - Next.js 15 web application (React 19)
- `./apps/backend` - Express.js REST API with custom dependency injection

### Supporting Directories

- `./docs` - API documentation and Swagger specs
- `./dockerfiles` - Docker configurations for deployment

## Technology Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with custom interceptors
- **State Management**: React Context API
- **Persistence**: localStorage for chat history

### Backend

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Dependency Injection**: Custom DI container with decorators

## Package Manager

**bun** - Fast all-in-one JavaScript runtime and package manager

## Common Commands

```bash
# Development
bun run --filter "./apps/frontend" dev
bun run --filter "./apps/backend" dev

# Build
bun run --filter "./apps/frontend" build
bun run --filter "./apps/backend" build

# Database operations
bun run --filter "./apps/backend" prisma:gen    # Generate Prisma client
bun run --filter "./apps/backend" prisma:studio # Open Prisma Studio

# Linting (all workspaces)
bun run --filter "*" lint

# Run specific workspace script
bun run --filter "<workspace-path>" <script-name>
```

## API Documentation

### Swagger/OpenAPI Specification

- Location: `./docs/swagger.json`

## Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **Decorators**: Used for dependency injection (`@injectable`, `@inject`)
- **Validation**: Zod schemas for request validation
- **Error Handling**: Custom error classes with proper HTTP status codes
