# Buildr - Technical Definitions & Interview Guide

## Core Technologies

### **Next.js 15.3.4**
**Definition:** React-based full-stack web framework for building modern web applications with server-side rendering, static site generation, and API routes.

**Key Features Used:**
- **App Router:** File-based routing system where folders define routes
- **Server Components:** React components that render on the server by default
- **Client Components:** Interactive components that run in the browser (marked with "use client")
- **Hot Reload:** Automatic page refresh when code changes during development
- **TypeScript Integration:** Built-in TypeScript support with zero configuration

**Interview Answer:** "Next.js is a production-ready React framework that provides server-side rendering, automatic code splitting, and optimized performance out of the box. In this project, I used the latest App Router for better file organization and leveraged both server and client components for optimal performance."

### **TypeScript**
**Definition:** Statically typed superset of JavaScript that compiles to plain JavaScript, providing type safety and better developer experience.

**Usage in Project:**
- Interface definitions for component props
- Type-safe function parameters and return values
- Enum definitions for constants
- Generic types for reusable components

**Interview Answer:** "TypeScript adds static type checking to JavaScript, catching errors at compile time rather than runtime. I used it throughout the project for better code reliability, IntelliSense support, and easier refactoring."

## UI Framework & Styling

### **Tailwind CSS**
**Definition:** Utility-first CSS framework providing low-level utility classes for building custom designs without writing custom CSS.

**Key Concepts:**
- **Utility Classes:** `flex`, `p-4`, `bg-blue-500`, `text-white`
- **Responsive Design:** `sm:`, `md:`, `lg:`, `xl:` prefixes
- **Dark Mode:** `dark:` prefix for dark theme styles
- **Component Composition:** Building complex components from simple utilities

**Interview Answer:** "Tailwind CSS is a utility-first framework that lets you build designs directly in your markup. It eliminates context switching between HTML and CSS, provides consistent spacing/colors, and results in smaller bundle sizes due to unused CSS purging."

### **Shadcn/UI**
**Definition:** Modern React component library built on top of Radix UI primitives and styled with Tailwind CSS, providing copy-paste components.

**Architecture:**
- **Radix UI Primitives:** Unstyled, accessible UI primitives
- **Tailwind Styling:** Custom styling using utility classes
- **Copy-Paste Philosophy:** Components are copied into your codebase, not installed as dependencies
- **Customizable:** Full control over component styling and behavior

**Components Used:**
- Button, Input, Card, Dialog, Sheet, Dropdown Menu, Select, Checkbox, etc.

**Interview Answer:** "Shadcn/UI provides high-quality, accessible React components that you own completely. Unlike traditional component libraries, you copy the components into your project, giving you full control over styling and behavior while maintaining consistency."

### **Radix UI**
**Definition:** Low-level UI primitives for building high-quality, accessible design systems and web applications.

**Key Packages:**
- `@radix-ui/react-slot` - Utility for component composition
- `@radix-ui/react-dialog` - Modal and dialog primitives
- `@radix-ui/react-dropdown-menu` - Dropdown menu functionality
- `@radix-ui/react-select` - Select input primitives

**Interview Answer:** "Radix UI provides unstyled, accessible UI primitives that handle complex interactions and accessibility concerns. Shadcn/UI components are built on top of these primitives, ensuring robust functionality and ARIA compliance."

## AI & Prompt Engineering

### **Multi-Agent System**
**Definition:** AI architecture where multiple specialized agents work together to accomplish complex tasks.

**Agents in Project:**
1. **Main Prompt Agent:** Handles code generation and development tasks
2. **Response Agent:** Generates user-friendly explanations
3. **Fragment Title Agent:** Creates descriptive titles for code components

**Interview Answer:** "I designed a multi-agent system where each AI agent has a specific responsibility. This separation of concerns ensures better output quality and allows for specialized optimization of each agent's instructions."

### **Prompt Engineering**
**Definition:** The practice of designing and refining input prompts to get desired outputs from AI language models.

**Techniques Used:**
- **Structured Instructions:** Clear step-by-step guidelines
- **Constraint Definition:** Explicit rules about what to do/avoid
- **Context Provision:** Environment setup and available tools
- **Error Prevention:** Anticipating and preventing common mistakes
- **Template Formatting:** Consistent output structure requirements

**Interview Answer:** "Prompt engineering involves crafting detailed instructions that guide AI models to produce reliable, consistent outputs. I created 500+ line prompts with explicit rules, examples, and error prevention measures to ensure production-quality code generation."

## Development Environment & Tools

### **Sandboxed Environment**
**Definition:** Isolated development environment where code can be executed safely without affecting the host system.

**Features:**
- File system operations (create, read, update files)
- Terminal command execution
- Package installation
- Hot-reload development server

**Interview Answer:** "The sandboxed environment provides a safe, isolated space for AI-generated code execution. It includes file system access, terminal operations, and a running development server, allowing for complete application development without security risks."

### **Hot Reload**
**Definition:** Development feature that automatically refreshes the application when code changes are detected, without losing application state.

**Implementation:**
- Webpack's Hot Module Replacement (HMR)
- Next.js built-in development server
- Real-time file watching

**Interview Answer:** "Hot reload dramatically improves development experience by instantly reflecting code changes in the browser. Next.js provides this out of the box, making the development process more efficient and interactive."

## Code Quality & Architecture

### **Component Validation System**
**Definition:** Custom system that verifies component existence before import to prevent module resolution errors.

**Process:**
1. Check if component file exists using `readFiles`
2. Install required dependencies if missing
3. Create component if it doesn't exist
4. Only import after verification

**Interview Answer:** "I built a validation system that checks component availability before importing them. This prevents 'module not found' errors and ensures all dependencies are properly installed, making the code generation more robust."

### **Dependency Management**
**Definition:** Automated system for handling package installation and version conflicts.

**Features:**
- Automatic Radix UI package installation
- Dependency conflict resolution
- Version compatibility checking
- Fallback mechanisms for missing packages

**Interview Answer:** "The dependency management system automatically installs required packages and resolves conflicts. It's particularly important for Radix UI packages that Shadcn components depend on but aren't always pre-installed."

### **Error Prevention System**
**Definition:** Comprehensive set of rules and checks to prevent common React and Next.js errors.

**Prevention Areas:**
- **Hydration Errors:** Ensuring server/client rendering consistency
- **Import Errors:** Validating module availability
- **Type Errors:** Enforcing proper TypeScript usage
- **Build Errors:** Preventing configuration conflicts

**Interview Answer:** "I implemented multiple layers of error prevention including hydration safety rules, import validation, and build configuration checks. This ensures generated applications work reliably without common React/Next.js pitfalls."

## React Concepts

### **Server vs Client Components**
**Definition:** Next.js App Router distinction between components that render on the server vs. those that need browser APIs.

**Server Components:**
- Render on the server
- Can access databases directly
- No browser APIs or hooks
- Better performance and SEO

**Client Components:**
- Marked with "use client" directive
- Can use React hooks and browser APIs
- Interactive functionality
- Hydrated on the client

**Interview Answer:** "Server components render on the server and are great for static content and data fetching. Client components run in the browser and are needed for interactivity. I use 'use client' directive for components that need hooks or browser APIs."

### **React Hooks**
**Definition:** Functions that let you use state and other React features in functional components.

**Hooks Used:**
- `useState` - Managing component state
- `useEffect` - Side effects and lifecycle events
- `useRef` - DOM element references
- `useContext` - Consuming React context

**Interview Answer:** "React hooks allow functional components to have state and lifecycle methods. I use useState for component state, useEffect for side effects, and other hooks as needed while ensuring proper 'use client' directives."

## Performance & Optimization

### **Code Splitting**
**Definition:** Technique of breaking code into smaller chunks that can be loaded on demand.

**Next.js Implementation:**
- Automatic route-based code splitting
- Dynamic imports for components
- Optimized bundle loading

**Interview Answer:** "Next.js automatically splits code by routes, loading only the JavaScript needed for each page. This reduces initial bundle size and improves performance, especially important for large applications."

### **Tree Shaking**
**Definition:** Process of eliminating dead code from the final bundle by only including used exports.

**Benefits:**
- Smaller bundle sizes
- Faster load times
- Better performance

**Interview Answer:** "Tree shaking removes unused code from the final bundle. With ES6 modules and modern build tools, only the code that's actually imported and used gets included in the production build."

## Development Workflow

### **File System Operations**
**Definition:** Programmatic creation, reading, and updating of files in the development environment.

**Operations:**
- `createOrUpdateFiles` - Create or modify files
- `readFiles` - Read file contents
- Relative path handling
- Safe file operations

**Interview Answer:** "The system uses programmatic file operations to generate and modify code files. All operations use relative paths for safety and include validation to prevent errors."

### **Terminal Integration**
**Definition:** Ability to execute command-line operations programmatically for package management and builds.

**Commands:**
- `npm install <package> --yes` - Package installation
- Dependency resolution
- Build operations (when needed)

**Interview Answer:** "Terminal integration allows the AI to install packages and manage dependencies automatically. This ensures all required packages are available before attempting to use them in code."

## Accessibility & Best Practices

### **ARIA (Accessible Rich Internet Applications)**
**Definition:** Set of attributes that define ways to make web content more accessible to people with disabilities.

**Implementation:**
- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility

**Interview Answer:** "ARIA attributes make web applications accessible to users with disabilities. Shadcn/UI components include proper ARIA implementation, and I ensure generated code follows accessibility best practices."

### **Responsive Design**
**Definition:** Approach to web design that makes web pages render well on various devices and screen sizes.

**Tailwind Implementation:**
- Mobile-first approach
- Breakpoint prefixes (sm:, md:, lg:, xl:)
- Flexible grid systems
- Responsive typography

**Interview Answer:** "Responsive design ensures applications work well on all devices. I use Tailwind's mobile-first approach with responsive prefixes to create layouts that adapt to different screen sizes."

This comprehensive guide covers all major technical concepts used in the Buildr project, providing detailed explanations and interview-ready answers for each technology and methodology.
