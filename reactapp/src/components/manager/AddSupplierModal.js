import React, { useEffect, useState } from "react";

const defaultSupplier = { name: "", contactPerson: "", email: "", phone: "", address: "", paymentTerms: "" };

export default function AddSupplierModal({ isOpen, title, initialValues, submitting, onClose, onSubmit }) {
  const [form, setForm] = useState(defaultSupplier);

  useEffect(() => {
    if (isOpen) {
      setForm({ ...defaultSupplier, ...(initialValues || {}) });
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
          <h3>{title || "Add New Supplier"}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Supplier Name *</label>
            <input name="name" type="text" value={form.name} onChange={handleChange} required autoComplete="off" />
          </div>
          <div className="form-group">
            <label>Contact Person *</label>
            <input name="contactPerson" type="text" value={form.contactPerson} onChange={handleChange} required autoComplete="off" />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="off" />
          </div>
          <div className="form-group">
            <label>Phone *</label>
            <input name="phone" type="text" value={form.phone} onChange={handleChange} required autoComplete="off" />
          </div>
          <div className="form-group">
            <label>Address *</label>
            <textarea name="address" value={form.address} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Payment Terms *</label>
            <input name="paymentTerms" type="text" value={form.paymentTerms} onChange={handleChange} required autoComplete="off" />
          </div>
          <div className="modal-actions">
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Processing..." : "Save"}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


