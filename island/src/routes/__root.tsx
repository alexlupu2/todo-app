import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { ToDoAppProps } from "../types";

export const Route = createRootRouteWithContext<ToDoAppProps>()({
  // Redirect "/" to "/tasks"
  beforeLoad: ({ location }) => {
    if (location.pathname === "/") {
      throw redirect({ to: "/tasks" });
    }
  },
  component: () => <Outlet />,
});
