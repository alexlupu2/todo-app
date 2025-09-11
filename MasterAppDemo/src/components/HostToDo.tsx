import React, { useState } from "react";
import  ConnectedToDoApp  from "todo-app";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/authSlice";
import ErrorBanner from "./ErrorBanner";

const API_BASE_URL = "http://localhost:3000";

export default function HostToDo() {
  const dispatch = useAppDispatch();
  const authToken = useAppSelector((s) => s.auth.token);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => dispatch(logout());
  const handleError = (err: string) => setError(err);
  const clearError = () => setError(null);

  if (!authToken) {
    return null; // This shouldn't happen since we're only rendered when authenticated
  }

  return (
    <div style={{ maxWidth: 640, margin: "32px auto", padding: "0 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 14, color: "#6b7280" }}>Welcome back!</span>
        <button
          onClick={handleLogout}
          style={{
            padding: "6px 12px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: 12,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Sign Out
        </button>
      </div>

      {error && <ErrorBanner message={error} onClose={clearError} />}
      <ConnectedToDoApp
        token={authToken}
        onError={handleError}
        autoFocus
      />
    </div>
  );
}
