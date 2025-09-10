import React, { useState } from "react";
import type { ToDoAppProps } from "./types";
import styles from "./ToDoApp.module.css";

const ToDoApp: React.FC<ToDoAppProps> = ({
  tasks,
  onCreateTask,
  onToggleTask,
  onDeleteTask,
  className,
  style,
  disabled = false,
  autoFocus = true,
  placeholder = "Add a task…",
  addButtonLabel = "Add",
  emptyStateLabel = "Nothing to do yet",
}) => {
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [toggling, setToggling] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  const handleCreateTask = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || disabled || creating) return;

    setCreating(true);
    try {
      const result = onCreateTask(trimmedTitle);
      if (result instanceof Promise) {
        await result;
      }
      setTitle("");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    if (disabled || toggling.has(id)) return;

    setToggling((prev) => new Set([...prev, id]));
    try {
      const result = onToggleTask(id, completed);
      if (result instanceof Promise) {
        await result;
      }
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (disabled || deleting.has(id)) return;

    setDeleting((prev) => new Set([...prev, id]));
    try {
      const result = onDeleteTask(id);
      if (result instanceof Promise) {
        await result;
      }
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateTask();
    }
  };

  const rootClassName = className ? `${styles.root} ${className}` : styles.root;

  return (
    <div className={rootClassName} style={style}>
      <h2 className={styles.header}>To-Do</h2>
      
      <div className={styles.inputRow}>
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || creating}
          autoFocus={autoFocus}
        />
        <button
          type="button"
          className={styles.addButton}
          onClick={handleCreateTask}
          disabled={disabled || creating || !title.trim()}
        >
          {addButtonLabel}
          {creating && <div className={styles.spinner} />}
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className={styles.emptyState}>{emptyStateLabel}</div>
      ) : (
        <ul className={styles.list}>
          {tasks.map((task) => {
            const isToggling = toggling.has(task.id);
            const isDeleting = deleting.has(task.id);
            const itemClassName = task.completed 
              ? `${styles.listItem} ${styles.completed}` 
              : styles.listItem;
            const titleClassName = task.completed
              ? `${styles.taskTitle} ${styles.completed}`
              : styles.taskTitle;

            return (
              <li key={task.id} className={itemClassName}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={task.completed}
                  onChange={(e) => handleToggleTask(task.id, e.target.checked)}
                  disabled={disabled || isToggling}
                />
                {isToggling && <div className={styles.spinner} />}
                
                <span className={titleClassName}>{task.title}</span>
                
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => handleDeleteTask(task.id)}
                  disabled={disabled || isDeleting}
                >
                  Delete
                  {isDeleting && <div className={styles.spinner} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ToDoApp;