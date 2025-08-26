import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddUserModal from "../components/admin/AddUserModal";
import WarehouseModal from "../components/admin/WarehouseModal";
import AddProductModal from "../components/manager/AddProductModal";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Low stock threshold for dashboard display
  const lowStockThreshold = 20;

  // Table UI state: sorting and pagination
  const [userSort, setUserSort] = useState({ field: "name", dir: "asc" });
  const [userPage, setUserPage] = useState(1);
  const [userPageSize] = useState(6);

  const [productSort, setProductSort] = useState({ field: "name", dir: "asc" });
  const [productPage, setProductPage] = useState(1);
  const [productPageSize] = useState(5);

  const [warehouseSort, setWarehouseSort] = useState({ field: "name", dir: "asc" });
  const [warehousePage, setWarehousePage] = useState(1);
  const [warehousePageSize] = useState(5);

  // Modals
  const [showAddUser, setShowAddUser] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [u, w, p, h, inv, a] = await Promise.all([
          axios.get(`${API_BASE}/api/users`),
          axios.get(`${API_BASE}/api/warehouses`),
          axios.get(`${API_BASE}/api/products`),
          axios.get(`${API_BASE}/api/inventory/history`),
          axios.get(`${API_BASE}/api/inventory`),
          axios.get(`${API_BASE}/api/alerts/active`)
        ]);
        setUsers(u.data || []);
        setWarehouses(w.data || []);
        setProducts(p.data || []);
        setInventory(inv.data || []);
        setAlerts(a.data || []);
      } catch (e) {
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API_BASE]);

  // Poll alerts periodically
  useEffect(() => {
    let id;
    const poll = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/alerts/active`);
        setAlerts(res.data || []);
      } catch (_) {}
    };
    poll();
    id = setInterval(poll, 30000);
    return () => clearInterval(id);
  }, [API_BASE]);

  const totalUsers = users.length;
  const totalAdmins = users.filter(u => (u.role || "").toString().toUpperCase() === "ADMIN").length;
  const totalManagers = users.filter(u => (u.role || "").toString().toUpperCase() === "MANAGER").length;
  const totalEmployees = users.filter(u => (u.role || "").toString().toUpperCase() === "EMPLOYEE").length;

  // Generic compare util
  const compareValues = (a, b) => {
    const av = (a ?? "").toString();
    const bv = (b ?? "").toString();
    const numA = Number(av);
    const numB = Number(bv);
    if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
      return numA - numB;
    }
    return av.localeCompare(bv, undefined, { sensitivity: "base" });
  };

  // Users: sort + paginate
  const sortedUsers = useMemo(() => {
    const arr = [...users];
    const { field, dir } = userSort;
    arr.sort((a, b) => {
      const aVal = field === "role" ? (a.role || "") : field === "email" ? (a.email || "") : (a.name || "");
      const bVal = field === "role" ? (b.role || "") : field === "email" ? (b.email || "") : (b.name || "");
      const cmp = compareValues(aVal, bVal);
      return dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [users, userSort]);

  const totalUserPages = Math.max(1, Math.ceil(sortedUsers.length / userPageSize));
  const pagedUsers = useMemo(() => {
    const start = (userPage - 1) * userPageSize;
    return sortedUsers.slice(start, start + userPageSize);
  }, [sortedUsers, userPage, userPageSize]);

  const sortedWarehouses = useMemo(() => {
    const arr = [...warehouses];
    const { field, dir } = warehouseSort;
    arr.sort((a, b) => {
      const aVal = field === "location" ? (a.location || "") : (a.name || "");
      const bVal = field === "location" ? (b.location || "") : (b.name || "");
      const cmp = compareValues(aVal, bVal);
      return dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [warehouses, warehouseSort]);

  const totalWarehousePages = Math.max(1, Math.ceil(sortedWarehouses.length / warehousePageSize));
  const pagedWarehouses = useMemo(() => {
    const start = (warehousePage - 1) * warehousePageSize;
    return sortedWarehouses.slice(start, start + warehousePageSize);
  }, [sortedWarehouses, warehousePage, warehousePageSize]);

  const sortedProducts = useMemo(() => {
    const arr = [...products];
    const { field, dir } = productSort;
    arr.sort((a, b) => {
      const map = {
        name: (x) => x.name,
        sku: (x) => x.sku,
        category: (x) => x.category,
        unit: (x) => x.unit,
        price: (x) => x.price
      };
      const getter = map[field] || ((x) => x.name);
      const cmp = compareValues(getter(a), getter(b));
      return dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [products, productSort]);

  const totalProductPages = Math.max(1, Math.ceil(sortedProducts.length / productPageSize));
  const pagedProducts = useMemo(() => {
    const start = (productPage - 1) * productPageSize;
    return sortedProducts.slice(start, start + productPageSize);
  }, [sortedProducts, productPage, productPageSize]);

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a,b) => (a.product?.name || "").localeCompare(b.product?.name || "", undefined, { sensitivity: "base" }));
  }, [alerts]);

  // Reporting metrics
  const totalStock = useMemo(() => inventory.reduce((sum, i) => sum + (i.stockLevel || 0), 0), [inventory]);
  const totalStockValue = useMemo(() => inventory.reduce((sum, i) => sum + (Number(i.stockLevel || 0) * Number(i.product?.price || 0)), 0), [inventory]);
  const lowStockCount = useMemo(() => inventory.filter(i => (i.stockLevel || 0) < lowStockThreshold).length, [inventory, lowStockThreshold]);

  // Compute low stock items directly from inventory (threshold = 20)
  const lowStockItems = useMemo(() => {
    return inventory
      .filter(i => (i.stockLevel || 0) < lowStockThreshold)
      .sort((a, b) => (a.stockLevel || 0) - (b.stockLevel || 0));
  }, [inventory, lowStockThreshold]);

  // FR4.3 consolidated totals by product
  const consolidatedByProduct = useMemo(() => {
    const totals = new Map();
    for (const item of inventory) {
      const pid = item.product?.id;
      if (!pid) continue;
      const current = totals.get(pid) || { product: item.product, total: 0 };
      current.total += Number(item.stockLevel || 0);
      totals.set(pid, current);
    }
    return Array.from(totals.values()).sort((a, b) => b.total - a.total);
  }, [inventory]);

  const exportInventoryCSV = () => {
    const headers = ["Product","Warehouse","Stock Level","Unit Price","Total Value"];
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
    link.download = `inventory_levels_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.name}</p>
      </div>

      {/* Profile Icon for quick access to admin profile */}
      <div className="profile-icon" onClick={() => navigate("/admin/profile")}>
        <span>👤</span>
        <span>Profile</span>
      </div>

      {(error) && <div className="notification error">{error}</div>}

      {/* Top Metrics */}
      <div className="metrics-grid" style={{ marginBottom: 24 }}>
        <div className="metric-card" style={{ borderLeft: "4px solid #00c6ff" }}>
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <div className="metric-value">{totalUsers}</div>
            <div className="metric-title">Total Users</div>
            <div className="metric-subtitle">Admin {totalAdmins} · Manager {totalManagers} · Emp {totalEmployees}</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderLeft: "4px solid #6a11cb" }}>
          <div className="metric-icon">🏢</div>
          <div className="metric-content">
            <div className="metric-value">{warehouses.length}</div>
            <div className="metric-title">Warehouses</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderLeft: "4px solid #ff9800" }}>
          <div className="metric-icon">🏷️</div>
          <div className="metric-content">
            <div className="metric-value">{products.length}</div>
            <div className="metric-title">Products</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderLeft: "4px solid #f44336" }}>
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <div className="metric-value">{alerts.length}</div>
            <div className="metric-title">Active Alerts</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderLeft: "4px solid #2ecc71" }}>
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-value">${totalStockValue.toLocaleString()}</div>
            <div className="metric-title">Total Stock Value</div>
            <div className="metric-subtitle">Units: {totalStock.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-tabs" style={{ justifyContent: "flex-start" }}>
        <button className="tab-button" onClick={() => setShowAddUser(true)}>➕ Add User</button>
        <button className="tab-button" onClick={() => { setEditingWarehouse(null); setShowWarehouseModal(true); }}>🏢 Add Warehouse</button>
        <button className="tab-button" onClick={() => { setEditingProduct(null); setShowProductModal(true); }}>🏷️ Add Product</button>
        <button className="tab-button" onClick={() => navigate("/admin/settings")}>
          ⚙️ System Settings
        </button>
        <button className="tab-button" onClick={() => navigate("/admin/reports")}>📊 Generate Report</button>
      </div>

      {/* Lists */}
      <div className="tab-content">
        <div className="admin-content-grid">
          <div className="overview-card card-users">
            <h4>Users</h4>
            <div className="products-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => setUserSort(s => ({ field: "name", dir: s.field === "name" && s.dir === "asc" ? "desc" : "asc" }))} className="sortable">
                      Name <span className={`sort-icon ${userSort.field === "name" ? userSort.dir : ""}`}>A-Z</span>
                    </th>
                    <th onClick={() => setUserSort(s => ({ field: "email", dir: s.field === "email" && s.dir === "asc" ? "desc" : "asc" }))} className="sortable">
                      Email <span className={`sort-icon ${userSort.field === "email" ? userSort.dir : ""}`}>A-Z</span>
                    </th>
                    <th onClick={() => setUserSort(s => ({ field: "role", dir: s.field === "role" && s.dir === "asc" ? "desc" : "asc" }))} className="sortable">
                      Role <span className={`sort-icon ${userSort.field === "role" ? userSort.dir : ""}`}>A-Z</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUsers.map(u => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{(u.role || "").toString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <button disabled={userPage === 1} onClick={() => setUserPage(p => Math.max(1, p - 1))}>Prev</button>
              <span className="page-indicator">{userPage} / {totalUserPages}</span>
              <button disabled={userPage === totalUserPages} onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}>Next</button>
            </div>
          </div>

          <div className="overview-card card-products">
            <h4>Products</h4>
            <div className="products-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => setProductSort(s => ({ field: "name", dir: s.field === "name" && s.dir === "asc" ? "desc" : "asc" }))} className="sortable">Name <span className={`sort-icon ${productSort.field === "name" ? productSort.dir : ""}`}>A-Z</span></th>
                    <th onClick={() => setProductSort(s => ({ field: "sku", dir: s.field === "sku" && s.dir === "asc" ? "desc" : "asc" }))} className="sortable">SKU <span className={`sort-icon ${productSort.field === "sku" ? productSort.dir : ""}`}>A-Z</span></th>
                    <th onClick={() => setProductSort(s => ({ field: "category", dir: s.field === "category" && s.dir === "asc" ? "desc" : "asc" }))} className="sortable">Category <span className={`sort-icon ${productSort.field === "category" ? productSort.dir : ""}`}>A-Z</span></th>
                    <th onClick={() => setProductSort(s => ({ field: "unit", dir: s.field === "unit" && s.dir === "asc" ? "desc" : "asc" }))} className="sortable">Unit <span className={`sort-icon ${productSort.field === "unit" ? productSort.dir : ""}`}>A-Z</span></th>
                    <th onClick={() => setProductSort(s => ({ field: "price", dir: s.field === "price" && s.dir === "asc" ? "desc" : "asc" }))} className="sortable" style={{ textAlign: 'left' }}>Price <span className={`sort-icon ${productSort.field === "price" ? productSort.dir : ""}`}>A-Z</span></th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedProducts.map(p => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.sku}</td>
                      <td>{p.category}</td>
                      <td>{p.unit}</td>
                      <td>{p.price}</td>
                      <td className="actions">
                        <button className="action-btn edit" title="Edit" onClick={() => { setEditingProduct(p); setShowProductModal(true); }}>✏️</button>
                        <button className="action-btn delete" title="Delete" onClick={async () => {
                          if (!window.confirm("Delete this product?")) return;
                          try {
                            await axios.delete(`${API_BASE}/api/products/${p.id}`);
                            const res = await axios.get(`${API_BASE}/api/products`);
                            setProducts(res.data || []);
                          } catch (e) {
                            setError(e.response?.data?.error || "Failed to delete product");
                          }
                        }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <button disabled={productPage === 1} onClick={() => setProductPage(p => Math.max(1, p - 1))}>Prev</button>
              <span className="page-indicator">{productPage} / {totalProductPages}</span>
              <button disabled={productPage === totalProductPages} onClick={() => setProductPage(p => Math.min(totalProductPages, p + 1))}>Next</button>
            </div>
      </div>

          <div className="overview-card card-warehouses">
            <h4>Warehouses</h4>
            <div className="products-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => setWarehouseSort(s => ({ field: "name", dir: s.field === "name" && s.dir === "asc" ? "desc" : "asc" }))} className="sortable">Name <span className={`sort-icon ${warehouseSort.field === "name" ? warehouseSort.dir : ""}`}>A-Z</span></th>
                    <th onClick={() => setWarehouseSort(s => ({ field: "location", dir: s.field === "location" && s.dir === "asc" ? "desc" : "asc" }))} className="sortable">Location <span className={`sort-icon ${warehouseSort.field === "location" ? warehouseSort.dir : ""}`}>A-Z</span></th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedWarehouses.map(w => (
                    <tr key={w.id}>
                      <td>{w.name}</td>
                      <td>{w.location}</td>
                      <td className="actions">
                        <button className="action-btn edit" title="Edit" onClick={() => { setEditingWarehouse(w); setShowWarehouseModal(true); }}>✏️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <button disabled={warehousePage === 1} onClick={() => setWarehousePage(p => Math.max(1, p - 1))}>Prev</button>
              <span className="page-indicator">{warehousePage} / {totalWarehousePages}</span>
              <button disabled={warehousePage === totalWarehousePages} onClick={() => setWarehousePage(p => Math.min(totalWarehousePages, p + 1))}>Next</button>
            </div>
      </div>

          <div className="overview-card card-alerts">
            <h4>Low Stock (below {lowStockThreshold})</h4>
            <div className="low-stock-list">
              {lowStockItems.length > 0 ? (
                lowStockItems.slice(0, 8).map(item => (
                  <div key={`${item.product?.id}-${item.warehouse?.id}`} className="low-stock-item">
                    <span className="product-name">{item.product?.name} @ {item.warehouse?.name}</span>
                    <span className="stock-level">{item.stockLevel}/{lowStockThreshold}</span>
                  </div>
                ))
              ) : (
                <p className="no-alerts">All items are healthy</p>
              )}
            </div>
          </div>
          <div className="overview-card">
            <h4>Reporting</h4>
            <div className="report-summary">
              <p>Total Stock Value: ${totalStockValue.toLocaleString()}</p>
              <p>Total Units: {totalStock.toLocaleString()}</p>
              <p>Low Stock Items: {lowStockCount}</p>
            </div>
            <button className="export-btn" onClick={exportInventoryCSV}>⬇️ Export Inventory CSV</button>
          </div>
          <div className="overview-card" style={{ gridColumn: '1 / -1' }}>
            <h4>Consolidated Stock by Product (All Warehouses)</h4>
            <div className="products-table-container" style={{ maxHeight: 300, overflow: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: 'right' }}>Total Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {consolidatedByProduct.length === 0 ? (
                    <tr><td colSpan="2" style={{ textAlign: 'center', padding: 16 }}>No data</td></tr>
                  ) : (
                    consolidatedByProduct.map(({ product, total }) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td style={{ textAlign: 'right' }}>{total}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>
      </div>

      <button className="logout-btn" onClick={logout}>Logout</button>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUser}
        submitting={false}
        onClose={() => setShowAddUser(false)}
        onSubmit={async (values) => {
          try {
            await axios.post(`${API_BASE}/api/users`, values);
            setShowAddUser(false);
            const res = await axios.get(`${API_BASE}/api/users`);
            setUsers(res.data || []);
          } catch (e) {
            setError(e.response?.data?.error || "Failed to add user");
          }
        }}
      />

      {/* Add/Edit Warehouse Modal */}
      <WarehouseModal
        isOpen={showWarehouseModal}
        title={editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}
        initialValues={editingWarehouse}
        submitting={false}
        onClose={() => setShowWarehouseModal(false)}
        onSubmit={async (values) => {
          try {
            if (editingWarehouse?.id) {
              await axios.put(`${API_BASE}/api/warehouses/${editingWarehouse.id}`, values);
            } else {
              await axios.post(`${API_BASE}/api/warehouses`, values);
            }
            setShowWarehouseModal(false);
            setEditingWarehouse(null);
            const res = await axios.get(`${API_BASE}/api/warehouses`);
            setWarehouses(res.data || []);
          } catch (e) {
            setError(e.response?.data?.error || "Failed to save warehouse");
          }
        }}
      />

      {/* Add/Edit Product Modal */}
      <AddProductModal
        isOpen={showProductModal}
        title={editingProduct ? "Edit Product" : "Add Product"}
        initialValues={editingProduct}
        submitting={submittingProduct}
        onClose={() => setShowProductModal(false)}
        onSubmit={async (values) => {
          setSubmittingProduct(true);
          try {
            if (editingProduct?.id) {
              await axios.put(`${API_BASE}/api/products/${editingProduct.id}`, values);
            } else {
              await axios.post(`${API_BASE}/api/products`, values);
            }
            setShowProductModal(false);
            setEditingProduct(null);
            const res = await axios.get(`${API_BASE}/api/products`);
            setProducts(res.data || []);
          } catch (e) {
            setError(e.response?.data?.error || "Failed to save product");
          } finally {
            setSubmittingProduct(false);
          }
        }}
      />
    </div>
  );
}
