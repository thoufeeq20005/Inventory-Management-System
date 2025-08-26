import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [stockInForm, setStockInForm] = useState({ productId: "", warehouseId: "", quantity: "" });
  const [stockOutForm, setStockOutForm] = useState({ productId: "", warehouseId: "", quantity: "" });
  // Unified Inventory Adjustment form (as per requirement)
  const [adjustForm, setAdjustForm] = useState({ type: "in", productId: "", warehouseId: "", quantity: "" });

  // Sorting & Pagination states
  const [inventorySort, setInventorySort] = useState({ field: "product", dir: "asc" });
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryPageSize] = useState(8);

  const [historySort, setHistorySort] = useState({ field: "time", dir: "desc" });
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize] = useState(8);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [invRes, prodRes, whRes, histRes] = await Promise.all([
        axios.get(`${API_BASE}/api/inventory`),
        axios.get(`${API_BASE}/api/products/dropdown`),
        axios.get(`${API_BASE}/api/warehouses/dropdown`),
        axios.get(`${API_BASE}/api/inventory/history`)
      ]);
      setInventory(invRes.data || []);
      setProducts(prodRes.data || []);
      setWarehouses(whRes.data || []);
      // sort history by timestamp desc
      const hist = (histRes.data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setHistory(hist);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  // Utilities
  const compareValues = (a, b) => {
    const av = a ?? "";
    const bv = b ?? "";
    const na = Number(av);
    const nb = Number(bv);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return av.toString().localeCompare(bv.toString(), undefined, { sensitivity: "base" });
  };

  // Derived: sorted + paginated inventory
  const sortedInventory = React.useMemo(() => {
    const map = {
      product: (i) => i.product?.name,
      warehouse: (i) => i.warehouse?.name,
      stock: (i) => i.stockLevel,
    };
    const getter = map[inventorySort.field] || map.product;
    const arr = [...inventory].sort((a, b) => {
      const cmp = compareValues(getter(a), getter(b));
      return inventorySort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [inventory, inventorySort]);

  const totalInventoryPages = Math.max(1, Math.ceil(sortedInventory.length / inventoryPageSize));
  const pagedInventory = React.useMemo(() => {
    const start = (inventoryPage - 1) * inventoryPageSize;
    return sortedInventory.slice(start, start + inventoryPageSize);
  }, [sortedInventory, inventoryPage, inventoryPageSize]);

  // Derived: sorted + paginated history
  const sortedHistory = React.useMemo(() => {
    const map = {
      time: (h) => (h.timestamp ? new Date(h.timestamp).getTime() : 0),
      type: (h) => h.adjustmentType,
      product: (h) => h.product?.name,
      warehouse: (h) => h.warehouse?.name,
      quantity: (h) => h.adjustmentQuantity,
      performedBy: (h) => h.performedByEmail || "",
    };
    const getter = map[historySort.field] || map.time;
    const arr = [...history].sort((a, b) => {
      const cmp = compareValues(getter(a), getter(b));
      return historySort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [history, historySort]);

  const totalHistoryPages = Math.max(1, Math.ceil(sortedHistory.length / historyPageSize));
  const pagedHistory = React.useMemo(() => {
    const start = (historyPage - 1) * historyPageSize;
    return sortedHistory.slice(start, start + historyPageSize);
  }, [sortedHistory, historyPage, historyPageSize]);

  const handleInputChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdjustChange = (e) => {
    const { name, value } = e.target;
    setAdjustForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = ({ productId, warehouseId, quantity }) => {
    if (!productId || !warehouseId) return "Please select product and warehouse.";
    const qty = Number(quantity);
    if (!qty || qty <= 0) return "Quantity must be a positive number.";
    return "";
  };

  const submitStock = async (type) => {
    setError("");
    setSuccess("");
    setSubmitting(true);
    const form = type === "in" ? stockInForm : stockOutForm;
    const validationMsg = validateForm(form);
    if (validationMsg) {
      setSubmitting(false);
      setError(validationMsg);
      return;
    }

    const payload = {
      productId: Number(form.productId),
      warehouseId: Number(form.warehouseId),
      quantity: Number(form.quantity),
      performedByEmail: user?.email || ""
    };

    try {
      const endpoint = type === "in" ? `${API_BASE}/api/inventory/stock-in` : `${API_BASE}/api/inventory/stock-out`;
      const res = await axios.post(endpoint, payload);

      if (res.status === 200) {
        // success: refresh inventory and history
        await Promise.all([loadInventoryOnly(), loadHistoryOnly()]);

        // reset form
        if (type === "in") setStockInForm({ productId: "", warehouseId: "", quantity: "" });
        else setStockOutForm({ productId: "", warehouseId: "", quantity: "" });

        setSuccess(type === "in" ? "Stock-In recorded successfully!" : "Stock-Out recorded successfully!");
      }
    } catch (err) {
      console.error("Stock submit error:", err);
      let errorMessage = "Action failed. Please try again.";
      
      if (err.response) {
        if (err.response.status === 409) {
          errorMessage = err.response.data || "Insufficient stock available.";
        } else if (err.response.status === 400) {
          errorMessage = err.response.data || "Invalid request data.";
        } else if (err.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit for the unified adjustment form
  const submitAdjust = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    const validationMsg = validateForm(adjustForm);
    if (validationMsg) {
      setSubmitting(false);
      setError(validationMsg);
      return;
    }
    const payload = {
      productId: Number(adjustForm.productId),
      warehouseId: Number(adjustForm.warehouseId),
      quantity: Number(adjustForm.quantity),
      performedByEmail: user?.email || ""
    };
    const type = adjustForm.type === "out" ? "out" : "in";
    try {
      const endpoint = type === "in" ? `${API_BASE}/api/inventory/stock-in` : `${API_BASE}/api/inventory/stock-out`;
      const res = await axios.post(endpoint, payload);
      if (res.status === 200) {
        await Promise.all([loadInventoryOnly(), loadHistoryOnly()]);
        setAdjustForm(prev => ({ ...prev, productId: "", warehouseId: "", quantity: "" }));
        setSuccess(type === "in" ? "Stock-In recorded successfully!" : "Stock-Out recorded successfully!");
      }
    } catch (err) {
      console.error("Stock submit error:", err);
      let errorMessage = "Action failed. Please try again.";
      if (err.response) {
        if (err.response.status === 409) errorMessage = err.response.data || "Insufficient stock available.";
        else if (err.response.status === 400) errorMessage = err.response.data || "Invalid request data.";
        else if (err.response.status === 500) errorMessage = "Server error. Please try again later.";
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const loadInventoryOnly = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/inventory`);
      setInventory(res.data || []);
    } catch (e) {
      // keep silent on partial refresh errors
    }
  };

  const loadHistoryOnly = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/inventory/history`);
      const hist = (res.data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setHistory(hist);
    } catch (e) {}
  };

  const Card = ({ title, children }) => (
    <div className="card" style={{
      background: "rgba(255, 255, 255, 0.08)",
      backdropFilter: "blur(8px)",
      borderRadius: 14,
      padding: 20,
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      marginBottom: 24,
      border: "1px solid rgba(255,255,255,0.08)"
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div className="dashboard employee-dashboard">
      <div className="dashboard-header">Welcome, {user?.name}</div>

      <div
        className="profile-icon"
        onClick={() => navigate("/employee/profile")}
        style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}
      >
        <span role="img" aria-label="profile" style={{ fontSize: 20 }}>👤</span>
        <span>Profile</span>
      </div>

      {(error || success) && (
        <div style={{
          padding: "10px 14px",
          borderRadius: 8,
          marginBottom: 16,
          background: error ? "#ffecec" : "#ecffef",
          color: error ? "#c62828" : "#1b5e20",
          border: `1px solid ${error ? "#ffcdd2" : "#c8e6c9"}`
        }}>
          {error || success}
        </div>
      )}

      <Card title="Current Inventory Levels">
        {loading ? (
          <p>Loading inventory...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => setInventorySort(s => ({ field: "product", dir: s.field === "product" && s.dir === "asc" ? "desc" : "asc" }))}>Product <span className={`sort-icon ${inventorySort.field === "product" ? inventorySort.dir : ""}`}>A-Z</span></th>
                <th className="sortable" onClick={() => setInventorySort(s => ({ field: "warehouse", dir: s.field === "warehouse" && s.dir === "asc" ? "desc" : "asc" }))}>Warehouse <span className={`sort-icon ${inventorySort.field === "warehouse" ? inventorySort.dir : ""}`}>A-Z</span></th>
                <th className="sortable" onClick={() => setInventorySort(s => ({ field: "stock", dir: s.field === "stock" && s.dir === "asc" ? "desc" : "asc" }))} style={{ textAlign: 'left' }}>Stock Level <span className={`sort-icon ${inventorySort.field === "stock" ? inventorySort.dir : ""}`}>A-Z</span></th>
              </tr>
            </thead>
            <tbody>
              {pagedInventory.length > 0 ? (
                pagedInventory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product?.name}</td>
                    <td>{item.warehouse?.name}</td>
                    <td>{item.stockLevel}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: 16 }}>No inventory data available</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        <div className="pagination">
          <button disabled={inventoryPage === 1} onClick={() => setInventoryPage(p => Math.max(1, p - 1))}>Prev</button>
          <span className="page-indicator">{inventoryPage} / {totalInventoryPages}</span>
          <button disabled={inventoryPage === totalInventoryPages} onClick={() => setInventoryPage(p => Math.min(totalInventoryPages, p + 1))}>Next</button>
        </div>
      </Card>

      <Card title="🧾 Inventory Adjustment">
        <form onSubmit={submitAdjust}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: 'rgba(255,255,255,0.85)' }}>Product</label>
              <select
                name="productId"
                value={adjustForm.productId}
                onChange={handleAdjustChange}
                disabled={submitting}
                className="input-modern"
              >
                <option value="">Select product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: 'rgba(255,255,255,0.85)' }}>Warehouse</label>
              <select
                name="warehouseId"
                value={adjustForm.warehouseId}
                onChange={handleAdjustChange}
                disabled={submitting}
                className="input-modern"
              >
                <option value="">Select warehouse</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
            <div className="radio-group">
              <span className="radio-label">Type</span>
              <label className={`chip ${adjustForm.type === 'in' ? 'active' : ''}`}>
                <input type="radio" name="type" value="in" checked={adjustForm.type === "in"} onChange={handleAdjustChange} /> Stock-In
              </label>
              <label className={`chip ${adjustForm.type === 'out' ? 'active' : ''}`}>
                <input type="radio" name="type" value="out" checked={adjustForm.type === "out"} onChange={handleAdjustChange} /> Stock-Out
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, color: 'rgba(255,255,255,0.85)' }}>Quantity</label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={adjustForm.quantity}
                onChange={handleAdjustChange}
                disabled={submitting}
                className="input-modern"
                inputMode="numeric"
                pattern="[0-9]*"
                onWheel={(e) => { e.preventDefault(); e.currentTarget.blur(); }}
                onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); } }}
              />
            </div>
          </div>

          <button className={adjustForm.type === "in" ? "stock-btn stock-in" : "stock-btn stock-out"} type="submit" disabled={submitting}>
            {submitting ? "Saving..." : (adjustForm.type === "in" ? "Record Stock-In" : "Record Stock-Out")}
          </button>
        </form>
      </Card>

      <Card title="📚 Stock History">
        {history.length === 0 ? (
          <p>No stock movements yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => setHistorySort(s => ({ field: 'time', dir: s.field === 'time' && s.dir === 'asc' ? 'desc' : 'asc' }))}>Time <span className={`sort-icon ${historySort.field === 'time' ? historySort.dir : ''}`}>A-Z</span></th>
                <th className="sortable" onClick={() => setHistorySort(s => ({ field: 'type', dir: s.field === 'type' && s.dir === 'asc' ? 'desc' : 'asc' }))}>Type <span className={`sort-icon ${historySort.field === 'type' ? historySort.dir : ''}`}>A-Z</span></th>
                <th className="sortable" onClick={() => setHistorySort(s => ({ field: 'product', dir: s.field === 'product' && s.dir === 'asc' ? 'desc' : 'asc' }))}>Product <span className={`sort-icon ${historySort.field === 'product' ? historySort.dir : ''}`}>A-Z</span></th>
                <th className="sortable" onClick={() => setHistorySort(s => ({ field: 'warehouse', dir: s.field === 'warehouse' && s.dir === 'asc' ? 'desc' : 'asc' }))}>Warehouse <span className={`sort-icon ${historySort.field === 'warehouse' ? historySort.dir : ''}`}>A-Z</span></th>
                <th className="sortable" onClick={() => setHistorySort(s => ({ field: 'quantity', dir: s.field === 'quantity' && s.dir === 'asc' ? 'desc' : 'asc' }))}>Quantity <span className={`sort-icon ${historySort.field === 'quantity' ? historySort.dir : ''}`}>A-Z</span></th>
                <th className="sortable" onClick={() => setHistorySort(s => ({ field: 'performedBy', dir: s.field === 'performedBy' && s.dir === 'asc' ? 'desc' : 'asc' }))}>Performed By <span className={`sort-icon ${historySort.field === 'performedBy' ? historySort.dir : ''}`}>A-Z</span></th>
              </tr>
            </thead>
            <tbody>
              {pagedHistory.map(h => (
                <tr key={h.id}>
                  <td>{h.timestamp ? format(new Date(h.timestamp), 'yyyy-MM-dd HH:mm') : '-'}</td>
                  <td>{h.adjustmentType}</td>
                  <td>{h.product?.name}</td>
                  <td>{h.warehouse?.name}</td>
                  <td>{h.adjustmentQuantity}</td>
                  <td>{h.performedByEmail || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="pagination">
          <button disabled={historyPage === 1} onClick={() => setHistoryPage(p => Math.max(1, p - 1))}>Prev</button>
          <span className="page-indicator">{historyPage} / {totalHistoryPages}</span>
          <button disabled={historyPage === totalHistoryPages} onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}>Next</button>
        </div>
      </Card>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
