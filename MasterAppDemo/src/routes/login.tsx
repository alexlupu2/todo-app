import React from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import LoginForm from "../components/LoginForm";

export const Route = createFileRoute("/login")({
  component: LoginForm,
});
