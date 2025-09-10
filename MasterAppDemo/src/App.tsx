import React from "react";
import { useAppSelector } from "./app/hooks";
import HostToDo from "./components/HostToDo";
import LoginForm from "./components/LoginForm";

export default function App() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  return isAuthenticated ? <HostToDo /> : <LoginForm />;
}