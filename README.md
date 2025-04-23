# Feed Forward

Feed Forward is a project management platform designed to simplify project creation, tracking, and collaboration.

## Features

- Project creation and management
- Personal project dashboard
- Public project listings
- User authentication and account management
- Responsive UI built with Nuxt.js and Tailwind CSS

## Technologies

- [Nuxt.js](https://nuxt.com/) - Vue.js framework
- [Vue 3](https://vuejs.org/) - Progressive JavaScript framework
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - UI component library
- [Supabase](https://supabase.com/) - Backend and authentication
- [Pinia](https://pinia.vuejs.org/) - State management

## Setup

Make sure to install dependencies:

```bash
# pnpm (recommended)
pnpm install
```

## Development

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Build and Production

Build the application for production:

```bash
pnpm build
```

Generate a static site:

```bash
pnpm generate
```

Locally preview production build:

```bash
pnpm preview
```

## Project Structure

- `assets/` - Static assets like CSS and images
- `components/` - Reusable Vue components
- `layouts/` - Page layouts
- `pages/` - Application routes and views
- `stores/` - Pinia state stores
- `types/` - TypeScript type definitions
- `utils/` - Utility functions and helpers
