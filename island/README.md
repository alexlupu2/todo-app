# todo-app

A UI-only React component library providing a complete todo list interface. The `ToDoApp` component renders tasks and emits user interactions via callbacks, with all business logic managed externally.

## Installation

Install directly from GitHub:

```bash
npm i github:alexlupu2/todo-app#v1.0.0
```

## Usage

```tsx
import React, { useState } from "react";
import ToDoApp from "todo-app";
import type { Task } from "todo-app";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleCreateTask = async (title: string) => {
    // Your business logic here
    const newTask = { id: generateId(), title, completed: false };
    setTasks(prev => [...prev, newTask]);
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    // Your business logic here
    setTasks(prev => 
      prev.map(task => task.id === id ? { ...task, completed } : task)
    );
  };

  const handleDeleteTask = async (id: string) => {
    // Your business logic here
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  return (
    <ToDoApp
      tasks={tasks}
      onCreateTask={handleCreateTask}
      onToggleTask={handleToggleTask}
      onDeleteTask={handleDeleteTask}
    />
  );
}
```

## External State Pattern

The `ToDoApp` component is **UI-only** and owns no task state. All task data must be provided via the `tasks` prop, and all mutations happen through callback props. This design ensures:

- **Separation of concerns**: UI rendering vs. business logic
- **Flexibility**: Use any state management solution (useState, Redux, Zustand, etc.)
- **Testability**: Mock callbacks easily for testing
- **Predictability**: No hidden internal state to debug

## Async UX

When callbacks return a `Promise`, the component automatically:

- Disables relevant controls during the operation
- Shows inline spinners next to affected elements
- Re-enables controls when the promise resolves or rejects
- Does not display error messages (host app's responsibility)

This provides smooth UX feedback for async operations like API calls.

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tasks` | `Task[]` | - | **Required.** Array of tasks to display |
| `onCreateTask` | `(title: string) => void \| Promise<void>` | - | **Required.** Called when user creates a task |
| `onToggleTask` | `(id: string, completed: boolean) => void \| Promise<void>` | - | **Required.** Called when user toggles task completion |
| `onDeleteTask` | `(id: string) => void \| Promise<void>` | - | **Required.** Called when user deletes a task |
| `className` | `string` | - | Additional CSS class for root element |
| `style` | `React.CSSProperties` | - | Inline styles for root element |
| `disabled` | `boolean` | `false` | Force-disable all controls |
| `autoFocus` | `boolean` | `true` | Autofocus the input on mount |
| `placeholder` | `string` | `"Add a task…"` | Input placeholder text |
| `addButtonLabel` | `string` | `"Add"` | Text for the add button |
| `emptyStateLabel` | `string` | `"Nothing to do yet"` | Text shown when no tasks exist |

## Task Type

```ts
type Task = {
  id: string;        // Unique identifier
  title: string;     // Display text
  completed: boolean; // Completion status
};
```

## Features

- ✅ Create tasks (Enter key or Add button)
- ✅ Toggle task completion with checkboxes
- ✅ Delete individual tasks
- ✅ Async operation feedback with spinners
- ✅ Empty state display
- ✅ Minimal, clean styling with CSS Modules
- ✅ TypeScript support with full type definitions
- ✅ Accessible HTML semantics

## Development

```bash
# Install dependencies
npm install

# Start demo app
npm run dev

# Build library
npm run build

# Type check
npm run typecheck

# Preview built demo
npm run preview
```

The `dev/` directory contains a demo application showcasing the component with simulated async delays. This demo is not included in the published package.

## License

MIT © Alex Lupu