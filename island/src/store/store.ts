import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "./tasksSlice";

export const createToDoStore = () => {
  return configureStore({
    reducer: {
      tasks: tasksReducer,
    },
    devTools: true,
  });
};

export type ToDoStore = ReturnType<typeof createToDoStore>;
export type ToDoRootState = ReturnType<ToDoStore["getState"]>;
export type ToDoAppDispatch = ToDoStore["dispatch"];