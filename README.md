# HireMind AI

AI-powered mock interview platform. Practice interviews with AI-generated questions, get real-time feedback, analyze your resume, track progress, and chat with an AI assistant — all in one place.

## Features

- 9 interview roles: Frontend, Backend, DSA, HR, DevOps, System Design, Data Science, QA Manual, QA Automation
- 3 difficulty levels: Easy, Medium, Hard
- MCQ + descriptive question formats (radio buttons for objective, textarea for descriptive)
- AI answer evaluation with score (1-10), strengths, weaknesses, improvements
- 5-minute question timer with auto-submit and color-coded countdown
- No repeat questions within a session
- End-of-session summary with stats
- Confetti animation on high scores
- Keyboard shortcuts (Cmd+Enter to submit, N for next question)
- Resume analyzer with overall score ring, ATS tips, recommended roles, strengths/weaknesses
- Drag & drop PDF upload
- Dashboard with metrics, score-over-time chart, achievement badges, daily motivational quotes
- Usage limits (50 interviews/day on free plan) with progress bar
- Leaderboard (top 20 users by average score)
- Profile page (edit name, change password, delete account)
- Forgot password / reset password flow
- AI chatbot assistant with conversation memory, chat history, quick questions, copy button, timestamps
- Dark mode toggle
- Landing page with animations, stats counters, testimonials
- Onboarding welcome modal for new users
- Export interview results as PDF
- 404 page
- Responsive design (320px to 1920px)
- Toast notifications

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Vite, React Router, Recharts, Framer Motion, Axios |
| Backend | Node.js, Express 5, TypeScript, Prisma ORM v6, Zod |
| Database | MongoDB (replica set) |
| AI | Google Gemini API (gemma-3n-e4b-it model) |
| Testing | Vitest, fast-check, Testing Library, Supertest, MSW |

## Prerequisites

- Node.js 20+
- MongoDB 6+ (local or MongoDB Atlas)
- Google Gemini API key (free at https://aistudio.google.com/apikey)

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB 6+ with replica set

### 2 Commands to Run

```bash
npm install
npm run dev
```

That's it. The setup script automatically:
- Installs server + client dependencies
- Creates `.env` files from examples
- Starts MongoDB (if installed via Homebrew)
- Generates Prisma client & pushes schema
- Starts both server (port 5001) and client (port 3000)

Open http://localhost:3000 in your browser.

### Optional: Add API Keys

For AI features, get a free Gemini key at https://aistudio.google.com/apikey and add to `server/.env`:
```env
GEMINI_API_KEY=your-key-here
```

### MongoDB Setup (one-time)

```bash
brew install mongodb-community
brew services start mongodb-community
mongosh --eval "rs.initiate()"
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/forgot-password` | No | Get reset token |
| POST | `/api/auth/reset-password` | No | Reset password |
| PATCH | `/api/auth/profile` | Yes | Update name |
| PATCH | `/api/auth/password` | Yes | Change password |
| DELETE | `/api/auth/account` | Yes | Delete account |
| POST | `/api/interviews` | Yes | Create interview |
| GET | `/api/interviews` | Yes | List interviews (paginated) |
| GET | `/api/interviews/:id` | Yes | Get interview with questions |
| POST | `/api/interviews/:id/questions` | Yes | Generate next question |
| POST | `/api/interviews/:id/questions/:qid/answer` | Yes | Submit answer |
| GET | `/api/dashboard` | Yes | Dashboard metrics |
| GET | `/api/dashboard/usage` | Yes | Usage limits |
| GET | `/api/leaderboard` | Yes | Top 20 users |
| POST | `/api/resume/analyze` | Yes | Analyze resume (PDF upload) |
| POST | `/api/chat` | Yes | AI chatbot |

## Project Structure

```
├── client/                     # React frontend
│   ├── src/
│   │   ├── api/                # Axios client + API functions
│   │   ├── components/         # Reusable UI (Navbar, Toast, AIChatbot, etc.)
│   │   ├── context/            # Auth + Theme contexts
│   │   ├── pages/              # Route pages (14 pages)
│   │   └── types/              # TypeScript interfaces
│   └── package.json
├── server/                     # Express backend
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic + AI
│   │   ├── routes/             # Route definitions
│   │   ├── middleware/         # Auth, error, upload, usage limits
│   │   ├── validators/         # Zod schemas
│   │   ├── config/             # Environment config
│   │   └── lib/                # Prisma client
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── package.json
└── README.md
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Public landing page with animations |
| Login | `/login` | Email/password login |
| Signup | `/signup` | Registration with welcome modal |
| Forgot Password | `/forgot-password` | Request reset token |
| Reset Password | `/reset-password` | Reset with token |
| Dashboard | `/dashboard` | Metrics, charts, badges, usage |
| Start Interview | `/interview/start` | Role + difficulty selection |
| Interview Session | `/interview/:id` | Q&A with timer + feedback |
| History | `/history` | Past sessions with PDF export |
| Resume Analyzer | `/resume` | PDF upload + AI analysis |
| Profile | `/profile` | Edit name, password, delete account |
| Leaderboard | `/leaderboard` | Top 20 users |
| 404 | `*` | Not found page |
