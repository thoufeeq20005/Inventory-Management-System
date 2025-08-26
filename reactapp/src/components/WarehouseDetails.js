import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function WarehouseDetails() {
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
  const navigate = useNavigate();

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [wRes, pRes, iRes] = await Promise.all([
          axios.get(`${API_BASE}/api/warehouses`),
          axios.get(`${API_BASE}/api/products`),
          axios.get(`${API_BASE}/api/inventory`)
        ]);
        setWarehouses(wRes.data || []);
        setProducts(pRes.data || []);
        setInventory(iRes.data || []);
      } catch (e) {
        setError("Failed to load warehouse details");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE]);

  // Build consolidated product totals across all warehouses (FR4.3)
  const productTotals = useMemo(() => {
    const totals = new Map();
    for (const item of inventory) {
      const productId = item.product?.id;
      if (!productId) continue;
      const current = totals.get(productId) || 0;
      totals.set(productId, current + (Number(item.stockLevel) || 0));
    }
    return totals;
  }, [inventory]);

  const totalStockValue = useMemo(() => {
    return inventory.reduce((sum, item) => {
      const price = Number(item.product?.price || 0);
      const qty = Number(item.stockLevel || 0);
      return sum + price * qty;
    }, 0);
  }, [inventory]);

  const exportInventoryCSV = () => {
    const headers = ["Product", "Warehouse", "Stock Level", "Unit Price", "Total Value"];
    const rows = inventory.map(i => [
      i.product?.name || "",
      i.warehouse?.name || "",
      i.stockLevel ?? 0,
      i.product?.price ?? 0,
      (Number(i.stockLevel || 0) * Number(i.product?.price || 0))
    ]);
    const csv = [headers, ...rows].map(r => r.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `warehouse_inventory_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner">Loading Warehouse Details...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Warehouse Details</h2>
        <p>Consolidated stock across all warehouses. Total stock value: ${totalStockValue.toLocaleString()}</p>
      </div>

      {error && <div className="notification error">{error}</div>}

      <div className="overview-card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <button className="add-button" onClick={() => navigate("/admin")}>
            ⬅️ Back to Dashboard
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4>Consolidated Product Stock (All Warehouses)</h4>
          <button className="export-btn" onClick={exportInventoryCSV}>⬇️ Export CSV</button>
        </div>
        <div className="products-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Total Stock</th>
                <th>Unit Price</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: "center", padding: 20 }}>No products found.</td></tr>
              ) : (
                products.map(p => {
                  const total = productTotals.get(p.id) || 0;
                  const value = Number(total) * Number(p.price || 0);
                  return (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{total}</td>
                      <td>${Number(p.price || 0).toLocaleString()}</td>
                      <td>${value.toLocaleString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overview-card">
        <h4>Per-Warehouse Inventory</h4>
        <div className="products-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Warehouse</th>
                <th>Product</th>
                <th>Stock Level</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: "center", padding: 20 }}>No inventory data.</td></tr>
              ) : (
                inventory.map(i => (
                  <tr key={i.id}>
                    <td>{i.warehouse?.name}</td>
                    <td>{i.product?.name}</td>
                    <td>{i.stockLevel}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


