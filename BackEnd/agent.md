# KeepTrack Backend - Agent Guidance Document

This document provides a comprehensive overview of the KeepTrack backend architecture, technologies, patterns, and guidelines for future development. It is intended to give AI assistants the necessary context to generate new features, routes, and functionalities consistent with the existing project structure.

## 1. Overview

The KeepTrack backend is a Node.js application built with Express.js and TypeScript. It serves as a RESTful API for the KeepTrack application, handling user authentication, data persistence, and business logic.

**Key Technologies:**

* **Runtime/Framework:** Node.js, Express.js
* **Language:** TypeScript
* **Database:** PostgreSQL (interacted with via the `pg` library)
* **Authentication:** JSON Web Tokens (JWT)
* **Password Hashing:** `bcryptjs`
* **Validation:** `express-validator`
* **Environment Variables:** `dotenv`
* **HTTP Client (for testing):** `supertest`
* **Testing Framework:** `jest`
* **Security:** `helmet` for basic security headers, `cors` for cross-origin resource sharing.
* **Logging (HTTP requests):** `morgan` (though not explicitly shown in `app.ts` middleware setup, it's a dependency)

## 2. Project Structure

The backend follows a layered architecture, separating concerns into different modules:

```
src/
├── app.ts                # Express application setup (middleware, routes)
├── server.ts             # Server initialization, DB connection test, DB init
│
├── config/
│   ├── database.ts       # PostgreSQL connection pool configuration
│   └── jwt.ts            # JWT generation and verification utilities
│
├── controllers/
│   └── authController.ts # Handles HTTP requests/responses for authentication
│
├── database/
│   ├── init.ts           # Script to initialize database schema (e.g., create tables)
│   └── migrations/       # SQL migration files (e.g., 001_create_users_table.sql)
│
├── middleware/
│   ├── auth.ts           # JWT authentication middleware
│   └── validation.ts     # Handles errors from express-validator
│
├── models/
│   └── User.ts           # TypeScript interfaces for data models (User, requests, responses)
│
├── repositories/
│   └── userRepository.ts # Data Access Layer for User entity (SQL queries)
│
├── routes/
│   ├── auth.ts           # Defines authentication-related API routes
│   └── index.ts          # Main router, aggregates all feature routes
│
├── services/
│   └── authService.ts    # Business logic for authentication (registration, login)
│
└── utils/
    ├── passwordHash.ts   # Password hashing and comparison utilities
    └── validators.ts     # Validation rules using express-validator
```

**Core Principles:**

* **Separation of Concerns:** Each module has a distinct responsibility.
    * `routes`: Define API endpoints and link them to controllers and middleware.
    * `middleware`: Intercept and process requests before they reach controllers (e.g., authentication, validation error handling).
    * `controllers`: Parse HTTP requests, call services, and send HTTP responses. They do not contain business logic or database queries.
    * `services`: Encapsulate business logic. They orchestrate calls to repositories and other services.
    * `repositories`: Abstract database interactions. All SQL queries reside here.
    * `models`: Define data structures (TypeScript interfaces).
    * `utils`: Provide reusable helper functions/classes.
    * `config`: Manage application-level configurations.
* **Dependency Flow:** `routes` -> `middleware` -> `controllers` -> `services` -> `repositories` -> `database`.
* **Static Classes:** `AuthService`, `UserRepository`, `PasswordHash`, `JwtUtils`, and `AuthController` are implemented as classes with static methods. This pattern is used for utility and service-like modules.

## 3. Authentication and Authorization

* **Strategy:** JWT (JSON Web Tokens).
* **Registration (`AuthService.register`):**
    1.  Checks if the user already exists.
    2.  Hashes the password using `PasswordHash.hash` (`bcryptjs`).
    3.  Creates the user via `UserRepository.create`.
    4.  Generates a JWT using `JwtUtils.generateToken`.
    5.  Returns user data (without password hash) and the token.
* **Login (`AuthService.login`):**
    1.  Finds the user by email via `UserRepository.findByEmail`.
    2.  Verifies the password using `PasswordHash.compare`.
    3.  Generates a JWT.
    4.  Returns user data and the token.
* **Token Verification (`authenticateToken` middleware):**
    1.  Extracts the token from the `Authorization: Bearer <token>` header.
    2.  Verifies the token using `JwtUtils.verifyToken`.
    3.  If valid, attaches the decoded payload (`{ userId, email }`) to `req.user`.
    4.  If invalid or not present, returns a `401` or `403` error.
* **Protected Routes:** Routes requiring authentication should use the `authenticateToken` middleware.
* **Logout:** JWT logout is primarily client-side (deleting the token). The backend provides a `/logout` endpoint that confirms the action but doesn't perform server-side token invalidation (as JWTs are stateless by default). For stateful invalidation, a token blocklist mechanism would be needed.

## 4. Validation

* **Library:** `express-validator`.
* **Implementation:**
    * Validation rules are defined in `src/utils/validators.ts` (e.g., `userValidators.register`, `userValidators.login`).
    * Rules include checks for data types, length, format (email), and custom logic (password complexity).
    * Validators are applied as middleware in route definitions (e.g., `src/routes/auth.ts`).
    * The `handleValidationErrors` middleware (`src/middleware/validation.ts`) checks for validation errors collected by `express-validator`. If errors exist, it returns a `400` response with error details.

## 5. Database Interaction

* **Library:** `pg` (Node.js PostgreSQL client).
* **Connection:** A connection pool is configured in `src/config/database.ts` using environment variables.
* **Repositories (`src/repositories`):** All database queries are encapsulated within repository classes (e.g., `UserRepository`). Methods are `async` and return `Promise`s.
* **Schema Management:**
    * `src/database/init.ts` contains a function `initDatabase` that creates tables (`CREATE TABLE IF NOT EXISTS`) when the server starts.
    * `src/database/migrations/` contains SQL files for migrations (e.g., `001_create_users_table.sql`). The `package.json` includes a `"migrate": "ts-node scripts/migrate.ts"` script, suggesting a custom migration runner (not fully provided in the context but its presence is noted).

## 6. Error Handling

* **Validation Errors:** Handled by `handleValidationErrors` middleware, returning `400`.
* **Authentication Errors:** Handled in `authenticateToken` (returning `401`, `403`) and `AuthService` (throwing errors like 'Credenciais inválidas', caught by controllers).
* **Controller Error Handling:** Controllers use `try...catch` blocks.
    * On success, they send appropriate `2xx` status codes and JSON responses.
    * On error, they catch exceptions and send `4xx` or `5xx` status codes with a JSON error message. It's common to check `error instanceof Error` to send `error.message`.
* **Global Error Handler:** `app.ts` includes `app.use(handleValidationErrors)`. While this is placed last, it's specific to validation. A more generic, final error-handling middleware is a common pattern in Express to catch any unhandled errors, but is not explicitly detailed beyond this. Assume for now that controllers handle their specific errors.

## 7. Environment Variables

* Configuration is managed using environment variables loaded via `dotenv`.
* An example file `.env.example` lists the required variables:
    * `PORT`
    * `NODE_ENV`
    * `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
    * `JWT_SECRET`, `JWT_EXPIRES_IN`
    * `FRONTEND_URL` (for CORS)
* **Important:** `JWT_SECRET` must be strong and kept secret. `JWT_EXPIRES_IN` is set in `src/config/jwt.ts` and can be an integer (seconds) or a string like '7d'. The current code parses `JWT_EXPIRES_IN` as an integer, so ensure it's set accordingly in `.env`.

## 8. Coding Standards & Patterns

* **TypeScript:** Leverage TypeScript's static typing for all new code. Use interfaces for data structures.
* **Async/Await:** Use `async/await` for all asynchronous operations, especially database calls and service logic.
* **Modularity:** Keep files focused on a single responsibility.
* **Naming Conventions:**
    * `camelCase` for variables, functions, and class methods.
    * `PascalCase` for classes and interfaces.
    * Descriptive names for all identifiers.
* **Error Messages:** Provide clear and informative error messages, but avoid exposing sensitive internal details.
* **Comments:** Use JSDoc-style comments for public methods and complex logic, as seen in the existing codebase.

## 9. Adding New Features (e.g., a "Tasks" CRUD)

To add a new feature, follow these steps:

1.  **Model (`src/models/`):**
    * Define TypeScript interfaces for the new entity (e.g., `Task.ts` with `Task`, `CreateTaskRequest`, `UpdateTaskRequest`, `TaskResponse`).

2.  **Database Migration (`src/database/migrations/`):**
    * Create a new SQL migration file (e.g., `002_create_tasks_table.sql`) to define the table schema for "tasks".
    * Update `src/database/init.ts` or ensure your migration script handles the new table if `initDatabase` is just for initial setup. (Clarify if `initDatabase` is the primary schema manager or if migrations are separate). *Based on `server.ts`, `initDatabase` is run on startup, so it should include `CREATE TABLE IF NOT EXISTS` for new tables.*

3.  **Repository (`src/repositories/`):**
    * Create a new repository file (e.g., `taskRepository.ts`).
    * Implement static methods for CRUD operations (e.g., `TaskRepository.create`, `TaskRepository.findById`, `TaskRepository.findAllByUserId`, `TaskRepository.update`, `TaskRepository.delete`).
    * All SQL queries for the "tasks" entity go here.

4.  **Service (`src/services/`):**
    * Create a new service file (e.g., `taskService.ts`).
    * Implement static methods for the business logic related to tasks (e.g., `TaskService.createTask`, `TaskService.getTaskById`, `TaskService.getUserTasks`, `TaskService.updateTask`, `TaskService.deleteTask`).
    * These methods will call the corresponding `TaskRepository` methods.
    * Handle any business rules (e.g., checking if a user is authorized to access/modify a task).

5.  **Validators (`src/utils/validators.ts`):**
    * Add new validation chains for creating and updating tasks (e.g., `taskValidators.create`, `taskValidators.update`).
    * Define rules for fields like `title`, `description`, `dueDate`, etc.

6.  **Controller (`src/controllers/`):**
    * Create a new controller file (e.g., `taskController.ts`).
    * Implement static methods to handle HTTP requests (e.g., `TaskController.create`, `TaskController.getOne`, `TaskController.getAll`, `TaskController.update`, `TaskController.remove`).
    * These methods will:
        * Extract data from `req.params`, `req.body`, `req.query`, and `req.user` (for authenticated user ID).
        * Call the appropriate `TaskService` methods.
        * Send JSON responses with correct status codes.
        * Include `try...catch` blocks for error handling.

7.  **Routes (`src/routes/`):**
    * Create a new route file (e.g., `tasks.ts`).
    * Define routes for the "tasks" resource (e.g., `POST /tasks`, `GET /tasks`, `GET /tasks/:id`, `PUT /tasks/:id`, `DELETE /tasks/:id`).
    * Apply `authenticateToken` middleware to protect task routes.
    * Apply validation middleware (`taskValidators...`, `handleValidationErrors`).
    * Map routes to `TaskController` methods.
    * Import and use these new task routes in `src/routes/index.ts` (e.g., `router.use('/tasks', taskRoutes);`).

8.  **Testing:**
    * Write integration tests for the new API endpoints using Jest and Supertest.
    * Write unit tests for service and repository methods where appropriate.

## 10. Security Considerations

* **Input Validation:** Always validate and sanitize all user inputs (covered by `express-validator`).
* **Parameterized Queries:** Use parameterized queries (as done with `pg`'s `$1, $2` syntax) to prevent SQL injection. `UserRepository` already follows this.
* **Output Encoding:** Ensure data sent to the client is properly encoded if it includes user-generated content (Express does this by default for JSON).
* **Rate Limiting:** The project depends on `express-rate-limit`. Ensure it's configured appropriately in `app.ts` if not already, to prevent abuse. (Currently not shown in `app.ts` middleware).
* **Dependencies:** Keep dependencies up-to-date to patch known vulnerabilities.
* **Sensitive Data:** Avoid logging sensitive data like passwords or tokens. Ensure user responses (`UserResponse`) do not include `password_hash`.

By following these guidelines, new features can be added to the KeepTrack backend in a consistent, maintainable, and secure manner.