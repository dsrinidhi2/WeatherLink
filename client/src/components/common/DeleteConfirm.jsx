import React from "react";
import "./DeleteConfirm.css";

export default function DeleteConfirm({ open, city, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="delete-overlay">
      <div className="delete-box">
        <h3>Delete "{city}"?</h3>
        <p>This action cannot be undone.</p>

        <div className="delete-buttons">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-delete" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
