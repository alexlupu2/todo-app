import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from "@tanstack/react-router";
export interface RouterContext {
  store: typeof import("../app/store").store;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});
