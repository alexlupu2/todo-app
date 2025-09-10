import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import ToDoApp from "todo-app";
import type { Task } from "todo-app";

const DemoApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Learn React", completed: true },
    { id: "2", title: "Build todo app", completed: false },
    { id: "3", title: "Write documentation", completed: false },
  ]);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const handleCreateTask = async (title: string) => {
    // Simulate async delay
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    const newTask: Task = {
      id: generateId(),
      title,
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    // Simulate async delay
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed } : task))
    );
  };

  const handleDeleteTask = async (id: string) => {
    // Simulate async delay
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: "48rem", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", marginBottom: "2rem", color: "#1f2937" }}>
          ToDoApp Demo
        </h1>
        <p style={{ textAlign: "center", marginBottom: "2rem", color: "#6b7280" }}>
          This demonstrates the ToDoApp component with simulated async delays.
        </p>
        
        <ToDoApp
          tasks={tasks}
          onCreateTask={handleCreateTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<DemoApp />);