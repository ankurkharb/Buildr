# Buildr Interview Questions and Answers

This document contains interview-style questions and strong answers for explaining the Buildr project to a CTO, Head of Engineering, senior engineer, or technical interviewer.

## 1. What is Buildr?

Buildr is an AI-powered website and app builder. A user enters a natural language prompt, and the system generates a working Next.js website inside an isolated sandbox. The user can preview the generated website, inspect the generated source code, and continue iterating through follow-up prompts.

The project combines a full-stack web app with an AI code-generation pipeline. It includes authentication, project history, database persistence, background jobs, AI agents, live previews, and usage limits.

## 2. What problem does this project solve?

Buildr reduces the gap between an idea and a working prototype. Instead of manually creating a Next.js project, installing UI libraries, writing components, and setting up layouts, the user describes what they want and gets a generated website quickly.

It is useful for:

- Fast prototyping
- Landing page generation
- Internal tool mockups
- UI experimentation
- Non-technical users who want to turn ideas into working interfaces

## 3. Can you explain the high-level architecture?

The architecture has five main parts:

- Next.js frontend for the user interface
- tRPC backend procedures for type-safe API communication
- Prisma and PostgreSQL for persistence
- Inngest for background job orchestration
- E2B sandbox plus AI agents for code generation and live preview

The frontend sends a prompt to a protected tRPC mutation. The backend stores the prompt, creates a project, and sends an Inngest event. Inngest starts a background function that creates an E2B sandbox, runs an AI coding agent, writes files into the sandbox, gets a preview URL, and saves the result back to the database.

## 4. Why did you use Next.js?

I used Next.js because the project needs both frontend pages and backend endpoints. Next.js gives routing, layouts, API routes, server-side capabilities, and React integration in one framework.

It also fits well with the rest of the stack: Clerk for authentication, tRPC for APIs, Prisma for database access, and Vercel-style deployment patterns.

## 5. Why did you use tRPC instead of REST?

tRPC gives end-to-end type safety between the frontend and backend. Since this project has many structured operations like creating projects, fetching messages, checking usage, and submitting prompts, tRPC reduces API boilerplate and makes frontend calls safer.

With REST, I would need to manually maintain request and response types separately. With tRPC, the frontend knows the exact input and output types from the backend procedures.

## 6. Why did you use Prisma?

Prisma gives a type-safe database client and clean query syntax. The project has relational data: users own projects, projects contain messages, and assistant messages can have generated fragments. Prisma makes those relationships easier to model and query.

It also provides migrations, which helps evolve the database schema safely as the product grows.

## 7. Why PostgreSQL?

PostgreSQL is reliable, production-ready, and strong for relational data. Buildr needs to store users, projects, messages, fragments, and usage records. These entities have clear relationships, so PostgreSQL is a good fit.

It also works very well with Prisma and can scale for this type of SaaS application.

## 8. Why did you use Inngest?

AI code generation can take time. It should not block the user's HTTP request. Inngest lets the app move the slow generation process into a background workflow.

It also provides step-based execution, which is useful because the generation pipeline has multiple stages: create sandbox, load previous messages, run the AI agent, generate title, generate response, get sandbox URL, and save the result.

## 9. Why did you use E2B?

E2B provides an isolated sandbox where generated code can be written and executed safely. This is important because AI-generated code should not run inside the main application environment.

E2B also provides terminal access, file access, and a public preview URL. That makes it possible to generate a real Next.js app and show the user a live preview.

## 10. Why did you choose a sandbox instead of generating code directly in the main app?

Running generated code inside the main app would be risky and hard to isolate. A sandbox protects the main application from broken code, dependency issues, infinite loops, or unsafe generated behavior.

The sandbox gives each generation its own environment. If the generated app fails, the main Buildr app still remains stable.

## 11. What is the complete flow from prompt to generated website?

The flow is:

1. User enters a prompt on the home page.
2. The frontend calls the `projects.create` tRPC mutation.
3. The backend validates authentication and usage credits.
4. A project and user message are saved in PostgreSQL through Prisma.
5. The backend sends a `BuildrAgent/run` event to Inngest.
6. Inngest starts the background Buildr agent function.
7. The function creates an E2B sandbox.
8. Recent project messages are loaded for context.
9. The AI coding agent generates and writes files inside the sandbox.
10. Buildr gets the sandbox preview URL.
11. Smaller agents generate a fragment title and user-friendly response.
12. The assistant message, generated files, and sandbox URL are saved in the database.
13. The project UI displays the live preview and generated code.

## 12. How do follow-up prompts work?

Follow-up prompts use the `messages.create` mutation. The message is saved under the existing project, and another Inngest event is sent.

Before running the AI agent, the background function loads recent previous messages from the project. This gives the agent context about what was already built, so the next generation can build on the previous conversation.

## 13. How is authentication handled?

Authentication is handled using Clerk. Middleware protects private routes, and tRPC protected procedures check whether a user is logged in before allowing project or message operations.

Each project is stored with a `userId`, and backend queries verify that the requested project belongs to the current authenticated user.

## 14. How do you prevent one user from accessing another user's project?

The backend always filters projects by both `id` and `userId`. For example, when fetching a project, the query checks that the project ID matches and that the `userId` matches the authenticated user.

This is important because frontend route protection alone is not enough. Authorization must be enforced at the backend query level.

## 15. How are usage limits handled?

Usage limits are handled with `rate-limiter-flexible` and Prisma. Each generation consumes one credit. Free users get fewer credits, while pro users get more.

This protects the system from unlimited AI and sandbox usage, which is important because those operations have real cost.

## 16. What are the main database models?

The main models are:

- `Project`: stores project metadata and owner information.
- `Message`: stores user prompts and assistant responses.
- `Fragment`: stores generated website results, including sandbox URL and generated files.
- `Usage`: stores credit/rate-limit data.

The relationship is: one project has many messages, and an assistant message can have one generated fragment.

## 17. What is a Fragment in this project?

A fragment is the generated result of an assistant response. It contains the live sandbox URL, title, and generated files.

The UI uses the fragment to show the website preview in the Demo tab and the generated source code in the Code tab.

## 18. Why store generated files in the database?

The generated files are stored so the user can inspect the generated code later. Without storing them, the app would depend only on the sandbox being alive.

Storing files also makes project history more useful because each assistant result can be reviewed even after the generation process finishes.

## 19. What are the tradeoffs of storing files as JSON?

Storing files as JSON is simple and works well for early-stage development. It lets the app save all generated files as one object linked to a fragment.

The tradeoff is that very large projects could make the JSON field heavy. At larger scale, I would consider storing generated files in object storage like S3 and keeping only metadata and references in the database.

## 20. How does the live preview work?

The generated app runs inside the E2B sandbox. Buildr gets the public host for port `3000` and stores it as the `sandboxUrl`.

The frontend renders that URL inside an iframe. The user can refresh the iframe, copy the URL, or open it in a new tab.

## 21. How do you show generated code to the user?

The generated files are saved as a JSON object where keys are file paths and values are file contents. The frontend converts that object into a tree structure for the file explorer.

When the user selects a file, the code viewer displays the file contents with syntax highlighting.

## 22. Why did you use Shadcn/UI?

Shadcn/UI provides accessible, customizable components that fit well with Tailwind CSS. It is especially useful for this project because the UI needs forms, buttons, tabs, resizable panels, dropdowns, breadcrumbs, and other common interface pieces.

Unlike many component libraries, Shadcn components live inside the codebase, so they can be customized freely.

## 23. Why did you use Tailwind CSS?

Tailwind helps build responsive and consistent layouts quickly. Buildr has several interface-heavy screens, including the prompt form, project list, chat panel, preview panel, and code explorer.

Tailwind keeps styling close to the component and avoids creating many separate CSS files.

## 24. What is the role of the system prompt?

The system prompt controls how the AI coding agent behaves. It tells the agent what environment it is working in, which files to edit, how to use tools, how to use Tailwind and Shadcn/UI, and how to finish with a task summary.

For an AI code-generation project, the system prompt is part of the core application logic. Better prompt rules lead to more reliable generated apps.

## 25. Why use multiple agents instead of one agent?

The main coding agent focuses on generating the application. Smaller agents handle simpler tasks like generating a short title and a user-friendly response.

This separation keeps each agent focused. The coding agent does technical work, while the response agent creates clean user-facing communication.

## 26. How would you improve AI reliability?

I would improve reliability by adding:

- Automated validation after generation
- Build checks inside the sandbox
- Screenshot checks for blank or broken previews
- Stronger error classification
- Retry logic for recoverable failures
- A structured output schema for agent summaries
- Evaluation tests using common prompt scenarios

Right now, the system already has a controlled prompt, tool-based file writing, and failure detection based on whether files and summary exist.

## 27. How do you handle generation failure?

If the AI agent does not produce a summary or generated files, the function treats the result as an error. It saves an assistant message with type `ERROR` and a generic failure message.

This prevents the UI from showing an empty or broken result as if it succeeded.

## 28. What are the biggest technical risks in this project?

The biggest risks are:

- AI-generated code may fail to build.
- Sandbox startup or preview may fail.
- Long-running jobs may time out.
- Usage costs can grow quickly.
- Generated files may become too large for database JSON storage.
- Prompt instructions may not always be followed.
- Security must be handled carefully because generated code is executed.

The architecture reduces these risks by using background jobs, sandbox isolation, usage limits, and database persistence.

## 29. How would you scale this system?

To scale the system, I would:

- Move generated files to object storage for large outputs.
- Add queue concurrency controls for Inngest jobs.
- Add retries and better failure recovery.
- Cache project/message queries where appropriate.
- Add observability for generation duration, failures, and sandbox errors.
- Add billing-based usage tiers.
- Store sandbox lifecycle metadata.
- Run automated build checks before marking a generation successful.

The current architecture is already modular enough to support these improvements.

## 30. How would you reduce AI and sandbox cost?

I would reduce cost by:

- Enforcing usage limits by plan.
- Using smaller models for title and response generation.
- Limiting context to recent messages.
- Adding caching for repeated prompts or templates.
- Automatically shutting down unused sandboxes.
- Running validation before expensive follow-up steps.
- Offering cheaper generation modes for simple pages.

The project already has a usage credit system, which is the first important step.

## 31. How would you make this production-ready?

I would add:

- Strong environment variable validation
- Better error logging and monitoring
- Sandbox build validation
- Retry policies for transient failures
- File size limits
- More secure iframe and sandbox policies
- Webhook-based billing integration
- Tests for tRPC procedures
- End-to-end tests for prompt submission flow
- Observability dashboards for generation success rate and latency

The existing structure is a strong prototype, but production readiness would require deeper monitoring, validation, and operational controls.

## 32. How would you test this project?

I would test it at multiple levels:

- Unit tests for utility functions like file tree conversion and usage logic
- Integration tests for tRPC procedures
- Database tests for project/message ownership
- End-to-end tests for creating a project from a prompt
- Background job tests for the Inngest generation flow
- Sandbox validation tests to confirm generated apps actually render

The most important test is the full prompt-to-preview flow because that is the core product experience.

## 33. What would you monitor in production?

I would monitor:

- Prompt submission count
- Generation success rate
- Generation failure reasons
- Average generation time
- Sandbox creation failures
- Model errors
- Database query performance
- Credit consumption
- User conversion from free to pro
- Preview load failures

For this kind of AI product, generation success rate and latency are two of the most important metrics.

## 34. How do you ensure generated code is safe?

Generated code is executed inside an E2B sandbox instead of the main application environment. That is the main safety boundary.

I would further improve safety by restricting network access, limiting execution time, limiting file size, scanning generated code, and preventing access to sensitive environment variables.

## 35. Why is background processing important here?

Website generation is not instant. It may involve multiple AI calls, file writes, dependency checks, and sandbox operations. If this happened directly inside the API request, the request could time out and the UI would feel blocked.

Background processing lets the app respond quickly after project creation while the generation continues separately.

## 36. What is the role of React Query?

React Query manages server state on the frontend. It handles data loading, caching, and invalidation for tRPC queries.

For example, after creating a project, the project list and usage status queries are invalidated so the UI can show fresh data.

## 37. Why do you use protected tRPC procedures?

Protected procedures centralize authentication checks. Any procedure that requires a logged-in user uses the same middleware.

This avoids repeating auth logic in every function and reduces the chance of accidentally exposing private data.

## 38. What is one important engineering decision you made?

One important decision was separating the main application from generated applications. Buildr itself runs as the product interface, while generated websites run in E2B sandboxes.

This separation improves safety, reliability, and maintainability. A broken generated app does not break the main Buildr application.

## 39. What tradeoff did you make by using AI agents?

AI agents make the product much more powerful because they can generate flexible applications from natural language. The tradeoff is unpredictability.

Traditional code is deterministic, while AI output can vary. To manage that, the project uses strict system prompts, tool constraints, sandbox isolation, and result validation.

## 40. What would you improve in the prompt system?

I would make the prompt shorter, more structured, and easier to version. I would also move repeated rules into reusable prompt sections and add structured validation criteria.

For production, I would track prompt versions so I can compare generation quality over time and roll back if a prompt change reduces reliability.

## 41. How would you handle multiple files and larger generated apps?

For larger apps, I would keep the same file-map approach during generation but store files externally after generation. I would also add file count limits, file size limits, and a better project artifact model.

The UI could still show a file explorer, but the database would store metadata and object storage URLs instead of the full file contents.

## 42. How would you support deployment of generated websites?

I would add an export or deploy step after generation. The user could deploy the generated app to a hosting provider like Vercel.

The flow would be:

1. Validate generated code.
2. Package files as a project.
3. Push to a Git repository or deployment API.
4. Trigger deployment.
5. Store the production deployment URL.

## 43. How would you support collaboration?

I would add team/workspace models and permissions. Instead of only `userId`, projects could belong to a workspace. Users could have roles like owner, editor, and viewer.

The authorization checks would move from user-owned projects to workspace membership checks.

## 44. How would you handle real-time updates while generation is running?

Currently, the generation result is saved after the background job completes. For a better experience, I would add real-time progress using polling, Server-Sent Events, or WebSockets.

Inngest steps could update generation status in the database, and the UI could show stages such as "Creating sandbox", "Generating files", "Running checks", and "Preparing preview".

## 45. How would you improve the user experience?

I would add:

- Generation progress states
- Better error messages
- Prompt templates
- Version history for fragments
- Ability to restore older fragments
- Download generated code as a zip
- Deploy button
- More visible credit usage
- Better mobile layout for the project view

These improvements would make the product feel more complete and trustworthy.

## 46. What is the difference between project messages and fragments?

Messages represent the conversation. A user message stores the prompt, and an assistant message stores the response.

Fragments represent generated artifacts. A fragment belongs to an assistant message and stores the actual output: generated files, preview URL, and title.

This separation is useful because not every message must contain a generated artifact.

## 47. How would you debug a failed generation?

I would check:

- Whether the Inngest event was sent
- Whether the Inngest function started
- Whether the E2B sandbox was created
- Agent output and task summary
- Terminal command errors from the sandbox
- Whether files were written to agent state
- Whether the sandbox URL was generated
- Whether Prisma saved the assistant message and fragment

This follows the same sequence as the prompt-to-preview pipeline.

## 48. What would you say is the hardest part of this project?

The hardest part is making AI-generated code reliable enough for users. The system must handle unpredictable prompts, generated code errors, dependency issues, sandbox failures, and long-running tasks.

The solution is not just calling an AI model. The real engineering work is building the workflow around it: sandboxing, persistence, validation, background execution, usage controls, and a good user interface.

## 49. If the CTO asks why this is not just a wrapper around ChatGPT, what would you say?

Buildr is not just a chat wrapper because it turns AI output into a working software artifact. It creates projects, stores history, runs a coding agent with tools, writes files into a sandbox, exposes a live preview URL, saves generated files, and lets the user inspect code.

The value is in the full product workflow around the model, not only in the model response.

## 50. How would you explain this project in one minute?

Buildr is an AI-powered website builder built with Next.js, tRPC, Prisma, Clerk, Inngest, OpenAI, and E2B. A user enters a prompt, the app creates a project, sends a background generation job, runs an AI coding agent inside an isolated sandbox, writes a real Next.js app, stores the generated files and preview URL, and shows the result in a split-screen interface with chat, live demo, and code explorer.

The architecture is designed to keep the main app responsive and safe while generated code runs separately in a sandbox.

## 51. What are the strongest points of this project?

The strongest points are:

- It has a complete end-to-end AI generation pipeline.
- It uses sandboxing instead of unsafe direct execution.
- It has persistent projects and message history.
- It separates background AI work from the main user request.
- It provides both live preview and source code inspection.
- It includes authentication and usage limits.

## 52. What are the current limitations?

The current limitations are:

- Generated code may not always build perfectly.
- There is limited automated validation after generation.
- Large generated projects may be too heavy for JSON storage.
- The user experience could benefit from real-time progress updates.
- Error handling can be more specific.
- Production monitoring and observability need to be added.

## 53. How would you answer if asked about system design tradeoffs?

I would say the main tradeoff is complexity versus safety. Using Inngest and E2B makes the system more complex than a simple API call, but it gives better reliability, isolation, and scalability.

For an AI code-generation product, that tradeoff is worth it because generated code must be separated from the main application and long-running jobs must be handled outside the request cycle.

## 54. What would you change if you had more time?

I would focus on generation reliability and production readiness first. Specifically, I would add build validation inside the sandbox, better progress tracking, structured error messages, storage improvements for generated files, and end-to-end tests.

After that, I would add product features like deployment, version history, downloading code, and collaboration.

## 55. What is the best technical takeaway from this project?

The best technical takeaway is that building an AI product is not only about prompting a model. The important part is the surrounding engineering system: authentication, persistence, background workflows, sandboxed execution, validation, cost control, and a user interface that makes the AI output useful.

Buildr demonstrates how these parts can work together to turn a natural language prompt into a real, previewable web application.
