# Client Onboarding Platform

A complete full-stack client onboarding system featuring multi-step workflows, dynamic progress tracking, document management, and a comprehensive REST API.

## Features

- **Authentication System:** JWT-based access/refresh token rotation, bcrypt password hashing.
- **Dynamic Onboarding Workflow:** Multi-step guided process for onboarding new clients.
- **Document Management:** Secure file uploads via Multer, status tracking (pending, approved, rejected).
- **Profile Management:** Full CRUD operations for client and business profiles.
- **Modern UI:** Next.js frontend with Tailwind CSS, Lucide icons, responsive layout, glassmorphism design.
- **API Documentation:** Interactive Swagger/OpenAPI documentation.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, Radix UI, Zod, React Hook Form, Axios, TypeScript
- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL, JavaScript
- **Security:** Helmet, Express Rate Limit, JWT, CORS
- **Deployment:** Vercel (Frontend), Render (Backend), Neon.tech (Database)

## Required Technical Skills

To fully understand and contribute to this project, developers should have the following technical skills:

**Frontend (Client-Side)**
- **TypeScript & JavaScript (ES6+)**: Strong typing and modern JS features.
- **React.js**: Functional components, hooks, and state management.
- **Next.js (App Router)**: Understanding Server vs. Client components, routing, and optimization.
- **Tailwind CSS**: Utility-first CSS for responsive, modern UI design (e.g., glassmorphism).
- **Form Management & Validation**: Building complex forms with `react-hook-form` and validating with `zod`.
- **API Integration**: Handling async data fetching, error states, and token injection using `axios`.

**Backend (Server-Side)**
- **Node.js & Express.js**: Building RESTful APIs, routing, middleware chains, and centralized error handling.
- **Database & ORM (Prisma)**: Schema design, data modeling, migrations, and writing relational queries.
- **Authentication & Security**: Implementing JWT access/refresh token rotation, password hashing (`bcryptjs`), and API security best practices.
- **File Uploads**: Handling `multipart/form-data` and local/cloud file storage using `multer`.
- **API Documentation**: Defining OpenAPI/Swagger specifications for endpoints.
- **Testing**: Writing automated unit and integration tests using `jest` and `supertest`.

**Deployment & DevOps**
- **Cloud Platforms**: Deploying frontend applications to Vercel and backend Node.js APIs to Render.
- **Database Hosting**: Managing cloud PostgreSQL instances using Neon.tech.
- **Environment Management**: Securely configuring environment variables and CORS across different deployment providers.

## Project Structure

- `/frontend` - Next.js Application
- `/backend` - Express/Node.js API

## Setup Instructions

### 1. Database & Backend API

```bash
cd backend
npm install

# Set your PostgreSQL DATABASE_URL in the .env file first
npx prisma generate
npx prisma db push

# (Optional) Seed the database with demo users
npm run db:seed

# Start the dev server on port 5001
npm run dev
```

The API runs at `http://localhost:5001/api/v1`
API Documentation is at `http://localhost:5001/api/docs`

### 2. Frontend Next.js Application

```bash
cd frontend
npm install

# Start the Next.js frontend
npm run dev
```

The frontend will run at `http://localhost:3001` (or 3000 if available).

## API Endpoints

The core API is versioned at `/api/v1`. Most endpoints require a valid JWT passed in the `Authorization: Bearer <token>` header. Detailed interactive documentation is available via Swagger at `/api/docs`.

### Authentication (`/api/v1/auth`)
- `POST /register` - Register a new client
- `POST /login` - Authenticate and get JWT access & refresh tokens
- `POST /refresh` - Refresh the access token
- `GET /me` - Get current authenticated user info

### Profile (`/api/v1/profile`)
- `GET /` - Get current client's profile
- `PUT /` - Update client profile (upsert)
- `GET /complete` - Get complete client data (profile, steps, documents)

### Onboarding Workflow (`/api/v1/onboarding`)
- `GET /progress` - Get onboarding progress summary
- `GET /steps` - Get all onboarding steps for the client
- `GET /steps/:stepNumber` - Get a specific onboarding step
- `PATCH /steps/:stepNumber` - Update an onboarding step status
- `POST /start` - Start the onboarding process
- `POST /complete-step/:stepNumber` - Complete a step and automatically advance

### Documents (`/api/v1/documents`)
- `POST /upload` - Upload a new document (`multipart/form-data`)
- `GET /` - List all uploaded documents for the client
- `GET /:id` - Get specific document details
- `DELETE /:id` - Delete a document

### Clients (`/api/v1/clients`)
- `GET /` - Get all registered clients (Admin only)
- `GET /:id` - Get a specific client by ID

## Demo Credentials

If you seeded the database, you can use the following accounts:
- **Email:** `demo@example.com`
- **Password:** `Demo@1234`

- **Email:** `jane@example.com`
- **Password:** `Test@5678`

## Development Notes
- The database uses PostgreSQL. Ensure `DATABASE_URL` is properly configured in `backend/.env`.
- File uploads are saved in `backend/uploads/` (Note: ephemeral storage on free cloud tiers).
- Change `PORT` in backend `.env` if 5001 is already taken.
