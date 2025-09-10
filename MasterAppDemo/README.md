# MasterAppDemo

A React + TypeScript application that hosts the `todo-app` component and provides business logic using Redux Toolkit and Axios to communicate with a backend API.

## Architecture

- **Redux Toolkit**: Manages all application state via slices and async thunks
- **Axios**: HTTP client configured with base URL and token interceptors
- **ToDoApp**: Container component that wires Redux actions to the todo-app component callbacks
- **Backend Discovery**: Inspects the `backend/` folder for actual endpoints, falls back to sensible defaults

## Backend Integration

The app automatically discovers backend routes by inspecting the `../backend/` folder. If inspection fails or there's ambiguity, it uses these defaults:

- `GET /tasks` → `Task[]`
- `POST /tasks` body `{ title: string }` → `Task`
- `PATCH /tasks/:id` body `{ completed: boolean }` → `Task`
- `DELETE /tasks/:id` → 204 No Content

All operations are pessimistic (await server success before updating state) to align with the todo-app component's async UI patterns.

## Development

```bash
cd MasterAppDemo
cp .env.example .env  # optionally adjust VITE_API_BASE_URL
npm i
npm run dev
```

The app will be available at http://localhost:5173

## Vite Alias

The project uses a Vite alias (`todo-app` → `../island/src`) for local development. To use the published GitHub package instead, remove the alias from `vite.config.ts` and add the `todo-app` dependency to `package.json`.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript checks