# Grow Farm - Farm Management System

A comprehensive farm management system built with Next.js 15, TypeScript, and Tailwind CSS. This application allows users to manage agricultural projects and farms efficiently.

## Features

### 🌱 Core Functionality

- **User Authentication**: Secure login/register with JWT tokens
- **Project Management**: Create, view, edit, and delete agricultural projects
- **Farm Management**: Add farms to projects with detailed information
- **Dashboard**: Overview of projects, farms, and key statistics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### 📊 Farm Details

- Farm name, location, and land size
- Commodity type and pricing
- Soil type classification (10+ Indonesian soil types)
- Planting and harvest dates
- Farm status tracking (Active/Harvested)
- Harvest quantity recording

### 🏗️ Project Features

- Project planning with budgets and timelines
- Status tracking (Planning/In Progress/Completed)
- Multiple farms per project
- Project descriptions and notes

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Authentication**: JWT with HTTP-only cookies

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API server running (see backend repository)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd growfarm-fe
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

Edit `.env.local` and set your API URL:
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Integration

This frontend integrates with the Agroflow backend API. The API endpoints include:

### Authentication

- `POST /v1/users/register` - User registration
- `POST /v1/auth/login` - User login
- `POST /v1/auth/logout` - User logout
- `POST /v1/auth/refresh` - Refresh access token
- `GET /v1/users/me` - Get current user

### Projects

- `GET /v1/projects` - Get user's projects
- `POST /v1/projects` - Create new project
- `GET /v1/projects/:id` - Get project by ID
- `PATCH /v1/projects/:id` - Update project
- `DELETE /v1/projects/:id` - Delete project

### Farms

- `GET /v1/projects/:projectId/farms` - Get farms by project
- `POST /v1/projects/:projectId/farms` - Create new farm
- `GET /v1/projects/:projectId/farms/:farmId` - Get farm by ID
- `PATCH /v1/projects/:projectId/farms/:farmId` - Update farm
- `DELETE /v1/projects/:projectId/farms/:farmId` - Delete farm

## Project Structure

\`\`\`
src/
├── app/ # Next.js app router pages
│ ├── auth/ # Authentication pages
│ ├── dashboard/ # Dashboard page
│ ├── projects/ # Project management pages
│ ├── farms/ # Farm overview page
│ ├── layout.tsx # Root layout
│ └── page.tsx # Home page (redirects)
├── components/ # Reusable components
│ ├── dashboard-layout.tsx
│ └── protected-route.tsx
├── contexts/ # React contexts
│ └── auth-context.tsx # Authentication context
├── lib/ # Utilities and API client
│ ├── api-client.ts # Axios configuration
│ └── api.ts # API service functions
└── types/ # TypeScript type definitions
└── api.ts # API types from swagger
\`\`\`

## Backend Integration Suggestions

Based on the current API implementation, here are some suggestions for backend enhancements:

### 📈 Analytics & Reporting

- Add endpoint for farm productivity metrics
- Harvest yield analysis over time
- Project ROI calculations
- Weather data integration for farming insights

### 🌾 Advanced Farm Features

- **Crop Rotation Planning**: Track crop rotation schedules
- **Irrigation Management**: Water usage tracking and scheduling
- **Pest & Disease Tracking**: Log treatments and interventions
- **Equipment Management**: Track farm equipment and maintenance
- **Labor Management**: Worker scheduling and task assignments

### 📱 Mobile Features

- **Offline Support**: Cache data for offline farming operations
- **Photo Upload**: Field condition photos and progress images
- **GPS Integration**: Precise farm location and area mapping
- **Notification System**: Reminders for planting, harvesting, treatments

### 🔄 Integration Features

- **Weather API**: Real-time weather data and forecasts
- **Market Prices**: Commodity price tracking and alerts
- **Supply Chain**: Integration with suppliers and buyers
- **Government Reports**: Export data for agricultural reporting

### 🛡️ Security & Compliance

- **Multi-tenant Support**: Support for agricultural cooperatives
- **Audit Logging**: Track all farm activities and changes
- **Data Export**: CSV/PDF reports for regulatory compliance
- **Backup & Recovery**: Automated data backup systems

### 📊 Additional Endpoints Suggestions

\`\`\`typescript
// Analytics endpoints
GET /v1/analytics/farm-productivity
GET /v1/analytics/harvest-trends
GET /v1/analytics/project-roi

// Advanced farm management
GET /v1/projects/:projectId/farms/:farmId/activities
POST /v1/projects/:projectId/farms/:farmId/activities
GET /v1/projects/:projectId/farms/:farmId/treatments
POST /v1/projects/:projectId/farms/:farmId/treatments

// File management
POST /v1/projects/:projectId/farms/:farmId/photos
GET /v1/projects/:projectId/farms/:farmId/photos

// Notifications
GET /v1/notifications
POST /v1/notifications/mark-read
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
