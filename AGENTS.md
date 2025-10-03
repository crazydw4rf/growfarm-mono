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
- **Markdown Rendering**: react-markdown with @tailwindcss/typography for chat responses
- **Internationalization**: next-intl for bilingual support (Indonesian & English)

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
## How to install package

To install a package you need to cd first in target package or workspace, example:

```bash
cd ./apps/frontend
bun add react-markdown
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

## Internationalization (i18n)

### Supported Languages

- **Indonesian (id)**: Default language
- **English (en)**: Secondary language

### Implementation

- **Library**: next-intl for Next.js 15 App Router
- **Translation Files**: JSON files in `/messages` directory (`id.json`, `en.json`)
- **Language Switcher**: Global component in dashboard layout with language toggle
- **Locale Persistence**: Stored in `NEXT_LOCALE` cookie
- **Backend Support**: Daisy AI responds in user's selected language

### Usage

```tsx
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('navigation');
  return <div>{t('dashboard')}</div>;
}
```

### Adding Translations

1. Add keys to both `/messages/id.json` and `/messages/en.json`
2. Use namespaces for organization (e.g., `navigation`, `chat`, `farms`)
3. Access translations with dot notation: `t('chat.title')`

## Chat Features

### Markdown Support

Daisy's chat responses support markdown formatting:
- **Bold text**: `**text**`
- *Italic text*: `*text*`
- Lists (ordered and unordered)
- Headings
- Code blocks
- Links

Assistant messages are automatically rendered with markdown support using `react-markdown` and styled with Tailwind Typography plugin.

### Multilingual Chat

Daisy responds in the user's selected language (Indonesian or English):
- Language detected from locale cookie
- Separate system instructions for each language
- Consistent personality across languages
- Example prompts translated automatically
