# Event Expense Management System

A full-stack expense workflow platform for college clubs with role-based control, reimbursement lifecycle tracking, and analytics dashboards.

## Stack

- Frontend: React (Vite), Tailwind CSS, Recharts, Axios, React Router
- Backend: Node.js, Express.js, Mongoose, JWT, bcryptjs, Cloudinary
- Database: MongoDB

## Folder Structure

- `backend/`
  - `src/models/`
  - `src/controllers/`
  - `src/routes/`
  - `src/middleware/`
  - `src/config/`
  - `src/utils/`
- `frontend/`
  - `src/components/`
  - `src/pages/`
  - `src/hooks/`
  - `src/services/`
  - `src/context/`

## Backend Setup

1. Open terminal in `backend`.
2. Install dependencies:
   - `npm install`
3. Create `.env` from `.env.example` and fill values:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Run dev server:
   - `npm run dev`
5. Run production server:
   - `npm start`

Server runs at `http://localhost:5000` by default.

## Frontend Setup

1. Open terminal in `frontend`.
2. Install dependencies:
   - `npm install`
3. Create `.env` from `.env.example`.
4. Set backend URL:
   - `VITE_API_BASE_URL=http://localhost:5000/api`
5. Run dev server:
   - `npm run dev`
6. Build production bundle:
   - `npm run build`

## Core API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Events
- `POST /api/events` (admin)
- `GET /api/events`

### Expenses
- `POST /api/expenses/prepaid`
- `POST /api/expenses/postpaid`
- `GET /api/expenses/my`
- `GET /api/expenses/all` (admin)
- `PUT /api/expenses/:id/approve` (admin)
- `PUT /api/expenses/:id/reject` (admin)
- `PUT /api/expenses/:id/complete` (admin or prepaid owner student)

### Analytics
- `GET /api/analytics/event/:id`

## Features Implemented

- JWT auth with bcrypt password hashing
- RBAC with `admin` and `student`
- Event management with student membership
- Postpaid flow: submit bill -> pending -> approved/rejected -> completed
- Prepaid flow: request -> approved/rejected -> completed with final bill
- Cloudinary bill uploads via multer storage adapter
- Admin expense filters by event, status, type, search
- Student expense history + status tracking
- Recharts analytics:
  - total spent and pending
  - status breakdown
  - monthly trend
- Modern responsive dashboard UI
- Dark mode toggle
- Toast notifications

## Notes

- Budget is intentionally flexible (no strict blocking).
- No partial reimbursement logic is implemented.
