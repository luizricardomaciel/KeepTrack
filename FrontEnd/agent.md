# KeepTrack Frontend - Agent Guidance Document

This document provides a comprehensive overview of the KeepTrack frontend architecture, technologies, patterns, and guidelines for future development. It is intended to give AI assistants the necessary context to generate new components, pages, and functionalities consistent with the existing project structure.

## 1. Overview

The KeepTrack frontend is a single-page application (SPA) built with React, TypeScript, and Vite. It provides the user interface for interacting with the KeepTrack backend API.

**Key Technologies:**

* **Framework/Library:** React 19
* **Language:** TypeScript
* **Build Tool/Dev Server:** Vite
* **Package Manager:** npm
* **Styling:** Global CSS (`index.css`, `App.css`). (Consider CSS Modules or a CSS-in-JS solution for component-level styling as the project grows).
* **Linting:** ESLint with plugins for React Hooks, React Refresh, and TypeScript.
* **Type Checking:** TypeScript.

## 2. Project Structure

The current frontend structure is minimal, typical of a new Vite + React + TS project:

FrontEnd/
├── public/                 # Static assets directly served
│   └── vite.svg
├── src/
│   ├── assets/             # Static assets processed by Vite (e.g., images)
│   │   └── react.svg
│   ├── App.css             # Styles for the App component
│   ├── App.tsx             # Main application component
│   ├── index.css           # Global styles and resets
│   ├── main.tsx            # Entry point, renders the App component
│   └── vite-env.d.ts       # TypeScript definitions for Vite environment variables
│
├── .eslint.config.js     # ESLint configuration
├── .gitignore              # Specifies intentionally untracked files by Git
├── index.html              # Main HTML page, entry point for the SPA
├── package.json            # Project metadata, dependencies, and scripts
├── README.md               # Project README (currently Vite template)
├── tsconfig.json           # Main TypeScript configuration (references app and node configs)
├── tsconfig.node.json      # TypeScript configuration for Node.js environment (e.g., Vite config)
└── vite.config.ts          # Vite configuration file
```

**Recommended Scalable Structure (for future development):**

As the application grows, consider adopting a more feature-rich structure:

```
src/
├── api/                    # API service functions (e.g., authApi.ts, taskApi.ts)
├── assets/                 # Static assets (fonts, images)
├── components/             # Reusable UI components
│   ├── common/             # Generic components (Button, Input, Modal)
│   └── layout/             # Layout components (Navbar, Sidebar, Footer)
├── config/                 # Application-wide configuration (e.g., API base URL)
├── contexts/               # React Context API for global state (if used)
├── features/               # Feature-specific modules (components, hooks, services)
│   ├── auth/
│   │   ├── components/     # LoginFormComponent, RegisterFormComponent
│   │   ├── hooks/          # useAuth.ts
│   │   └── LoginPage.tsx
│   └── tasks/
│       ├── components/     # TaskItem.tsx, TaskList.tsx, CreateTaskModal.tsx
│       ├── hooks/          # useTasks.ts
│       └── TasksPage.tsx
├── hooks/                  # Custom React Hooks (generic)
├── pages/                  # Top-level page components (routed components)
├── App.tsx                 # Main application component (routing setup)
├── main.tsx                # Application entry point
├── index.css               # Global styles
├── router/                 # React Router configuration (if used)
├── services/               # (Alternative to api/ or for more complex non-API services)
├── store/                  # Global state management (e.g., Redux, Zustand - if used)
├── styles/                 # Global styles, themes, variables (if not in index.css)
├── types/                  # Global TypeScript type definitions/interfaces
└── utils/                  # Utility functions
```

## 3. State Management

* **Current:** Local component state using `useState` (as seen in `App.tsx`).
* **Future Considerations:** For managing global state (e.g., user authentication status, shared data across components), consider:
    * **React Context API:** Suitable for simpler global state needs.
    * **Zustand or Redux Toolkit:** For more complex state management scenarios.
* **Guidance:** When adding features that require shared state, evaluate the complexity.
    * For user authentication, a `AuthContext` is a common and good starting point.
    * For complex data fetching and caching, libraries like React Query (TanStack Query) or SWR are highly recommended in conjunction with any global state solution.

## 4. Routing

* **Current:** No client-side routing is implemented. The application is a single view.
* **Recommendation:** Implement client-side routing using a library like **React Router (`react-router-dom`)** to enable navigation between different pages/views within the SPA.
* **Setup (React Router Example):**
    1.  Install: `npm install react-router-dom`
    2.  Create a `router/index.tsx` or configure routes in `App.tsx`.
    3.  Wrap the application with `<BrowserRouter>` in `main.tsx`.
    4.  Define `<Routes>` and `<Route>` components to map paths to page components.
    5.  Use `<Link>` or `useNavigate` for navigation.
    6.  Implement protected routes for authenticated users.

## 5. Styling

* **Current:**
    * Global styles in `src/index.css` (CSS variables for theming, resets).
    * Component-specific styles directly imported (e.g., `import './App.css'` in `App.tsx`).
* **Recommendations for Scalability:**
    * **CSS Modules:** For locally scoped CSS to avoid naming conflicts (e.g., `MyComponent.module.css`). Vite has built-in support.
    * **Styled-components or Emotion (CSS-in-JS):** For dynamic, component-based styling with JavaScript.
    * **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
* **Guidance:** For new components, prefer a scoped styling solution (like CSS Modules) to maintain encapsulation. Continue using `src/index.css` for truly global styles and CSS variables.

## 6. API Interaction

* **No Current Implementation:** The provided code does not show any API calls.
* **Recommendations:**
    1.  **Create an API service layer:**
        * Create files like `src/api/authService.ts`, `src/api/taskService.ts`, etc.
        * Use the `Workspace` API or a library like `axios`. `axios` is often preferred for features like request/response interceptors, easier error handling, and request cancellation.
        * Define functions for each API endpoint (e.g., `login(credentials)`, `register(userData)`).
    2.  **Base URL Configuration:** Store the backend API base URL in an environment variable (e.g., `VITE_API_URL` in a `.env` file at the frontend root). Access it with `import.meta.env.VITE_API_URL`.
    3.  **Token Management:**
        * Store JWT tokens received from the backend (e.g., login/register) in `localStorage` or `sessionStorage`.
        * Include the token in the `Authorization` header for authenticated requests: `Authorization: Bearer <token>`.
        * An `axios` interceptor can automatically add the token to requests.
    4.  **Error Handling:** Implement robust error handling for API calls. Display user-friendly messages.
    5.  **Data Fetching Libraries:** For managing server state (fetching, caching, synchronization), consider **React Query (TanStack Query)** or **SWR**. These libraries simplify data fetching, reduce boilerplate, and handle caching, optimistic updates, etc.

**Example API Service Function (using fetch):**

```typescript
// src/api/authService.ts
import { LoginRequest, UserResponse } from '../types/auth'; // Assuming type definitions

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function login(credentials: LoginRequest): Promise<{ user: UserResponse; token: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Login failed');
  }
  return response.json();
}
```

## 7. TypeScript

* **Strict Mode:** Leverage TypeScript's strong typing. `tsconfig.app.json` (referenced by `tsconfig.json`) will contain the strictness settings for the application code.
* **Interfaces/Types:** Define clear TypeScript interfaces or types for props, state, API responses, and other data structures. Store shared types in a `src/types/` directory or colocated with features.
* **Path Aliases:** Vite supports path aliases via `vite.config.ts` and `tsconfig.json` if needed (e.g., `@/*` for `src/*`). Currently not configured but can be added.

## 8. Linting and Formatting

* **ESLint:** Configured in `eslint.config.js`. It uses recommended rules for JavaScript, TypeScript, React Hooks, and React Refresh.
* **README Guidance:** The `README.md` suggests expanding ESLint configuration for type-aware linting and more React-specific rules. This is highly recommended.
* **Formatting:** Consider adding Prettier for consistent code formatting and integrating it with ESLint (`eslint-plugin-prettier`, `eslint-config-prettier`).

## 9. Environment Variables

* Vite handles environment variables.
* Create a `.env` file in the `FrontEnd` root directory for environment-specific variables.
* Only variables prefixed with `VITE_` are exposed to the client-side code (e.g., `VITE_API_URL`).
* Access them using `import.meta.env.VITE_VARIABLE_NAME`.

## 10. Adding New Features (e.g., a "Tasks" Page)

1.  **Define Types (`src/types/` or feature-specific):**
    * Create interfaces for `Task`, `TaskCreationPayload`, etc.

2.  **API Service (`src/api/` or `src/features/tasks/api.ts`):**
    * Create functions to interact with the backend task endpoints (CRUD operations).
    * Handle request/response logic, including adding the auth token.

3.  **Global State (if needed, e.g., `src/contexts/TaskContext.tsx` or Zustand/Redux store):**
    * Set up state management for tasks if they need to be accessed or manipulated globally.
    * Alternatively, use React Query/SWR for server state management.

4.  **Components (`src/components/` or `src/features/tasks/components/`):**
    * `TaskList.tsx`: Displays a list of tasks.
    * `TaskItem.tsx`: Displays a single task item.
    * `CreateTaskForm.tsx` or `TaskModal.tsx`: For creating/editing tasks.

5.  **Page Component (`src/pages/` or `src/features/tasks/TasksPage.tsx`):**
    * The main component for the tasks feature.
    * Fetches tasks (using the API service and possibly React Query/SWR).
    * Manages task-related state (or uses global state).
    * Renders task components.

6.  **Routing (e.g., in `App.tsx` or `src/router/index.tsx`):**
    * Add a route for the tasks page (e.g., `/tasks`).
    * Ensure the route is protected if it requires authentication.

7.  **Styling:**
    * Apply styles using CSS Modules or your chosen styling approach.

8.  **Testing:**
    * Write unit tests for components and utility functions using a library like React Testing Library with Jest/Vitest.
    * Consider end-to-end tests for user flows.

## 11. Building for Production

* Run `npm run build`.
* This command will use `tsc -b` (as per `package.json`, which usually means build all referenced projects in `tsconfig.json`) and then `vite build`.
* The output will be in the `dist` folder, ready for deployment.

By adhering to these guidelines, the KeepTrack frontend can be developed in a structured, maintainable, and scalable way.