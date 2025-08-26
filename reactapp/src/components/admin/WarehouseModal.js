import React, { useEffect, useState } from "react";

const defaults = { name: "", location: "" };

export default function WarehouseModal({ isOpen, title, initialValues, submitting, onClose, onSubmit }) {
  const [form, setForm] = useState(defaults);

  useEffect(() => {
    if (isOpen) {
      setForm({ ...defaults, ...(initialValues || {}) });
    }
  }, [isOpen, initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title || "Add Warehouse"}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Name *</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Location *</label>
            <input
              name="location"
              type="text"
              value={form.location}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="submit-btn" disabled={submitting}>{submitting ? "Saving..." : "Save"}</button>
            <button type="button" className="cancel-btn" onClick={onClose} disabled={submitting}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}


