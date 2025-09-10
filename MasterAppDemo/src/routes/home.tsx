import React from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import HostToDo from "../components/HostToDo";

export const Route = createFileRoute("/home")({
  beforeLoad: ({ context }) => {
    const isAuthenticated = context.store.getState().auth.isAuthenticated;
    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: HostToDo,
});
