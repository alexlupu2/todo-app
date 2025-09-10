import React, { useEffect } from "react";
import ToDoApp from "todo-app"; // resolved via Vite alias to ../island/src
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchTasks, createTask, toggleTask, deleteTask, clearError } from "../features/tasks/tasksSlice";
import { logout } from "../features/auth/authSlice";
import ErrorBanner from "./ErrorBanner";

export default function HostToDo() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((s) => s.tasks.items);
  const error = useAppSelector((s) => s.tasks.error);
  const authUser = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const onCreateTask = (title: string) => dispatch(createTask(title)).unwrap();
  const onToggleTask = (id: string, completed: boolean) => dispatch(toggleTask({ id, completed })).unwrap();
  const onDeleteTask = (id: string) => dispatch(deleteTask(id)).unwrap();
  const handleLogout = () => dispatch(logout());

  return (
    <div style={{ maxWidth: 640, margin: "32px auto", padding: "0 16px" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 16 
      }}>
        <span style={{ fontSize: 14, color: "#6b7280" }}>
          Welcome back!
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: "6px 12px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: 12,
            cursor: "pointer",
            fontWeight: 500
          }}
        >
          Sign Out
        </button>
      </div>
      
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