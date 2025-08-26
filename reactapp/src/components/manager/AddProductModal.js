import React, { useEffect, useState } from "react";

const defaultProduct = { name: "", sku: "", category: "", unit: "", price: "" };

export default function AddProductModal({ isOpen, title, initialValues, submitting, onClose, onSubmit }) {
  const [form, setForm] = useState(defaultProduct);

  useEffect(() => {
    if (isOpen) {
      setForm({ ...defaultProduct, ...(initialValues || {}) });
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
          <h3>{title || "Add New Product"}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Product Name *</label>
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
            <label>SKU *</label>
            <input
              name="sku"
              type="text"
              value={form.sku}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <input
              name="category"
              type="text"
              value={form.category}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Unit *</label>
            <input
              name="unit"
              type="text"
              value={form.unit}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Price *</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={form.price}
              onChange={handleChange}
              required
            />
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


