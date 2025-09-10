import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { login, clearError } from "../features/auth/authSlice";
import ErrorBanner from "./ErrorBanner";
import { useNavigate } from "@tanstack/react-router";

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/home/#/tasks" });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length > 4 && password.length > 4) {
      dispatch(login({ name, password }));
    }
  };

  const isValid = name.length > 4 && password.length > 4;

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "80px auto",
        padding: 24,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        background: "#fff",
      }}
    >
      <h2 style={{ marginTop: 0, textAlign: "center", color: "#374151" }}>
        Sign In
      </h2>

      {error && (
        <ErrorBanner message={error} onClose={() => dispatch(clearError())} />
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              color: "#374151",
              fontSize: 14,
            }}
          >
            Username (min 5 chars)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
              boxSizing: "border-box",
            }}
            placeholder="Enter username"
            disabled={isLoading}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              color: "#374151",
              fontSize: 14,
            }}
          >
            Password (min 5 chars)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
              boxSizing: "border-box",
            }}
            placeholder="Enter password"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={!isValid || isLoading}
          style={{
            width: "100%",
            padding: "10px 16px",
            background: isValid && !isLoading ? "#3b82f6" : "#9ca3af",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: 14,
            cursor: isValid && !isLoading ? "pointer" : "not-allowed",
            fontWeight: 500,
          }}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p
        style={{
          marginTop: 16,
          fontSize: 12,
          color: "#6b7280",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        Use any username and password with more than 4 characters
      </p>
    </div>
  );
}
