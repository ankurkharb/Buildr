# Buildr.ai

An AI-powered website builder that transforms natural language prompts into fully functional, production-ready websites. Built with Next.js 15, TypeScript, and modern web technologies.

## Overview

Buildr.ai lets you describe what you want — and it builds it. Instead of dragging and dropping components or writing boilerplate, you simply tell the AI what your website should look like and do. It handles layout, styling, responsive design, and even business logic.

This project was born out of a desire to make web development accessible to everyone, regardless of technical expertise. Whether you're a founder prototyping an MVP or a developer speeding up your workflow, Buildr.ai gets you from idea to deploy in minutes.

## Key Features

- **Prompt-to-Website Generation** — Describe your site in plain English and get a complete, responsive website
- **Live Code Preview** — See your generated website in real-time with sandboxed execution via E2B
- **Smart Component System** — Pre-built UI components powered by Radix UI and shadcn/ui
- **Authentication** — Secure user auth with Clerk (sign-up, sign-in, session management)
- **Project Management** — Save, organize, and iterate on multiple website projects
- **Database Integration** — PostgreSQL with Prisma ORM for persistent data storage
- **Background Jobs** — Inngest-powered async workflows for AI generation pipelines
- **Type-Safe API Layer** — End-to-end type safety with tRPC and Zod validation
- **Dark Mode** — Full dark/light theme support with next-themes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI + shadcn/ui |
| Authentication | Clerk |
| Database | PostgreSQL + Prisma |
| API | tRPC v11 |
| AI/LLM | OpenAI API |
| Code Sandbox | E2B Code Interpreter |
| Background Jobs | Inngest |
| State Management | TanStack React Query |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- API keys for Clerk, OpenAI, and E2B

### Setup

```bash
# Clone the repo
git clone https://github.com/ankurkharb/Buildr.git
cd Buildr

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your API keys and database URL

# Initialize the database
npx prisma db push

# Start development server
npm run dev
```

Open https://rookierao-buildr-app.hf.space/ to start building.

### Environment Variables

```env
DATABASE_URL="postgresql://..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
OPENAI_API_KEY="sk-..."
E2B_API_KEY="e2b_..."
INNGEST_SIGNING_KEY="..."
```

## Architecture

```
src/
├── app/              # Next.js App Router pages & API routes
│   ├── (home)/       # Landing & dashboard pages
│   ├── api/          # tRPC & webhook endpoints
│   └── projects/     # Project workspace views
├── components/       # Shared React components
├── hooks/            # Custom React hooks
├── inngest/          # Background job definitions
├── lib/              # Utilities & shared config
├── modules/          # Feature-specific modules
├── trpc/             # tRPC router & client setup
├── middleware.ts     # Auth & route protection
└── prompt.ts         # AI prompt engineering
```

## Development

```bash
# Run dev server with Turbopack
npm run dev

# Lint the codebase
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## License

MIT
