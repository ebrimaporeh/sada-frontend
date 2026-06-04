# Frontend JS — AI Operating Instructions

## Stack

- React 19, Vite, JavaScript (JSX)
- TanStack Router for routing
- TanStack Query for server state
- Axios for HTTP
- TailwindCSS + shadcn/ui for styling

## Key Patterns

1. **API calls**: ONLY in `src/api/`. Use `apiClient` from `src/api/client.js`.
2. **Hooks**: Wrap API calls in React Query hooks (`src/hooks/`). Components never call API directly.
3. **Auth state**: Managed via `useMe()` hook — reads cached user from React Query.
4. **Tokens**: Stored in `localStorage` (`access_token`, `refresh_token`). Auto-refresh handled in `client.js`.
5. **Routes**: Defined in `src/routes/rootRoute.js`. Guards use `beforeLoad`.
6. **Layouts**: `PublicLayout`, `AuthenticatedLayout`, `AdminLayout` — all wrap `<Outlet />`.
7. **Features**: Domain logic in `src/features/<domain>/`. Components, hooks, utils co-located.

## Path Alias

`@` maps to `src/`. Use `@/hooks/useAuth` not `../../hooks/useAuth`.

## Adding a New Feature

1. Create `src/features/<name>/{components/, hooks/}`
2. Add API functions to `src/api/<name>Api.js`
3. Add query keys to `src/api/queryKeys.js`
4. Add hooks to `src/hooks/use<Name>.js`
5. Add page to `src/pages/<access>/<Name>Page.jsx`
6. Wire route in `src/routes/rootRoute.js`

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## shadcn/ui Components

Install components with:
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
```

Components land in `src/components/ui/` — do not modify them directly.
