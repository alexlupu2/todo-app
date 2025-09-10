import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Task } from "../types";
import { createTasksApi } from "../api/tasks";

type TasksState = {
  items: Task[];
  loading: boolean;
  creating: boolean;
  togglingById: Record<string, boolean>;
  deletingById: Record<string, boolean>;
  error: string | null;
  authToken: string | null;
  apiBaseUrl: string;
};

const initialState: TasksState = {
  items: [],
  loading: false,
  creating: false,
  togglingById: {},
  deletingById: {},
  error: null,
  authToken: null,
  apiBaseUrl: "http://localhost:3000",
};

export const setAuth = createAsyncThunk(
  "tasks/setAuth",
  async ({ token, apiBaseUrl }: { token: string; apiBaseUrl?: string }) => {
    return { token, apiBaseUrl: apiBaseUrl || "http://localhost:3000" };
  }
);

export const fetchTasks = createAsyncThunk(
  "tasks/fetchAll", 
  async (_, { getState }) => {
    const state = getState() as { tasks: TasksState };
    if (!state.tasks.authToken) {
      throw new Error("No auth token available");
    }
    const api = createTasksApi(state.tasks.authToken, state.tasks.apiBaseUrl);
    return await api.fetchTasks();
  }
);

export const createTask = createAsyncThunk(
  "tasks/create", 
  async (title: string, { getState }) => {
    const state = getState() as { tasks: TasksState };
    if (!state.tasks.authToken) {
      throw new Error("No auth token available");
    }
    const api = createTasksApi(state.tasks.authToken, state.tasks.apiBaseUrl);
    return await api.createTask(title);
  }
);

export const toggleTask = createAsyncThunk(
  "tasks/toggle",
  async ({ id, completed }: { id: string; completed: boolean }, { getState }) => {
    const state = getState() as { tasks: TasksState };
    if (!state.tasks.authToken) {
      throw new Error("No auth token available");
    }
    const api = createTasksApi(state.tasks.authToken, state.tasks.apiBaseUrl);
    return await api.toggleTask(id, completed);
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/delete", 
  async (id: string, { getState }) => {
    const state = getState() as { tasks: TasksState };
    if (!state.tasks.authToken) {
      throw new Error("No auth token available");
    }
    const api = createTasksApi(state.tasks.authToken, state.tasks.apiBaseUrl);
    return await api.deleteTask(id);
  }
);

const slice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearTasks(state) {
      state.items = [];
      state.authToken = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // setAuth
      .addCase(setAuth.fulfilled, (state, action) => {
        state.authToken = action.payload.token;
        state.apiBaseUrl = action.payload.apiBaseUrl;
      })

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

export const { clearError, clearTasks } = slice.actions;
export default slice.reducer;