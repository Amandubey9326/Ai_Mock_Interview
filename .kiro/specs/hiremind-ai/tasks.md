# Implementation Plan: HireMind AI

## Overview

Build the HireMind AI platform incrementally: project scaffolding and database schema first, then backend services (auth → interviews → AI → dashboard → resume), then frontend (auth flow → interview flow → dashboard → history → resume), and finally integration wiring and deployment readiness. Each task builds on the previous, ensuring no orphaned code.

## Tasks

- [x] 1. Project scaffolding, configuration, and database schema
  - [x] 1.1 Initialize project structure with client (Vite + React + TypeScript) and server (Node.js + Express + TypeScript) directories, install all dependencies (Tailwind CSS, React Router, Axios, Prisma, bcrypt, jsonwebtoken, openai, multer, pdf-parse, zod, vitest, fast-check, @testing-library/react, supertest, msw), and configure TypeScript for both
    - Create `client/` and `server/` directories matching the design project structure
    - Configure `tsconfig.json` for both client and server
    - _Requirements: 12.1, 14.1_

  - [x] 1.2 Create environment config loader (`server/src/config/index.ts`) that reads and validates required environment variables (DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, OPENAI_API_KEY, PORT) and terminates the process if any are missing
    - Create `.env.example` files for both client and server
    - _Requirements: 12.4, 12.5, 15.2_

  - [x] 1.3 Define Prisma schema (`server/prisma/schema.prisma`) with User, Interview, and InterviewQuestion models, Role and Difficulty enums, UUID primary keys, relations, and indexes as specified in the design
    - Run `npx prisma generate` to generate the Prisma client
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]* 1.4 Write property test for relational integrity across entities
    - **Property 23: Relational integrity across entities** — For any User with multiple Interviews, and any Interview with multiple InterviewQuestions, querying the parent entity and including its children should return exactly the children that were created for that parent, with no cross-contamination between users or sessions.
    - **Validates: Requirements 13.4, 13.5**

- [x] 2. Backend auth module
  - [x] 2.1 Create input validators (`server/src/validators/auth.validator.ts`) using zod for RegisterInput (non-empty name, valid email, password ≥ 6 chars) and LoginInput (email, password)
    - _Requirements: 1.3, 12.3_

  - [x] 2.2 Implement auth service (`server/src/services/auth.service.ts`) with register (bcrypt hash, create user, generate JWT) and login (verify credentials, generate JWT) methods
    - Return AuthResponse with token and user object (excluding password)
    - _Requirements: 1.1, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4_

  - [x] 2.3 Implement auth controller (`server/src/controllers/auth.controller.ts`) and routes (`server/src/routes/auth.routes.ts`) for POST /api/auth/register and POST /api/auth/login
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

  - [x] 2.4 Implement auth middleware (`server/src/middleware/auth.middleware.ts`) that verifies JWT from Authorization header and attaches user identity to request context
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 2.5 Implement global error handling middleware (`server/src/middleware/error.middleware.ts`) returning consistent `{ status, message }` JSON responses
    - _Requirements: 12.2_

  - [x] 2.6 Create Express app setup (`server/src/app.ts`) wiring middleware, routes, and error handler
    - _Requirements: 12.1_

  - [ ]* 2.7 Write property tests for auth module
    - **Property 1: Registration creates a valid user with hashed password** — For any valid registration input, the stored password is a bcrypt hash not equal to plaintext, id is a valid UUID, and createdAt is a valid timestamp.
    - **Validates: Requirements 1.1, 1.4**
    - **Property 2: Duplicate email registration is rejected** — For any email already in the database, re-registering returns 409 and no new record is created.
    - **Validates: Requirements 1.2**
    - **Property 3: Invalid registration input is rejected** — For any input with empty name, invalid email, or short password, returns 400 and no record is created.
    - **Validates: Requirements 1.3**
    - **Property 4: Successful auth returns JWT and user without password** — For any successful register/login, response contains a non-empty JWT and user object without password field.
    - **Validates: Requirements 1.5, 2.1**
    - **Property 5: Invalid credentials return generic 401** — For any non-existent email or wrong password, returns 401 with "Invalid credentials" message.
    - **Validates: Requirements 2.2, 2.3**

  - [ ]* 2.8 Write property tests for auth middleware
    - **Property 7: Valid JWT grants access through middleware** — For any valid non-expired JWT, middleware allows request and attaches correct user identity.
    - **Validates: Requirements 3.1**
    - **Property 8: Invalid or missing JWT is rejected by middleware** — For any expired, malformed, or missing JWT, middleware returns 401.
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 2.9 Write property test for global error handler
    - **Property 22: Global error handler returns consistent JSON** — For any unhandled error, the middleware returns JSON with numeric status and string message, never exposing stack traces.
    - **Validates: Requirements 12.2**

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Backend interview and AI modules
  - [x] 4.1 Implement AI service (`server/src/services/ai.service.ts`) with methods for question generation, answer evaluation, and resume analysis, wrapping OpenAI API calls with error handling and response parsing
    - Use prompt format: "Generate a {difficulty} level {role} interview question."
    - Parse evaluation into { score, strengths, weaknesses, improvements }
    - Reject scores outside 1-10 range
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.4, 7.5_

  - [x] 4.2 Create interview validators (`server/src/validators/interview.validator.ts`) for CreateInterviewInput (valid Role, Difficulty) and SubmitAnswerInput (non-empty answer)
    - _Requirements: 5.4, 12.3_

  - [x] 4.3 Implement interview service (`server/src/services/interview.service.ts`) with methods: createSession, generateQuestion (calls AI service, persists InterviewQuestion), submitAnswer (calls AI evaluation, updates record), listUserInterviews (paginated), getInterviewDetail (with questions)
    - _Requirements: 5.2, 5.3, 6.5, 7.3, 10.1, 10.2_

  - [x] 4.4 Implement interview controller (`server/src/controllers/interview.controller.ts`) and routes (`server/src/routes/interview.routes.ts`) for all interview endpoints: POST /api/interviews, GET /api/interviews (paginated), GET /api/interviews/:id, POST /api/interviews/:id/questions, POST /api/interviews/:id/questions/:qid/answer
    - Apply auth middleware to all routes
    - _Requirements: 5.2, 5.3, 5.4, 10.1, 10.2, 3.4_

  - [ ]* 4.5 Write property tests for interview and AI modules
    - **Property 10: Interview session creation with valid input** — For any valid Role × Difficulty combination, creates an Interview record with valid UUID, correct userId, selected role/difficulty, and createdAt.
    - **Validates: Requirements 5.2, 5.3**
    - **Property 11: Invalid role or difficulty is rejected** — For any string not in the valid enums, returns 400 and no record is created.
    - **Validates: Requirements 5.4**
    - **Property 12: AI prompt format for question generation** — For any Role and Difficulty, the prompt matches "Generate a {difficulty} level {role} interview question."
    - **Validates: Requirements 6.2**
    - **Property 14: Generated question is persisted and linked** — For any generated question, an InterviewQuestion record is created linked to the correct session with userAnswer, aiFeedback, and score initially null.
    - **Validates: Requirements 6.5**
    - **Property 15: AI evaluation response parsing and validation** — For any valid evaluation response, parses into { score (1-10), strengths, weaknesses, improvements }. Rejects scores outside 1-10.
    - **Validates: Requirements 7.2, 7.5**
    - **Property 16: Answer submission updates question record** — For any submitted answer after successful evaluation, the InterviewQuestion record has non-null userAnswer, aiFeedback, and score.
    - **Validates: Requirements 7.3**

  - [ ]* 4.6 Write property tests for history pagination
    - **Property 18: Interview history pagination and ordering** — For any user and valid page/limit, returns at most `limit` sessions ordered by createdAt descending, all belonging to the authenticated user.
    - **Validates: Requirements 10.1**
    - **Property 19: Interview session detail includes all questions** — For any session, detail returns all associated InterviewQuestion records with all fields.
    - **Validates: Requirements 10.2**

- [x] 5. Backend dashboard and resume modules
  - [x] 5.1 Implement dashboard service (`server/src/services/dashboard.service.ts`) returning totalSessions, averageScore, recentSessions (up to 5), and scoreOverTime data for the authenticated user
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 5.2 Implement dashboard controller (`server/src/controllers/dashboard.controller.ts`) and routes (`server/src/routes/dashboard.routes.ts`) for GET /api/dashboard with auth middleware
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 3.4_

  - [x] 5.3 Implement resume upload middleware (`server/src/middleware/upload.middleware.ts`) using multer configured for PDF-only file uploads
    - _Requirements: 11.1, 11.6_

  - [x] 5.4 Implement resume service (`server/src/services/resume.service.ts`) that extracts text from uploaded PDF and calls AI service for structured feedback
    - _Requirements: 11.2, 11.3, 11.4, 11.7_

  - [x] 5.5 Implement resume controller (`server/src/controllers/resume.controller.ts`) and routes (`server/src/routes/resume.routes.ts`) for POST /api/resume/analyze with auth middleware
    - _Requirements: 11.1, 11.6, 11.7, 3.4_

  - [x] 5.6 Wire all route modules into the Express app
    - _Requirements: 12.1_

  - [ ]* 5.7 Write property tests for dashboard and resume modules
    - **Property 17: Dashboard metrics correctness** — For any user with interview data, totalSessions equals count of interviews, averageScore equals arithmetic mean of scored questions, recentSessions has at most 5 ordered by createdAt desc, scoreOverTime averages match actual scores per date.
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
    - **Property 20: Non-PDF file upload is rejected** — For any non-PDF file, returns 400 and no analysis is performed.
    - **Validates: Requirements 11.6**
    - **Property 21: Resume feedback response parsing** — For any valid OpenAI resume response, parses into { strengths, weaknesses, missing_skills, suggestions } arrays of strings.
    - **Validates: Requirements 11.4**

- [x] 6. Checkpoint — Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Frontend foundation and auth flow
  - [x] 7.1 Set up Tailwind CSS, React Router, Axios API client with base URL from env, request interceptor for JWT header injection, and response interceptor for 401 logout
    - Create `client/src/api/client.ts`
    - Create TypeScript interfaces in `client/src/types/`
    - _Requirements: 14.1, 14.6_

  - [x] 7.2 Implement Auth context (`client/src/context/AuthContext.tsx`) managing token in localStorage, user state, login/logout methods, and isAuthenticated flag
    - _Requirements: 4.5, 4.6_

  - [x] 7.3 Implement ProtectedRoute component that redirects to /login if no valid token
    - _Requirements: 4.4_

  - [x] 7.4 Implement shared UI components: Navbar (with links and logout), LoadingSpinner, Toast notification component, ScoreIndicator (color-coded: red < 4, yellow 4-7, green > 7), FeedbackCard
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [x] 7.5 Implement LoginPage (`/login`) with email/password form, validation, error display, and link to signup
    - _Requirements: 4.1, 4.3_

  - [x] 7.6 Implement SignupPage (`/signup`) with name/email/password form, validation, error display, and link to login
    - _Requirements: 4.2, 4.3_

  - [x] 7.7 Set up App.tsx with React Router wiring all routes, ProtectedRoute wrapping, and Auth context provider
    - _Requirements: 14.6_

  - [ ]* 7.8 Write property test for protected route redirect
    - **Property 9: Protected route redirect without token** — For any protected route path, accessing it without a valid token redirects to the Login page.
    - **Validates: Requirements 4.4**

  - [ ]* 7.9 Write unit tests for auth context and login/signup pages
    - Test login stores token, logout clears token, isAuthenticated reflects state
    - Test form rendering, submission, and error handling
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

- [x] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Frontend interview flow
  - [x] 9.1 Create API call functions for interview endpoints (create session, generate question, submit answer, list interviews, get interview detail)
    - _Requirements: 5.2, 6.1, 7.1, 10.1, 10.2_

  - [x] 9.2 Implement StartInterviewPage (`/interview/start`) with Role selection (Frontend, Backend, DSA, HR, DevOps, System Design, Data Science) and Difficulty selection (Easy, Medium, Hard) and submit button
    - _Requirements: 5.1_

  - [x] 9.3 Implement InterviewSessionPage (`/interview/:id`) with question display, answer text input, submit button, loading state during AI evaluation, feedback display (score via ScoreIndicator, strengths/weaknesses/improvements via FeedbackCard), and "Next Question" button
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 9.4 Write unit tests for interview flow components
    - Test question rendering, answer submission, feedback display, next question navigation
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 10. Frontend dashboard, history, and resume pages
  - [x] 10.1 Create API call functions for dashboard and resume endpoints
    - _Requirements: 9.1, 11.1_

  - [x] 10.2 Implement DashboardPage (`/dashboard`) with metrics cards (total sessions, average score), score-over-time chart, recent sessions list (up to 5), and loading skeleton
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 10.3 Implement HistoryPage (`/history`) with paginated list of past sessions (role, difficulty, date, average score), expandable detail view showing individual questions with feedback, and loading state
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 10.4 Implement ResumeAnalyzerPage (`/resume`) with PDF-only file upload input, loading state during analysis, and feedback display sections (strengths, weaknesses, missing skills, suggestions)
    - _Requirements: 11.1, 11.5, 11.8_

  - [ ]* 10.5 Write unit tests for dashboard, history, and resume pages
    - Test metrics rendering, chart rendering, loading states, session list, expandable details, file upload, feedback display
    - _Requirements: 9.5, 9.6, 10.3, 10.4, 10.5, 11.1, 11.5, 11.8_

- [x] 11. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Integration, responsiveness, and deployment readiness
  - [x] 12.1 Wire frontend to backend: verify all API calls work end-to-end, ensure toast notifications fire on success/error events, and confirm 401 interceptor triggers logout
    - _Requirements: 14.3, 14.5_

  - [x] 12.2 Ensure responsive layout across 320px to 1920px screen widths using Tailwind responsive utilities
    - _Requirements: 14.2_

  - [x] 12.3 Create Prisma migration setup (`npx prisma migrate dev`) and verify database schema initializes from scratch
    - _Requirements: 15.3_

  - [x] 12.4 Create README.md with project overview, tech stack, environment setup instructions, and commands to run the application
    - _Requirements: 15.1_

  - [x] 12.5 Verify frontend production build (`npm run build`) produces optimized output
    - _Requirements: 15.4_

- [x] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Backend is built first so frontend can integrate against real endpoints
