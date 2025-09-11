import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { createToDoStore } from "./store/store";
import { useToDoDispatch, useToDoSelector } from "./store/hooks";
import {
  fetchTasks,
  createTask,
  toggleTask,
  deleteTask,
  clearError,
} from "./store/tasksSlice";
import ToDoApp from "./ToDoApp";
import type { ConnectedToDoAppProps } from "./types";
import { setHttpClient } from "./api/tasks";

// Create a store instance
const store = createToDoStore();

const ConnectedToDoAppInner = (props: ConnectedToDoAppProps) => {
  const { httpClient, onError } = props;

  const dispatch = useToDoDispatch();
  const tasks = useToDoSelector((s) => s.tasks.items);
  const error = useToDoSelector((s) => s.tasks.error);

  // Initialize HTTP client once
  useEffect(() => {
    setHttpClient(httpClient);
    dispatch(fetchTasks());
  }, [dispatch, httpClient]);

  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error);
      dispatch(clearError());
    }
  }, [error, onError, dispatch]);

  const onCreateTask = async (title: string) => {
    await dispatch(createTask(title)).unwrap();
  };
  const onToggleTask = async (id: string, completed: boolean) => {
    await dispatch(toggleTask({ id, completed })).unwrap();
  };
  const onDeleteTask = async (id: string) => {
    await dispatch(deleteTask(id)).unwrap();
  };

  return (
    <ToDoApp
      tasks={tasks}
      onCreateTask={onCreateTask}
      onToggleTask={onToggleTask}
      onDeleteTask={onDeleteTask}
    />
  );
};

const ConnectedToDoApp: React.FC<ConnectedToDoAppProps> = (props) => {
  return (
    <Provider store={store}>
      <ConnectedToDoAppInner {...props} />
    </Provider>
  );
};

export default ConnectedToDoApp;
