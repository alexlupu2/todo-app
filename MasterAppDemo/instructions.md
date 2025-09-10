# Prompt for AI Agent — Build `MasterAppDemo` (Parent app hosting `todo-app`)

## Your role

You are a senior frontend engineer. Create a **React + TypeScript** application named **`MasterAppDemo`** that **hosts** the previously built `todo-app` UI component and provides business logic using **Redux Toolkit** and an **Axios** client to talk to a backend API.

This app lives **at the same directory level** as:

* `island/` (the `todo-app` library source)
* `backend/` (an API server the agent can inspect to discover endpoints/shape)

Final structure (siblings):

```
/root
  ├─ MasterAppDemo/     ← build this
  ├─ island/            ← todo-app component (already exists)
  └─ backend/           ← backend server (inspect & use)
```

The parent app should:

* Render `<ToDoApp />` from `todo-app`
* Manage **all state** via Redux Toolkit
* Wire `<ToDoApp />` callbacks to **async thunks** that call the backend with Axios
* Return **Promises** from those callbacks so `todo-app` can show its pending UI

---

## Tech & targets

* **Bundler**: Vite (React SWC plugin)
* **Language**: TypeScript
* **React**: 19
* **Node**: ≥ 22
* **State**: Redux Toolkit + React-Redux
* **HTTP**: Axios (instance w/ base URL, JSON defaults, simple interceptors)
* **Env**: `.env` with `VITE_API_BASE_URL` (default `http://localhost:3000`)
* **Styling**: Minimal inline/CSS for parent app (the `todo-app` handles its own CSS Modules)
* **Tests**: None
* **License**: MIT (optional here)
* **Dev UX**: Vite alias `todo-app` → `../island/src` for local development

---

## API detection & fallbacks (IMPORTANT)

1. **Inspect** the `backend/` folder to identify actual endpoints and task schema. Prefer these if present.

2. If inspection fails or there’s ambiguity, use **sensible defaults**:

   **Default endpoints**

   * `GET /tasks` → `Task[]`
   * `POST /tasks` body `{ title: string }` → `Task`
   * `PATCH /tasks/:id` body `{ completed: boolean }` → `Task`
   * `DELETE /tasks/:id` → 204 No Content

   **Default server-to-client mapping**

   ```ts
   // Client-side Task for both Redux state and ToDoApp props
   type Task = { id: string; title: string; completed: boolean };

   // Map common variants returned by APIs to our Task
   const toTask = (x: any): Task => ({
     id: String(x?.id ?? x?._id ?? x?.uuid),
     title: String(x?.title ?? x?.name ?? x?.text ?? ""),
     completed: Boolean(x?.completed ?? x?.done ?? x?.isDone ?? false),
   });
   ```

3. Prefer **pessimistic** updates (await server success) to align with the `todo-app` component’s async UI. The thunk dispatch **must return a Promise** (use `unwrap()` in handlers).

---

## App behavior

* On mount, **fetch** tasks (`GET /tasks`) and store them in Redux.
* Render `ToDoApp` with:

  ```tsx
  <ToDoApp
    tasks={tasks}
    onCreateTask={(title) => dispatch(createTask(title)).unwrap()}
    onToggleTask={(id, completed) => dispatch(toggleTask({ id, completed })).unwrap()}
    onDeleteTask={(id) => dispatch(deleteTask(id)).unwrap()}
  />
  ```
* Show a small parent-level **error banner** (if last operation failed). The `todo-app` handles inline spinners per action based on the returned promises.

---

## Project structure (exact paths)

```
MasterAppDemo/
├─ src/
│  ├─ app/
│  │  ├─ store.ts
│  │  └─ hooks.ts
│  ├─ features/
│  │  └─ tasks/
│  │     ├─ api.ts
│  │     ├─ tasksSlice.ts
│  │     └─ types.ts
│  ├─ components/
│  │  ├─ HostToDo.tsx
│  │  └─ ErrorBanner.tsx
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ global.css
├─ index.html
├─ vite.config.ts
├─ tsconfig.json
├─ package.json
├─ .env.example
├─ README.md
└─ .gitignore
```

---

## File contents (implement as specified)

### `src/features/tasks/types.ts`

```ts
export type Task = {
  id: string;
  title: string;
  completed: boolean;
};
```

### `src/features/tasks/api.ts`

* Create and export a configured Axios instance.
* Base URL: `import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"`.
* JSON headers; simple request/response interceptors (optional Authorization header from `localStorage.getItem("token")`, if present).
* Export CRUD functions that:

  * Call the backend (or defaults),
  * Map responses to `Task` using `toTask`.

```ts
import axios from "axios";
import type { Task } from "./types";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const toTask = (x: any): Task => ({
  id: String(x?.id ?? x?._id ?? x?.uuid),
  title: String(x?.title ?? x?.name ?? x?.text ?? ""),
  completed: Boolean(x?.completed ?? x?.done ?? x?.isDone ?? false),
});

export async function fetchTasksApi(): Promise<Task[]> {
  const res = await api.get("/tasks");
  const data = Array.isArray(res.data) ? res.data : res.data?.tasks ?? [];
  return data.map(toTask);
}

export async function createTaskApi(title: string): Promise<Task> {
  const res = await api.post("/tasks", { title });
  return toTask(res.data);
}

export async function toggleTaskApi(id: string, completed: boolean): Promise<Task> {
  const res = await api.patch(`/tasks/${id}`, { completed });
  return toTask(res.data);
}

export async function deleteTaskApi(id: string): Promise<string> {
  await api.delete(`/tasks/${id}`);
  return id;
}
```

### `src/features/tasks/tasksSlice.ts`

* Redux Toolkit slice with async thunks: `fetchTasks`, `createTask`, `toggleTask`, `deleteTask`.
* State includes `items: Task[]`, `loading: boolean`, `creating: boolean`, `togglingById: Record<string, boolean>`, `deletingById: Record<string, boolean>`, and `error: string | null`.
* Use **pessimistic** updates (apply changes after fulfilled).

```ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Task } from "./types";
import { fetchTasksApi, createTaskApi, toggleTaskApi, deleteTaskApi } from "./api";

type TasksState = {
  items: Task[];
  loading: boolean;
  creating: boolean;
  togglingById: Record<string, boolean>;
  deletingById: Record<string, boolean>;
  error: string | null;
};

const initialState: TasksState = {
  items: [],
  loading: false,
  creating: false,
  togglingById: {},
  deletingById: {},
  error: null,
};

export const fetchTasks = createAsyncThunk("tasks/fetchAll", async () => {
  return await fetchTasksApi();
});

export const createTask = createAsyncThunk("tasks/create", async (title: string) => {
  return await createTaskApi(title);
});

export const toggleTask = createAsyncThunk(
  "tasks/toggle",
  async ({ id, completed }: { id: string; completed: boolean }) => {
    return await toggleTaskApi(id, completed);
  }
);

export const deleteTask = createAsyncThunk("tasks/delete", async (id: string) => {
  return await deleteTaskApi(id);
});

const slice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch tasks.";
      })

      // create
      .addCase(createTask.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.items.push(action.payload);
        state.creating = false;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message ?? "Failed to create task.";
      })

      // toggle
      .addCase(toggleTask.pending, (state, action) => {
        const id = (action.meta.arg as { id: string }).id;
        state.togglingById[id] = true;
        state.error = null;
      })
      .addCase(toggleTask.fulfilled, (state, action: PayloadAction<Task>) => {
        const t = action.payload;
        const idx = state.items.findIndex((x) => x.id === t.id);
        if (idx >= 0) state.items[idx] = t;
        state.togglingById[t.id] = false;
      })
      .addCase(toggleTask.rejected, (state, action) => {
        const id = (action.meta.arg as { id: string }).id;
        state.togglingById[id] = false;
        state.error = action.error.message ?? "Failed to toggle task.";
      })

      // delete
      .addCase(deleteTask.pending, (state, action) => {
        const id = action.meta.arg as string;
        state.deletingById[id] = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        const id = action.payload;
        state.items = state.items.filter((x) => x.id !== id);
        state.deletingById[id] = false;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        const id = action.meta.arg as string;
        state.deletingById[id] = false;
        state.error = action.error.message ?? "Failed to delete task.";
      });
  },
});

export const { clearError } = slice.actions;
export default slice.reducer;
```

### `src/app/store.ts`

```ts
import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "../features/tasks/tasksSlice";

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### `src/app/hooks.ts`

```ts
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### `src/components/ErrorBanner.tsx`

```tsx
import React from "react";

export default function ErrorBanner({ message, onClose }: { message: string; onClose?: () => void }) {
  if (!message) return null;
  return (
    <div style={{
      background: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fecaca",
      padding: "8px 12px",
      borderRadius: 8,
      marginBottom: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ marginLeft: 12, border: "none", background: "transparent", cursor: "pointer" }}>
          ✕
        </button>
      )}
    </div>
  );
}
```

### `src/components/HostToDo.tsx`

* Container that selects data from Redux, dispatches thunks, and returns **Promises** to `ToDoApp`.
* Auto-fetch on mount.
* Optional error banner that clears on close.

```tsx
import React, { useEffect } from "react";
import ToDoApp from "todo-app"; // resolved via Vite alias to ../island/src
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchTasks, createTask, toggleTask, deleteTask, clearError } from "../features/tasks/tasksSlice";
import ErrorBanner from "./ErrorBanner";

export default function HostToDo() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((s) => s.tasks.items);
  const error = useAppSelector((s) => s.tasks.error);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const onCreateTask = (title: string) => dispatch(createTask(title)).unwrap();
  const onToggleTask = (id: string, completed: boolean) => dispatch(toggleTask({ id, completed })).unwrap();
  const onDeleteTask = (id: string) => dispatch(deleteTask(id)).unwrap();

  return (
    <div style={{ maxWidth: 640, margin: "32px auto", padding: "0 16px" }}>
      {error && <ErrorBanner message={error} onClose={() => dispatch(clearError())} />}
      <ToDoApp
        tasks={tasks}
        onCreateTask={onCreateTask}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        autoFocus
      />
    </div>
  );
}
```

### `src/App.tsx`

```tsx
import React from "react";
import HostToDo from "./components/HostToDo";

export default function App() {
  return <HostToDo />;
}
```

### `src/main.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";
import "./global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

### `src/global.css`

Minimal reset/host styles.

```css
:root { color-scheme: light; font-synthesis-weight: none; }
* { box-sizing: border-box; }
html, body, #root { height: 100%; }
body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"; background: #fafafa; color: #111; }
```

### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MasterAppDemo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `vite.config.ts`

* Alias `"todo-app"` → `path.resolve(__dirname, "../island/src")` so we import the local library’s source during dev/build.
* If you prefer using the GitHub package instead, remove the alias and add a dependency to `"todo-app"` in `package.json`.

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "todo-app": path.resolve(__dirname, "../island/src"),
    },
  },
  server: { port: 5173 },
});
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM"],
    "jsx": "react-jsx",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["react", "react-dom"]
  },
  "include": ["src"]
}
```

### `package.json`

```json
{
  "name": "MasterAppDemo",
  "private": true,
  "version": "0.1.0",
  "description": "Parent React+TS app hosting the todo-app component with Redux Toolkit and Axios.",
  "type": "module",
  "engines": { "node": ">=22" },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@reduxjs/toolkit": "^2.2.0",
    "axios": "^1.7.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-redux": "^9.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react-swc": "^3.0.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.0"
  }
}
```

### `.env.example`

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000
```

### `README.md`

Include:

* Overview of architecture (Redux slice + thunks, Axios client, ToDoApp container)
* How it discovers backend routes (inspects `backend/`, otherwise defaults as above)
* How to run:

  ```bash
  cd MasterAppDemo
  cp .env.example .env  # optionally adjust VITE_API_BASE_URL
  npm i
  npm run dev
  ```
* Note about Vite alias to `../island/src`; switch to GitHub-installed package by removing alias and adding dependency.

### `.gitignore`

```gitignore
node_modules
dist
.vite
.DS_Store
.env
```

---

## Acceptance criteria

* App boots with `npm run dev` and renders the `todo-app` component.
* On mount, tasks are **fetched** and displayed.
* Create/Toggle/Delete buttons in `todo-app` trigger Redux thunks that call Axios and update state **after** success.
* Callbacks passed to `todo-app` **return Promises** (use `dispatch(thunk).unwrap()`), enabling `todo-app`’s async spinners.
* If the `backend/` schema differs, the app still works via the `toTask` mapping and discovered endpoints.
* Build works with `npm run build`.
* Single React version (no duplication with `island/`).

---

## Output format

When you generate the project:

1. Print a concise **file tree** under `MasterAppDemo/`.
2. For each file, output the **complete file contents** inside fenced code blocks with the correct filenames as block titles.
3. Provide short **run instructions** at the end.

**Do not** include commentary outside these sections.
