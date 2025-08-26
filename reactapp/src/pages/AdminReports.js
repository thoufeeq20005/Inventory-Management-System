import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
//

export default function AdminReports() {
  const { user } = useAuth();
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
  //

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [users, setUsers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [p, w, s, u, inv, h] = await Promise.all([
          axios.get(`${API_BASE}/api/products`),
          axios.get(`${API_BASE}/api/warehouses`),
          axios.get(`${API_BASE}/api/suppliers`),
          axios.get(`${API_BASE}/api/users`),
          axios.get(`${API_BASE}/api/inventory`),
          axios.get(`${API_BASE}/api/inventory/history`),
        ]);
        setProducts(p.data || []);
        setWarehouses(w.data || []);
        setSuppliers(s.data || []);
        setUsers(u.data || []);
        setInventory(inv.data || []);
        setHistory((h.data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } catch (e) {
        setError("Failed to load report data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API_BASE]);

  const totalStock = useMemo(() => inventory.reduce((sum, i) => sum + (i.stockLevel || 0), 0), [inventory]);
  const totalStockValue = useMemo(() => inventory.reduce((sum, i) => sum + (Number(i.stockLevel || 0) * Number(i.product?.price || 0)), 0), [inventory]);

  const exportCSV = (headers, rows, filename) => {
    const csv = [headers, ...rows]
      .map(r => r.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportProducts = () => {
    const headers = ["Name","SKU","Category","Unit","Price"]; 
    const rows = products.map(p => [p.name, p.sku, p.category, p.unit, p.price]);
    exportCSV(headers, rows, "products");
  };

  const exportWarehouses = () => {
    exportCSV(["Name","Location"], warehouses.map(w => [w.name, w.location]), "warehouses");
  };

  const exportSuppliers = () => {
    exportCSV(["Name","Contact","Email","Phone","Payment Terms"], suppliers.map(s => [s.name, s.contactPerson, s.email, s.phone, s.paymentTerms]), "suppliers");
  };

  const exportUsers = () => {
    exportCSV(["Name","Email","Role","Phone"], users.map(u => [u.name, u.email, u.role, u.phoneNumber || "-"]), "users");
  };

  const exportInventory = () => {
    exportCSV(["Product","Warehouse","Stock Level","Unit Price","Total Value"], inventory.map(i => [i.product?.name || "", i.warehouse?.name || "", i.stockLevel ?? 0, i.product?.price ?? 0, (Number(i.stockLevel || 0) * Number(i.product?.price || 0))]), "inventory");
  };

  const exportHistory = () => {
    exportCSV(["Time","Type","Product","Warehouse","Quantity","Performed By"], history.map(h => [h.timestamp, h.adjustmentType, h.product?.name, h.warehouse?.name, h.adjustmentQuantity, h.performedByEmail || "-"]), "stock_history");
  };

  if (loading) {
    return (
      <div className="dashboard admin-dashboard">
        <div className="loading-spinner">Loading reports…</div>
      </div>
    );
  }

  return (
    <div className="dashboard admin-dashboard">
      <div className="dashboard-header">
        <h1>Reports Overview</h1>
        <p>Key summaries and detailed datasets. Generated for {user?.name}.</p>
      </div>

      {error && <div className="notification error">{error}</div>}

      {/* Quick Links */}
      <div className="reports-nav">
        <a href="#products">🏷️ Products</a>
        <a href="#warehouses">🏢 Warehouses</a>
        <a href="#inventory">📦 Inventory</a>
        <a href="#history">📚 Stock History</a>
      </div>

      {/* Toolbar */}
      <div className="reports-toolbar">
        <div className="hint">Tip: Use the quick exports to download CSVs for each section.</div>
        <div className="actions">
          <button className="add-button" onClick={exportProducts}>⬇️ Export All Products</button>
          <button className="add-button" onClick={exportWarehouses}>⬇️ Export All Warehouses</button>
          <button className="add-button" onClick={exportInventory}>⬇️ Export Inventory</button>
        </div>
      </div>

      <div className="metrics-grid" style={{ marginBottom: 24 }}>
        <div className="metric-card" style={{ borderLeft: "4px solid #00c6ff" }}>
          <div className="metric-icon">🏷️</div>
          <div className="metric-content">
            <div className="metric-value">{products.length}</div>
            <div className="metric-title">Products</div>
            <div className="metric-subtitle">Active in catalog</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderLeft: "4px solid #6a11cb" }}>
          <div className="metric-icon">🏢</div>
          <div className="metric-content">
            <div className="metric-value">{warehouses.length}</div>
            <div className="metric-title">Warehouses</div>
            <div className="metric-subtitle">Operational locations</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderLeft: "4px solid #ff9800" }}>
          <div className="metric-icon">🤝</div>
          <div className="metric-content">
            <div className="metric-value">{suppliers.length}</div>
            <div className="metric-title">Suppliers</div>
            <div className="metric-subtitle">Vendor partners</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderLeft: "4px solid #2ecc71" }}>
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <div className="metric-value">{totalStock.toLocaleString()}</div>
            <div className="metric-title">Total Units</div>
            <div className="metric-subtitle">Across all warehouses</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderLeft: "4px solid #f44336" }}>
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-value">${totalStockValue.toLocaleString()}</div>
            <div className="metric-title">Total Stock Value</div>
            <div className="metric-subtitle">Est. on product pricing</div>
          </div>
        </div>
      </div>

      <div className="overview-card" style={{ gridColumn: '1 / -1' }}>
        <h4>Quick Exports</h4>
        <p className="section-desc">Download CSVs for offline analysis or sharing.</p>
        <div className="quick-export-grid">
          <button className="export-pill" onClick={exportProducts}>🏷️ Products</button>
          <button className="export-pill" onClick={exportWarehouses}>🏢 Warehouses</button>
          <button className="export-pill" onClick={exportSuppliers}>🤝 Suppliers</button>
          <button className="export-pill" onClick={exportUsers}>👤 Users</button>
          <button className="export-pill" onClick={exportInventory}>📦 Inventory</button>
          <button className="export-pill" onClick={exportHistory}>📚 Stock History</button>
        </div>
      </div>

      <div className="overview-card" id="products">
        <h4>Products</h4>
        <p className="section-desc">Catalog items with SKU, category, unit, and price.</p>
        <div className="products-table-container" style={{ maxHeight: 280, overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>{p.category}</td>
                  <td>{p.unit}</td>
                  <td>{p.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overview-card" id="warehouses">
        <h4>Warehouses</h4>
        <p className="section-desc">Locations where stock is stored and moved.</p>
        <div className="products-table-container" style={{ maxHeight: 240, overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map(w => (
                <tr key={w.id}>
                  <td>{w.name}</td>
                  <td>{w.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overview-card" id="inventory">
        <h4>Inventory</h4>
        <p className="section-desc">Per-product stock per warehouse.</p>
        <div className="products-table-container" style={{ maxHeight: 300, overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Warehouse</th>
                <th style={{ textAlign: 'right' }}>Stock Level</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(i => (
                <tr key={i.id}>
                  <td>{i.product?.name}</td>
                  <td>{i.warehouse?.name}</td>
                  <td style={{ textAlign: 'right' }}>{i.stockLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overview-card" style={{ gridColumn: '1 / -1' }} id="history">
        <h4>Recent Stock History</h4>
        <p className="section-desc">Chronological record of stock movements.</p>
        <div className="products-table-container" style={{ maxHeight: 300, overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Product</th>
                <th>Warehouse</th>
                <th style={{ textAlign: 'right' }}>Quantity</th>
                <th>Performed By</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id}>
                  <td>{h.timestamp}</td>
                  <td>{h.adjustmentType}</td>
                  <td>{h.product?.name}</td>
                  <td>{h.warehouse?.name}</td>
                  <td style={{ textAlign: 'right' }}>{h.adjustmentQuantity}</td>
                  <td>{h.performedByEmail || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


