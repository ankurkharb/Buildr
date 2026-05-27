'p[
    [p
    p[]
    p[]
    'p['
    :p'[
        :[]
        'p/;/['p
        # Buildr Project Explanation

## Project Overview

Buildr is an AI-powered web application builder. The main idea of the project is simple: a user enters a natural language prompt such as "build a portfolio website" or "create a task management app", and Buildr generates a working Next.js website inside a live sandbox environment.

The project works like a chat-based coding platform. Users can create projects, send prompts, view generated websites in a live preview, and inspect the generated source code from the browser.

Buildr is not just a static prompt form. It has authentication, project management, usage limits, background AI execution, database persistence, live previews, and generated code browsing.

## Main Features

- User authentication and protected project routes
- Prompt-based website and app generation
- Project history for each logged-in user
- Chat-style message flow inside a project
- Background AI code generation using Inngest
- Isolated code execution using E2B sandboxes
- Live website preview through an iframe
- Generated file explorer with syntax-highlighted code view
- Usage tracking for free and pro users
- Responsive UI built with Tailwind CSS and Shadcn/UI

## High-Level Architecture

Buildr follows a modern full-stack architecture using Next.js as the main application framework.

```text
User Browser
    |
    | enters prompt / views project
    v
Next.js App Router UI
    |
    | calls type-safe API
    v
tRPC Routers
    |
    | validates auth, stores messages, sends event
    v
PostgreSQL Database + Prisma
    |
    | background event
    v
Inngest Function
    |
    | starts AI agent workflow
    v
Inngest Agent Kit + OpenAI
    |
    | writes and runs generated code
    v
E2B Sandbox
    |
    | returns sandbox URL and generated files
    v
Database Fragment
    |
    | UI renders preview and code
    v
Generated Website Preview
```

## Folder Structure

```text
src/app
```

Contains the Next.js App Router pages, layouts, and API routes. This includes the home page, project page, auth pages, tRPC API route, and Inngest API route.

```text
src/modules
```

Contains feature-based modules such as projects, messages, usage, and home UI. This keeps the code organized by business feature instead of placing everything in one large folder.

```text
src/trpc
```

Contains the tRPC setup, routers, server helpers, client provider, and React Query integration.

```text
src/inngest
```

Contains the background AI generation function. This is where the Buildr agent creates a sandbox, runs the coding agent, saves generated files, and creates the final response.

```text
src/components
```

Contains shared UI components such as Shadcn/UI components, hints, code viewer, tree view, and user controls.

```text
prisma
```

Contains the Prisma schema, migrations, and seed file. This defines database tables for projects, messages, generated fragments, and usage tracking.

```text
sandbox-templates
```

Contains the E2B sandbox template used for generated Next.js applications.

## Technologies Used and Why

## Next.js 15

I used Next.js because Buildr needs both frontend pages and backend API routes in the same project. Next.js App Router gives a clean file-based routing system, server-side rendering support, and API route support.

Why it fits this project:

- It supports full-stack development in one codebase.
- App Router makes routes like `/projects/[projectId]` easy to manage.
- API routes are useful for exposing tRPC and Inngest endpoints.
- It works naturally with React, TypeScript, Clerk, Prisma, and deployment platforms like Vercel.

## React 19

React is used to build the interactive UI. The project has many client-side interactions such as prompt forms, tabs, resizable panels, file selection, live iframe refresh, and copy buttons.

Why it fits this project:

- It is component-based and reusable.
- It works well with Next.js.
- Hooks like `useState`, `useMutation`, and `useQuery` make interactive flows easier.
- It is ideal for building a chat-style project interface.

## TypeScript

TypeScript is used for type safety across the project. Since Buildr has API calls, database models, generated fragments, and user input, strong typing helps reduce runtime mistakes.

Why it fits this project:

- It catches errors during development.
- It improves editor autocomplete and refactoring.
- It makes component props and API inputs safer.
- It works very well with Prisma and tRPC.

## Tailwind CSS

Tailwind CSS is used for styling. It allows the UI to be designed quickly using utility classes directly inside components.

Why it fits this project:

- It speeds up UI development.
- It keeps styling consistent.
- It supports responsive design through classes like `md:` and `sm:`.
- It avoids maintaining many separate CSS files.

## Shadcn/UI and Radix UI

Shadcn/UI is used for reusable interface components such as buttons, tabs, forms, dialogs, dropdowns, resizable panels, breadcrumbs, and other UI elements. Radix UI provides the accessible primitives behind many of these components.

Why it fits this project:

- It gives professional-looking components quickly.
- Components are customizable because they live inside the codebase.
- Radix UI improves accessibility and keyboard behavior.
- It helps keep the interface consistent across the app.

## tRPC

tRPC is used as the API layer between the frontend and backend. Instead of writing separate REST endpoints manually, the project defines routers and procedures that can be called type-safely from React components.

Important routers:

- `projectsRouter` handles creating and fetching projects.
- `messagesRouter` handles project messages and new prompt submissions.
- `usageRouter` handles usage/credit status.

Why it fits this project:

- It gives end-to-end type safety.
- Frontend calls match backend procedures directly.
- It reduces repeated API boilerplate.
- It works well with React Query for loading and caching data.

## TanStack React Query

React Query is used with tRPC to manage server state on the frontend.

Why it fits this project:

- It handles loading, caching, and refetching data.
- It makes mutations like project creation smoother.
- It allows invalidating project and usage queries after new prompts.
- It improves user experience by keeping UI data fresh.

## Prisma

Prisma is used as the ORM for database access. The schema defines the main data models: `Project`, `Message`, `Fragment`, and `Usage`.

Why it fits this project:

- It gives a type-safe database client.
- It makes database queries readable.
- It handles relationships between projects, messages, and fragments.
- It supports migrations for database changes.

## PostgreSQL

PostgreSQL is the database provider configured in Prisma.

Why it fits this project:

- It is reliable for production applications.
- It handles relational data well.
- Projects, messages, fragments, and users naturally fit a relational model.
- It works well with Prisma.

## Clerk

Clerk is used for authentication and user management.

Why it fits this project:

- It provides sign-in and sign-up flows quickly.
- It protects routes and API procedures.
- It gives access to the logged-in user's `userId`.
- It supports plan checks, which are used for pro access and usage limits.

## Inngest

Inngest is used to run the AI generation process in the background. Website generation can take time, so it should not block the main request-response cycle.

Why it fits this project:

- It runs long tasks reliably in the background.
- It supports event-driven workflows.
- It provides step-based execution, which is useful for sandbox creation, AI execution, and result saving.
- It separates user-facing API calls from heavy AI generation work.

## Inngest Agent Kit and OpenAI

The project uses Inngest Agent Kit to create AI agents. The main coding agent receives the user prompt and system instructions, then uses tools to read files, write files, and run terminal commands inside the sandbox.

The project also uses smaller agents for:

- Generating a short title for the generated fragment
- Generating a friendly response message for the user

Why it fits this project:

- Agent Kit makes tool-using AI workflows easier to build.
- The coding agent can modify real files instead of only returning text.
- Specialized agents keep responsibilities separate.
- OpenAI models are strong at code generation, summarization, and natural language responses.

## E2B Code Interpreter

E2B is used to create an isolated sandbox where the generated Next.js app can be written, installed, run, and previewed.

Why it fits this project:

- It keeps generated code isolated from the main Buildr app.
- It provides terminal and file-system access for the AI agent.
- It can expose a live URL for the generated website.
- It makes it possible to preview generated apps safely.

## Rate Limiter Flexible

The project uses `rate-limiter-flexible` with Prisma to track usage credits.

Why it fits this project:

- It prevents unlimited free generations.
- It supports different limits for free and pro users.
- It stores usage data in the database.
- It helps connect pricing plans to actual generation limits.

## Lucide React

Lucide React is used for icons across the interface, such as submit, refresh, external link, crown, copy, and loading icons.

Why it fits this project:

- It provides clean and consistent icons.
- It works well with React components.
- It keeps buttons and actions visually understandable.

## Data Model

## Project

A project belongs to a user and contains many messages.

Main fields:

- `id`
- `name`
- `userId`
- `createdAt`
- `updatedAt`

## Message

A message stores either a user prompt or an assistant response.

Main fields:

- `id`
- `content`
- `role`
- `type`
- `projectId`
- `createdAt`
- `updatedAt`

Roles:

- `USER`
- `ASSISTANT`

Types:

- `RESULT`
- `ERROR`

## Fragment

A fragment stores the generated website result linked to an assistant message.

Main fields:

- `id`
- `messageId`
- `sandboxUrl`
- `title`
- `files`
- `createdAt`
- `updatedAt`

The `files` field stores generated source files as JSON.

## Usage

The usage table stores credit/rate-limit information.

Main fields:

- `key`
- `points`
- `expire`

## Prompt to Website Flow

This is the complete flow from entering a prompt to getting a working website.

## 1. User Enters a Prompt

The user starts on the home page and enters a prompt in the project form.

Relevant file:

```text
src/modules/home/ui/project-form.tsx
```

The form validates that the prompt is not empty and does not exceed the maximum length.

## 2. Frontend Calls tRPC Mutation

When the user submits the form, the frontend calls:

```text
projects.create
```

This mutation is defined in:

```text
src/modules/projects/server/procedures.ts
```

The mutation checks authentication, consumes one usage credit, creates a new project, and stores the first user message.

## 3. Project is Created in the Database

Prisma creates a new `Project` row and a related `Message` row.

The project receives an auto-generated name using `random-word-slugs`.

After the project is created, the user is redirected to:

```text
/projects/[projectId]
```

## 4. Inngest Event is Sent

After saving the project and first message, the backend sends an Inngest event:

```text
BuildrAgent/run
```

This event contains:

- The user's prompt
- The project ID

This allows the website generation process to run in the background.

## 5. Project Page Opens

The project page loads the project UI.

Relevant file:

```text
src/modules/projects/ui/views/project-view.tsx
```

The screen is split into two main panels:

- Left panel: messages and chat history
- Right panel: live preview and generated code tabs

## 6. Inngest Starts the Buildr Agent

The background function is defined in:

```text
src/inngest/functions.ts
```

The function starts by creating an E2B sandbox using the configured sandbox template.

The sandbox is the environment where the generated Next.js app will be created and run.

## 7. Previous Messages Are Loaded

The function loads recent previous messages from the same project.

This gives the AI agent context, so follow-up prompts can build on earlier requests instead of starting from zero each time.

## 8. AI Coding Agent Runs

The main coding agent is created with a detailed system prompt from:

```text
src/prompt.ts
```

The prompt tells the agent how to build a proper Next.js app, how to update files, how to use Tailwind and Shadcn/UI, and how to finish with a task summary.

The agent has tools for:

- Running terminal commands
- Reading files from the sandbox
- Creating or updating files in the sandbox

## 9. Files Are Written in the Sandbox

The AI agent writes the generated website files into the E2B sandbox. The main required file is usually:

```text
app/page.tsx
```

The agent can also create additional components and utilities if needed.

Each file written by the agent is saved into the agent state so Buildr can later show the generated code in the UI.

## 10. Sandbox URL is Created

After generation, Buildr gets the public host for port `3000` from the sandbox.

That URL becomes the live preview URL for the generated website.

## 11. Title and Response Are Generated

Two smaller agents run after the coding agent:

- The fragment title agent creates a short title such as "Portfolio Site" or "Task Dashboard".
- The response agent creates a short friendly message explaining what was built.

This improves the final user experience because the user gets a clean response instead of raw technical output.

## 12. Result is Saved in the Database

Buildr saves an assistant message in the database.

If generation succeeds, it creates:

- An assistant `Message`
- A related `Fragment`
- The sandbox preview URL
- The generated files JSON
- The generated fragment title

If generation fails, it saves an error message instead.

## 13. UI Displays the Generated Website

The messages panel receives the assistant message and fragment. When the user selects the fragment, the right panel shows:

- `Demo` tab: live website preview using an iframe
- `Code` tab: generated files using the file explorer

Relevant files:

```text
src/modules/projects/ui/components/fragment-web.tsx
src/modules/projects/ui/components/file-explorer.tsx
```

## 14. User Can Continue Iterating

Inside a project, the user can submit another prompt through the message form.

That calls:

```text
messages.create
```

The new message is saved, another `BuildrAgent/run` event is sent, and the same AI generation flow repeats with recent project context.

## Authentication and Authorization Flow

Clerk handles authentication. The middleware protects private routes, while tRPC protected procedures check for a logged-in user before allowing project or message actions.

Important files:

```text
src/middleware.ts
src/trpc/init.ts
```

Each project is stored with a `userId`, and queries check that the requested project belongs to the current user. This prevents one user from accessing another user's projects.

## Usage and Credit Flow

Every generation consumes one credit.

The usage system uses:

```text
src/lib/usage.ts
```

Free users receive fewer points, while pro users receive more. If a user runs out of credits, the mutation throws an error and the frontend can redirect them to the pricing page.

This is useful because AI generation and sandbox usage cost real resources.

## Frontend User Experience

The project interface is designed around a builder workflow:

1. Start from a prompt on the home page.
2. Create a project automatically.
3. Move into a focused project workspace.
4. Read the AI response on the left.
5. Preview the generated website on the right.
6. Inspect the generated code when needed.
7. Continue prompting to improve the result.

The project view uses resizable panels so users can adjust how much space they want for chat, preview, and code.

## Why This Architecture Was Chosen

This architecture separates responsibilities clearly:

- Next.js handles the web application and routing.
- tRPC handles type-safe communication between frontend and backend.
- Prisma handles database access.
- Clerk handles identity and route protection.
- Inngest handles long-running background jobs.
- Agent Kit and OpenAI handle AI reasoning and code generation.
- E2B handles isolated execution and preview of generated apps.

This separation makes the project easier to understand, debug, and scale. The main web app stays responsive because the slow AI generation process runs in the background. The generated website runs in a sandbox, so it does not affect the main application. The database stores every important result, so users can return to previous projects and view generated fragments again.

## Summary

Buildr is a full-stack AI website builder that converts natural language prompts into live Next.js websites. It combines modern frontend tooling, type-safe APIs, authentication, database persistence, background jobs, AI agents, and sandboxed code execution.

The most important part of the project is the end-to-end generation pipeline: prompt input, project creation, background AI execution, sandbox file generation, result storage, live preview, and code inspection. This makes Buildr feel like an AI developer inside the browser.
