import axios from "axios";
import type { Task } from "../types";

export const createTasksApi = (authToken: string, baseURL: string = "http://localhost:3000") => {
  const api = axios.create({
    baseURL,
    headers: { 
      "Content-Type": "application/json", 
      Accept: "application/json",
      Authorization: `Bearer ${authToken}`
    },
    withCredentials: false,
  });

  const toTask = (x: any): Task => ({
    id: String(x?.id ?? x?._id ?? x?.uuid),
    title: String(x?.title ?? x?.name ?? x?.text ?? ""),
    completed: Boolean(x?.completed ?? x?.done ?? x?.isDone ?? false),
  });

  return {
    async fetchTasks(): Promise<Task[]> {
      const res = await api.get("/tasks");
      const data = Array.isArray(res.data) ? res.data : res.data?.tasks ?? [];
      return data.map(toTask);
    },

    async createTask(title: string): Promise<Task> {
      const res = await api.post("/tasks", { title });
      return toTask(res.data);
    },

    async toggleTask(id: string, completed: boolean): Promise<Task> {
      const res = await api.patch(`/tasks/${id}`, { completed });
      return toTask(res.data);
    },

    async deleteTask(id: string): Promise<string> {
      await api.delete(`/tasks/${id}`);
      return id;
    }
  };
};