import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { createToDoStore } from "./store/store";
import { useToDoDispatch, useToDoSelector } from "./store/hooks";
import {
  setAuth,
  fetchTasks,
  createTask,
  toggleTask,
  deleteTask,
  clearError,
} from "./store/tasksSlice";
import ToDoApp from "./ToDoApp";
import type { ConnectedToDoAppProps } from "./types";

// Create a store instance
const store = createToDoStore();

// : React.FC<Omit<ConnectedToDoAppProps, "authInfo"> & { token: string; apiBaseUrl: string }>

const ConnectedToDoAppInner = (props: ConnectedToDoAppProps) => {
  const { token, onError } = props;
  const apiBaseUrl = "http://localhost:3000";

  const dispatch = useToDoDispatch();
  const tasks = useToDoSelector((s) => s.tasks.items);
  const error = useToDoSelector((s) => s.tasks.error);
  const currentToken = useToDoSelector((s) => s.tasks.authToken);

  // Set auth info when component mounts or token changes
  useEffect(() => {
    if (token && token !== currentToken) {
      dispatch(setAuth({ token: token, apiBaseUrl }));
    }
  }, [dispatch, token, apiBaseUrl, currentToken]);

  // Fetch tasks when auth is set
  useEffect(() => {
    if (currentToken === token && token) {
      dispatch(fetchTasks());
    }
  }, [dispatch, currentToken, token]);

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

const ConnectedToDoApp: React.FC<ConnectedToDoAppProps> = ({
  token,
  ...props
}) => {
  return (
    <Provider store={store}>
      <ConnectedToDoAppInner token={token} {...props} />
    </Provider>
  );
};

export default ConnectedToDoApp;
