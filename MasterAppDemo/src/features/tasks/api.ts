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