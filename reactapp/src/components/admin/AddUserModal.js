import React, { useEffect, useState } from "react";

const defaultUser = { name: "", email: "", phoneNumber: "", role: "MANAGER", passwordHash: "" };

export default function AddUserModal({ isOpen, title, initialValues, submitting, onClose, onSubmit }) {
  const [form, setForm] = useState(defaultUser);

  useEffect(() => {
    if (isOpen) {
      setForm({ ...defaultUser, ...(initialValues || {}) });
    }
  }, [isOpen, initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
          <h3>{title || "Add User"}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Name *</label>
            <input name="name" type="text" value={form.name} onChange={handleChange} required autoComplete="off" />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="off" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phoneNumber" type="text" value={form.phoneNumber} onChange={handleChange} autoComplete="off" />
          </div>
          <div className="form-group">
            <label>Role *</label>
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input name="passwordHash" type="password" value={form.passwordHash} onChange={handleChange} required />
          </div>
          <div className="modal-actions">
            <button type="submit" className="submit-btn" disabled={submitting}>{submitting ? "Processing..." : "Save"}</button>
            <button type="button" className="cancel-btn" onClick={onClose} disabled={submitting}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}


