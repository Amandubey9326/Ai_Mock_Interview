# Requirements Document

## Introduction

HireMind AI is a full-stack SaaS platform that enables users to practice mock interviews powered by AI. The platform generates role-specific interview questions, evaluates user answers in real-time, tracks performance over time, and provides actionable feedback to improve interview skills. An optional resume analysis feature provides AI-driven feedback on uploaded resumes. The system uses a React/TypeScript frontend, Node.js/Express backend with MVC architecture, PostgreSQL database with Prisma ORM, and OpenAI API for AI capabilities.

## Glossary

- **Platform**: The HireMind AI web application comprising the Frontend and Backend systems
- **Frontend**: The React/TypeScript client application served to the user's browser
- **Backend**: The Node.js/Express server application handling API requests and business logic
- **Auth_Service**: The authentication subsystem responsible for user signup, login, and JWT token management
- **Interview_Service**: The subsystem responsible for creating and managing interview sessions, questions, and answers
- **AI_Service**: The subsystem responsible for communicating with the OpenAI API for question generation and answer evaluation
- **Resume_Analyzer**: The subsystem responsible for parsing uploaded PDF resumes and generating AI-driven feedback
- **Dashboard_Service**: The subsystem responsible for aggregating and serving user performance metrics
- **User**: A registered individual who interacts with the Platform
- **Interview_Session**: A single mock interview instance associated with a User, a role, and a difficulty level
- **Interview_Question**: A single question within an Interview_Session, including the AI-generated question, user answer, AI feedback, and score
- **Role**: The interview category selected by the User; one of Frontend, Backend, DSA, HR, DevOps, System Design, or Data Science
- **Difficulty**: The difficulty level selected by the User; one of Easy, Medium, or Hard
- **JWT**: JSON Web Token used for stateless authentication
- **Score**: A numerical rating from 1 to 10 assigned by the AI_Service to a user's answer

## Requirements

### Requirement 1: User Registration

**User Story:** As a new user, I want to create an account with my name, email, and password, so that I can access the Platform.

#### Acceptance Criteria

1. WHEN a user submits a valid name, email, and password, THE Auth_Service SHALL create a new User record with a UUID identifier, hashed password (bcrypt), and a createdAt timestamp
2. WHEN a user submits an email that already exists in the database, THE Auth_Service SHALL return a 409 Conflict error with a descriptive message
3. WHEN a user submits a registration request with missing or invalid fields, THE Auth_Service SHALL return a 400 Bad Request error specifying which fields are invalid
4. THE Auth_Service SHALL hash passwords using bcrypt before storing them in the database
5. WHEN registration succeeds, THE Auth_Service SHALL return a JWT token and the User profile (excluding the password)

### Requirement 2: User Login

**User Story:** As a registered user, I want to log in with my email and password, so that I can access my account and interview data.

#### Acceptance Criteria

1. WHEN a user submits a valid email and correct password, THE Auth_Service SHALL return a JWT token and the User profile (excluding the password)
2. WHEN a user submits an email that does not exist, THE Auth_Service SHALL return a 401 Unauthorized error with a generic "Invalid credentials" message
3. WHEN a user submits an incorrect password, THE Auth_Service SHALL return a 401 Unauthorized error with a generic "Invalid credentials" message
4. THE Auth_Service SHALL generate JWT tokens with a configurable expiration time stored in environment variables

### Requirement 3: Authentication Middleware and Protected Routes

**User Story:** As a platform operator, I want all sensitive API endpoints protected by authentication, so that only logged-in users can access their data.

#### Acceptance Criteria

1. WHEN a request to a protected endpoint includes a valid JWT token in the Authorization header, THE Backend SHALL allow the request to proceed and attach the authenticated User identity to the request context
2. WHEN a request to a protected endpoint includes an expired or invalid JWT token, THE Backend SHALL return a 401 Unauthorized error
3. WHEN a request to a protected endpoint does not include a JWT token, THE Backend SHALL return a 401 Unauthorized error
4. THE Backend SHALL protect all interview, dashboard, history, and resume analysis endpoints with the authentication middleware

### Requirement 4: Frontend Authentication Flow

**User Story:** As a user, I want a seamless login and signup experience in the browser, so that I can quickly start using the Platform.

#### Acceptance Criteria

1. THE Frontend SHALL provide a Login page with email and password fields and a submit button
2. THE Frontend SHALL provide a Signup page with name, email, and password fields and a submit button
3. WHEN a user successfully logs in or signs up, THE Frontend SHALL store the JWT token and redirect the user to the Dashboard page
4. WHEN a user attempts to access a protected page without a valid token, THE Frontend SHALL redirect the user to the Login page
5. THE Frontend SHALL provide an Auth context that manages token storage, user state, and logout functionality
6. WHEN a user clicks the logout action, THE Frontend SHALL clear the stored token and redirect to the Login page

### Requirement 5: Create Interview Session

**User Story:** As a user, I want to start a new mock interview by selecting a role and difficulty, so that I can practice for specific interview types.

#### Acceptance Criteria

1. THE Frontend SHALL provide a Start Interview page with selectable Role options (Frontend, Backend, DSA, HR, DevOps, System Design, Data Science) and Difficulty options (Easy, Medium, Hard)
2. WHEN a user selects a Role and Difficulty and submits, THE Interview_Service SHALL create a new Interview_Session record with a UUID, the authenticated User's ID, the selected Role, the selected Difficulty, and a createdAt timestamp
3. WHEN the Interview_Session is created successfully, THE Backend SHALL return the Interview_Session ID to the Frontend
4. WHEN a user submits a create interview request with an invalid Role or Difficulty value, THE Interview_Service SHALL return a 400 Bad Request error

### Requirement 6: AI Question Generation

**User Story:** As a user, I want to receive AI-generated interview questions relevant to my selected role and difficulty, so that I can practice realistic interview scenarios.

#### Acceptance Criteria

1. WHEN an Interview_Session is active and a new question is requested, THE AI_Service SHALL send a prompt to the OpenAI API requesting a question for the specified Role and Difficulty
2. THE AI_Service SHALL use the prompt format: "Generate a {difficulty} level {role} interview question."
3. WHEN the OpenAI API returns a response, THE AI_Service SHALL parse the response and return a structured JSON object containing the question text
4. WHEN the OpenAI API returns an error or is unreachable, THE AI_Service SHALL return a 503 Service Unavailable error with a descriptive message
5. WHEN a question is generated, THE Interview_Service SHALL create an Interview_Question record linked to the Interview_Session with the generated question text

### Requirement 7: AI Answer Evaluation

**User Story:** As a user, I want AI-powered feedback on my interview answers, so that I can understand my strengths and areas for improvement.

#### Acceptance Criteria

1. WHEN a user submits an answer to an Interview_Question, THE AI_Service SHALL send the question text and user answer to the OpenAI API for evaluation
2. WHEN the OpenAI API returns an evaluation, THE AI_Service SHALL parse the response into a structured JSON object with fields: score (integer 1-10), strengths (array of strings), weaknesses (array of strings), and improvements (array of strings)
3. WHEN the evaluation is received, THE Interview_Service SHALL update the Interview_Question record with the userAnswer, aiFeedback, and score
4. WHEN the OpenAI API returns an error during evaluation, THE AI_Service SHALL return a 503 Service Unavailable error with a descriptive message
5. IF the AI_Service returns a score outside the range 1-10, THEN THE Interview_Service SHALL reject the evaluation and return a 500 Internal Server Error

### Requirement 8: Interview Session Flow UI

**User Story:** As a user, I want a guided interview experience that presents questions one at a time and shows feedback after each answer, so that the experience feels like a real interview.

#### Acceptance Criteria

1. WHEN an Interview_Session starts, THE Frontend SHALL display the first AI-generated question to the user
2. THE Frontend SHALL provide a text input area for the user to type an answer and a submit button
3. WHEN the user submits an answer, THE Frontend SHALL display a loading state while the AI evaluation is in progress
4. WHEN the AI evaluation is returned, THE Frontend SHALL display the score, strengths, weaknesses, and improvements in clearly separated UI card sections
5. WHEN feedback is displayed, THE Frontend SHALL provide a "Next Question" action to request the next AI-generated question
6. THE Frontend SHALL display score values using a visual indicator (color-coded or progress-based)

### Requirement 9: Dashboard

**User Story:** As a user, I want to see a summary of my interview performance on a dashboard, so that I can track my progress over time.

#### Acceptance Criteria

1. WHEN a user navigates to the Dashboard page, THE Dashboard_Service SHALL return the total number of Interview_Sessions completed by the user
2. WHEN a user navigates to the Dashboard page, THE Dashboard_Service SHALL return the average score across all Interview_Questions answered by the user
3. WHEN a user navigates to the Dashboard page, THE Dashboard_Service SHALL return a list of the most recent Interview_Sessions (up to 5) with their Role, Difficulty, and creation date
4. WHEN a user navigates to the Dashboard page, THE Dashboard_Service SHALL return score data grouped over time for chart rendering
5. THE Frontend SHALL display the dashboard metrics using clean UI cards and at least one chart for progress over time
6. WHILE the dashboard data is loading, THE Frontend SHALL display a loading skeleton or spinner

### Requirement 10: Interview History

**User Story:** As a user, I want to review my past interviews including questions, answers, and AI feedback, so that I can revisit areas where I need improvement.

#### Acceptance Criteria

1. WHEN a user navigates to the History page, THE Interview_Service SHALL return a paginated list of the user's past Interview_Sessions ordered by creation date descending
2. WHEN a user selects an Interview_Session from the history list, THE Interview_Service SHALL return all Interview_Questions for that session including question text, userAnswer, aiFeedback, and score
3. THE Frontend SHALL display past Interview_Sessions in a list with Role, Difficulty, date, and average score
4. THE Frontend SHALL provide an expandable view for each Interview_Session to show individual Interview_Questions and their feedback
5. WHILE history data is loading, THE Frontend SHALL display a loading state

### Requirement 11: Resume Analyzer

**User Story:** As a user, I want to upload my resume and receive AI-driven feedback, so that I can improve my resume before applying to jobs.

#### Acceptance Criteria

1. THE Frontend SHALL provide a Resume Analyzer page with a file upload input that accepts PDF files only
2. WHEN a user uploads a PDF file, THE Resume_Analyzer SHALL extract the text content from the PDF
3. WHEN text extraction succeeds, THE Resume_Analyzer SHALL send the extracted text to the OpenAI API with a prompt requesting structured feedback
4. WHEN the OpenAI API returns feedback, THE Resume_Analyzer SHALL parse the response into a structured JSON object with fields: strengths (array of strings), weaknesses (array of strings), missing_skills (array of strings), and suggestions (array of strings)
5. THE Frontend SHALL display the resume feedback in clearly separated UI sections for strengths, weaknesses, missing skills, and suggestions
6. IF the uploaded file is not a valid PDF, THEN THE Resume_Analyzer SHALL return a 400 Bad Request error with a descriptive message
7. WHEN the OpenAI API returns an error during resume analysis, THE Resume_Analyzer SHALL return a 503 Service Unavailable error with a descriptive message
8. WHILE the resume analysis is in progress, THE Frontend SHALL display a loading state

### Requirement 12: Backend MVC Architecture and Error Handling

**User Story:** As a developer, I want a clean MVC architecture with proper error handling and input validation, so that the codebase is maintainable and robust.

#### Acceptance Criteria

1. THE Backend SHALL organize code into separate layers: Controllers (request handling), Services (business logic), and Routes (endpoint definitions)
2. THE Backend SHALL provide a global error handling middleware that catches unhandled errors and returns a consistent JSON error response with a status code and message
3. THE Backend SHALL validate all incoming request bodies using input validation before processing
4. THE Backend SHALL load all sensitive configuration values (database URL, JWT secret, OpenAI API key) from environment variables
5. IF a required environment variable is missing at startup, THEN THE Backend SHALL log an error and terminate the process

### Requirement 13: Database Schema and Relations

**User Story:** As a developer, I want a well-defined database schema with proper relations, so that data integrity is maintained across the system.

#### Acceptance Criteria

1. THE Backend SHALL define a User table with columns: id (UUID, primary key), name (string), email (string, unique), password (string), createdAt (timestamp)
2. THE Backend SHALL define an Interview table with columns: id (UUID, primary key), userId (UUID, foreign key to User), role (enum: Frontend, Backend, DSA, HR, DevOps, SystemDesign, DataScience), difficulty (enum: Easy, Medium, Hard), createdAt (timestamp)
3. THE Backend SHALL define an InterviewQuestion table with columns: id (UUID, primary key), interviewId (UUID, foreign key to Interview), question (text), userAnswer (text, nullable), aiFeedback (JSON, nullable), score (integer, nullable)
4. THE Backend SHALL enforce a one-to-many relationship from User to Interview (a User has many Interviews)
5. THE Backend SHALL enforce a one-to-many relationship from Interview to InterviewQuestion (an Interview has many InterviewQuestions)
6. THE Backend SHALL use Prisma ORM for all database interactions and schema migrations

### Requirement 14: Frontend UX and Responsiveness

**User Story:** As a user, I want a clean, responsive, and polished UI with proper feedback states, so that the Platform feels like a professional SaaS product.

#### Acceptance Criteria

1. THE Frontend SHALL use Tailwind CSS for all styling and layout
2. THE Frontend SHALL be responsive and render correctly on screen widths from 320px to 1920px
3. THE Frontend SHALL display toast notifications for success and error events (login success, submission errors, API failures)
4. THE Frontend SHALL display appropriate loading states (spinners or skeletons) for all asynchronous operations
5. THE Frontend SHALL display user-friendly error messages when API requests fail
6. THE Frontend SHALL use React Router for client-side navigation between pages: Login, Signup, Dashboard, Start Interview, Interview Session, History, and Resume Analyzer

### Requirement 15: Deployment Readiness

**User Story:** As a developer, I want the project to be production-ready with proper documentation and configuration, so that it can be deployed and onboarded easily.

#### Acceptance Criteria

1. THE Platform SHALL include a README file with project overview, tech stack description, environment setup instructions, and commands to run the application
2. THE Platform SHALL include example environment variable files (.env.example) for both Frontend and Backend
3. THE Backend SHALL include a Prisma migration setup that can initialize the database schema from scratch
4. THE Frontend SHALL produce an optimized production build using the standard React build toolchain