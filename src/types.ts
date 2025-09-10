export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export type ToDoAppProps = {
  tasks: Task[];

  onCreateTask: (title: string) => void | Promise<void>;
  onToggleTask: (id: string, completed: boolean) => void | Promise<void>;
  onDeleteTask: (id: string) => void | Promise<void>;

  className?: string;
  style?: React.CSSProperties;

  /** Force-disable all controls (consumer-controlled) */
  disabled?: boolean;

  /** Autofocus the input on mount; default: true */
  autoFocus?: boolean;

  /** Fixed English labels, with minimal optional overrides */
  placeholder?: string;        // default: "Add a task…"
  addButtonLabel?: string;     // default: "Add"
  emptyStateLabel?: string;    // default: "Nothing to do yet"
};