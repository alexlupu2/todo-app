import React from "react";

export default function ErrorBanner({ message, onClose }: { message: string; onClose?: () => void }) {
  if (!message) return null;
  return (
    <div style={{
      background: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fecaca",
      padding: "8px 12px",
      borderRadius: 8,
      marginBottom: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ marginLeft: 12, border: "none", background: "transparent", cursor: "pointer" }}>
          ✕
        </button>
      )}
    </div>
  );
}