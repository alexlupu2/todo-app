import { createFileRoute } from "@tanstack/react-router";
// importăm root-ul ca să-i folosim hook-ul de context
import { Route as RootRoute } from "../__root";
import { ToDoList } from "../../components/ToDoList/ToDoList";
import { ToDoAppProps } from "../../types";

export const Route = createFileRoute("/tasks/")({
  component: ToDoListPage,
});

function ToDoListPage() {
  const props = RootRoute.useRouteContext();
  return <ToDoList {...props} />;
}
