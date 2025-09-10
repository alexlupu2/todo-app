import React, { useMemo } from "react";
import type { ToDoAppProps } from "./types";
import { ToDoList } from "./components/ToDoList/ToDoList";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createHashHistory } from "@tanstack/history";
import { routeTree } from "./routeTree.gen";

export type RouterContext = {
  auth: {
    token: string | undefined;
    getRole(): string;
  };
};

const ToDoApp = (props: ToDoAppProps) => {
  const router = useMemo(
    () =>
      createRouter({
        routeTree,
        context: { ...props },
        history: createHashHistory(),
      }),
    [props]
  );

  return <RouterProvider router={router} />;
};
export default ToDoApp;
