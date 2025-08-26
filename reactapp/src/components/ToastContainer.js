import React from "react";
import { useToast } from "../context/ToastContext";

export default function ToastContainer() {
  const { toasts, remove } = useToast();
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => remove(t.id)}>
          <span>{t.message}</span>
          <button aria-label="Dismiss" className="toast-close" onClick={() => remove(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}


