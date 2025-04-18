# Feed Forward Project Guide

## Build & Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm generate` - Generate static site
- `pnpm preview` - Preview production build
- `pnpm postinstall` - Run nuxt prepare after installation

## Code Style Guidelines

### TypeScript

- TypeScript is used throughout the project
- Type definitions in `types/database.types.ts`
- Explicit typing is preferred but `any` is permitted when necessary

### Vue Components

- Use Vue 3 composition API with `<script setup lang="ts">`
- Follow single-file component structure
- Use shadcn-ui components from `components/shadcn-ui/`

### Formatting

- Tailwind CSS for styling with proper class ordering
- Use ESLint with configured rules (some rules disabled - see eslint.config.mjs)

### Navigation

- Use `navigateTo()` instead of `window.location.href` for proper middleware execution

### State Management

- Use Pinia stores in `stores/` directory

### Authentication

- Use Supabase authentication through provided hooks
