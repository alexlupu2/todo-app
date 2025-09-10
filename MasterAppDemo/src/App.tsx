import React from "react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { store } from "./app/store";

const router = createRouter({
  routeTree,
  context: { store },
});

export default function App() {
  return <RouterProvider router={router} />;
}
