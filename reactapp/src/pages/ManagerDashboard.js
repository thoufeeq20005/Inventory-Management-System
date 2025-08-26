import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import AddProductModal from "../components/manager/AddProductModal";
import AddSupplierModal from "../components/manager/AddSupplierModal";
import { useToast } from "../context/ToastContext";

export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { show } = useToast();
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

  // State for different data
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Form states
  const [productForm, setProductForm] = useState({
    name: "", sku: "", category: "", unit: "", price: ""
  });
  const [supplierForm, setSupplierForm] = useState({
    name: "", contactPerson: "", email: "", phone: "", address: "", paymentTerms: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // UI states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enhanced analytics states
  const [stockThreshold, setStockThreshold] = useState(10);
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");

  useEffect(() => {
    loadAllData();
  }, []);

  // Removed backend system alert polling for a cleaner dashboard

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [productsRes, suppliersRes, inventoryRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE}/api/products`),
        axios.get(`${API_BASE}/api/suppliers`),
        axios.get(`${API_BASE}/api/inventory`),
        axios.get(`${API_BASE}/api/inventory/history`)
      ]);
      
      setProducts(productsRes.data || []);
      setSuppliers(suppliersRes.data || []);
      setInventory(inventoryRes.data || []);
      setStockHistory(historyRes.data || []);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load dashboard data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate key metrics
  const totalStock = inventory.reduce((sum, item) => sum + (item.stockLevel || 0), 0);
  const totalStockValue = inventory.reduce((sum, item) => {
    const unitPrice = Number(item.product?.price || 0);
    const qty = Number(item.stockLevel || 0);
    return sum + unitPrice * qty;
  }, 0);
  const lowStockProducts = inventory.filter(item => (item.stockLevel || 0) < stockThreshold).length;
  const criticalStockProducts = inventory.filter(item => (item.stockLevel || 0) < 5).length;
  const totalProducts = products.length;
  const totalSuppliers = suppliers.length;
  const totalWarehouses = [...new Set(inventory.map(item => item.warehouse?.id))].length;

  // Stock movement analysis
  const stockInCount = stockHistory.filter(h => h.adjustmentType === "ADD").length;
  const stockOutCount = stockHistory.filter(h => h.adjustmentType === "REMOVE").length;
  const totalMovements = stockHistory.length;

  // Enhanced analytics
  const getStockMovementByTimeRange = (range) => {
    const now = new Date();
    let startDate;
    
    switch(range) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return stockHistory.filter(h => new Date(h.timestamp) >= startDate);
  };

  const recentMovements = getStockMovementByTimeRange(selectedTimeRange);
  const recentStockIn = recentMovements.filter(h => h.adjustmentType === "ADD").length;
  const recentStockOut = recentMovements.filter(h => h.adjustmentType === "REMOVE").length;

  // Top low stock products
  const topLowStockProducts = inventory
    .filter(item => (item.stockLevel || 0) < stockThreshold)
    .sort((a, b) => (a.stockLevel || 0) - (b.stockLevel || 0))
    .slice(0, 5);

  // Full low stock list for alert section (uses adjustable threshold)
  const lowStockItems = React.useMemo(() => {
    return inventory
      .filter(item => (item.stockLevel || 0) < stockThreshold)
      .sort((a, b) => (a.stockLevel || 0) - (b.stockLevel || 0));
  }, [inventory, stockThreshold]);

  // Toast notifications for low stock and system alerts (de-duplicated)
  const lastAlertCountRef = useRef(0);
  const lastLowCountRef = useRef(0);

  // System alert toast removed

  useEffect(() => {
    if (lowStockItems.length > 0 && lowStockItems.length !== lastLowCountRef.current) {
      lastLowCountRef.current = lowStockItems.length;
      try { show(`${lowStockItems.length} item(s) below threshold (${stockThreshold}).`, { type: "error", duration: 5000 }); } catch(_) {}
    }
  }, [lowStockItems, stockThreshold, show]);

  // FR4.3 Consolidated totals across all warehouses (by product)
  const consolidatedByProduct = React.useMemo(() => {
    const totals = new Map();
    inventory.forEach(item => {
      const pid = item.product?.id;
      if (!pid) return;
      const current = totals.get(pid) || { product: item.product, total: 0 };
      current.total += Number(item.stockLevel || 0);
      totals.set(pid, current);
    });
    return Array.from(totals.values()).sort((a, b) => b.total - a.total);
  }, [inventory]);

  // Handle product form
  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      if (isEditing) {
        await axios.put(`${API_BASE}/api/products/${editingId}`, productForm);
        setSuccess("Product updated successfully!");
      } else {
        await axios.post(`${API_BASE}/api/products`, productForm);
        setSuccess("Product added successfully!");
      }
      
      setShowProductModal(false);
      setIsEditing(false);
      setEditingId(null);
      setProductForm({ name: "", sku: "", category: "", unit: "", price: "" });
      await loadAllData();
    } catch (err) {
      setError(err.response?.data?.error || "Operation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle supplier form
  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      if (isEditing) {
        await axios.put(`${API_BASE}/api/suppliers/${editingId}`, supplierForm);
        setSuccess("Supplier updated successfully!");
      } else {
        await axios.post(`${API_BASE}/api/suppliers`, supplierForm);
        setSuccess("Supplier added successfully!");
      }
      
      setShowSupplierModal(false);
      setIsEditing(false);
      setEditingId(null);
      setSupplierForm({ name: "", contactPerson: "", email: "", phone: "", address: "", paymentTerms: "" });
      await loadAllData();
    } catch (err) {
      setError(err.response?.data?.error || "Operation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit functions
  const editProduct = (product) => {
    setProductForm(product);
    setIsEditing(true);
    setEditingId(product.id);
    setShowProductModal(true);
  };

  const editSupplier = (supplier) => {
    setSupplierForm(supplier);
    setIsEditing(true);
    setEditingId(supplier.id);
    setShowSupplierModal(true);
  };

  // Delete functions
  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        await axios.delete(`${API_BASE}/api/products/${id}`);
        setSuccess("Product deleted successfully!");
        await loadAllData();
      } catch (err) {
        setError("Failed to delete product. It may be referenced in inventory.");
      }
    }
  };

  const deleteSupplier = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier? This action cannot be undone.")) {
      try {
        await axios.delete(`${API_BASE}/api/suppliers/${id}`);
        setSuccess("Supplier deleted successfully!");
        await loadAllData();
      } catch (err) {
        setError("Failed to delete supplier. It may be referenced in products.");
      }
    }
  };

  // Export functionality
  const exportReport = (type) => {
    // In a real application, this would generate and download a file
    alert(`${type} report export functionality would be implemented here.`);
  };

  // CSV export for inventory levels
  const exportInventoryCSV = () => {
    const headers = ["Product","Warehouse","Stock Level","Unit Price","Total Value"]; 
    const rows = inventory.map(i => [
      (i.product?.name || ""),
      (i.warehouse?.name || ""),
      (i.stockLevel ?? 0),
      (i.product?.price ?? 0),
      ((i.stockLevel || 0) * (i.product?.price || 0))
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

  // Clear notifications
  const clearNotifications = () => {
    setError("");
    setSuccess("");
  };

  // Dedicated modals for stable typing experience

  // Metric Card component
  const MetricCard = ({ title, value, icon, color, subtitle }) => (
    <div className="metric-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <div className="metric-value">{value}</div>
        <div className="metric-title">{title}</div>
        {subtitle && <div className="metric-subtitle">{subtitle}</div>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard manager-dashboard">
        <div className="loading-spinner">
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid #00c6ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          Loading Manager Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard manager-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Manager Dashboard</h1>
        <p>Welcome back, {user?.name}! Here's your comprehensive inventory overview.</p>
      </div>

      {/* Profile Icon */}
      <div className="profile-icon" onClick={() => navigate("/manager/profile")}>
        <span>👤</span>
        <span>Profile</span>
      </div>

      {/* Notifications */}
      {(error || success) && (
        <div className={`notification ${error ? 'error' : 'success'}`}>
          {error || success}
          <button 
            onClick={clearNotifications}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              marginLeft: '10px',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Key Metrics */}
      <div className="metrics-grid">
        <MetricCard 
          title="Total Stock" 
          value={totalStock.toLocaleString()} 
          icon="📦" 
          color="#00c6ff"
          subtitle="Across all warehouses"
        />
        <MetricCard 
          title="Total Stock Value" 
          value={`$${totalStockValue.toLocaleString()}`} 
          icon="💰" 
          color="#2ecc71"
          subtitle="Estimated based on product price"
        />
        <MetricCard 
          title="Products" 
          value={totalProducts} 
          icon="🏷️" 
          color="#6a11cb"
          subtitle="In catalog"
        />
        <MetricCard 
          title="Suppliers" 
          value={totalSuppliers} 
          icon="🏭" 
          color="#ff9800"
          subtitle="Active vendors"
        />
        <MetricCard 
          title="Low Stock Alert" 
          value={lowStockProducts} 
          icon="⚠️" 
          color="#f44336"
          subtitle={`Below ${stockThreshold} units`}
        />
        <MetricCard 
          title="Warehouses" 
          value={totalWarehouses} 
          icon="🏢" 
          color="#4caf50"
          subtitle="Active locations"
        />
        <MetricCard 
          title="Critical Stock" 
          value={criticalStockProducts} 
          icon="🚨" 
          color="#e91e63"
          subtitle="Below 5 units"
        />
      </div>

      {/* Stock Movement Summary */}
      <div className="stock-movement-summary">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Stock Movement Analysis</h3>
          <select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className={`time-select range-${selectedTimeRange}`}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
        </div>
        <div className="movement-cards">
          <div className="movement-card stock-in">
            <div className="movement-icon">📥</div>
            <div className="movement-details">
              <div className="movement-count">{recentStockIn}</div>
              <div className="movement-label">Stock-In</div>
            </div>
          </div>
          <div className="movement-card stock-out">
            <div className="movement-icon">📤</div>
            <div className="movement-details">
              <div className="movement-count">{recentStockOut}</div>
              <div className="movement-label">Stock-Out</div>
            </div>
          </div>
          <div className="movement-card" style={{
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1))',
            borderColor: 'rgba(76, 175, 80, 0.4)'
          }}>
            <div className="movement-icon">📊</div>
            <div className="movement-details">
              <div className="movement-count">{totalMovements}</div>
              <div className="movement-label">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Removed backend System Alerts section */}

      {/* Threshold-based Low Stock Alerts (calculated from inventory) */}
      <div className="overview-card" style={{ marginTop: '20px' }}>
        <h4>Low Stock Alerts (below {stockThreshold})</h4>
        <div className="low-stock-list">
          {lowStockItems.length > 0 ? (
            lowStockItems.slice(0, 10).map(item => (
              <div key={item.id} className="low-stock-item">
                <span className="product-name">{item.product?.name} @ {item.warehouse?.name}</span>
                <span className="stock-level">{item.stockLevel}/{stockThreshold}</span>
              </div>
            ))
          ) : (
            <p className="no-alerts">No items below the current threshold.</p>
          )}
        </div>
      </div>

      {/* Stock Threshold Control */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '30px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <h4 style={{ color: '#00c6ff', marginBottom: '15px' }}>Stock Alert Threshold</h4>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <label style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Alert when stock falls below:</label>
          <input
            type="number"
            value={stockThreshold}
            onChange={(e) => setStockThreshold(parseInt(e.target.value) || 10)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(0, 198, 255, 0.3)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              width: '80px',
              textAlign: 'center'
            }}
            min="1"
            max="100"
          />
          <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>units</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-button ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          🏷️ Products
        </button>
        <button 
          className={`tab-button ${activeTab === "suppliers" ? "active" : ""}`}
          onClick={() => setActiveTab("suppliers")}
        >
          🏭 Suppliers
        </button>
        <button 
          className={`tab-button ${activeTab === "inventory" ? "active" : ""}`}
          onClick={() => setActiveTab("inventory")}
        >
          📦 Inventory
        </button>
        <button 
          className={`tab-button ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          📈 Reports
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="overview-content">
            <div className="overview-grid">
              <div className="overview-card">
                <h4>Low Stock Products</h4>
                <div className="low-stock-list">
                  {topLowStockProducts.length > 0 ? (
                    topLowStockProducts.map(item => (
                      <div key={item.id} className="low-stock-item">
                        <span className="product-name">{item.product?.name}</span>
                        <span className="stock-level">{item.stockLevel}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-alerts">No low stock alerts</p>
                  )}
                </div>
              </div>

              <div className="overview-card">
                <h4>Recent Stock Movements</h4>
                <div className="recent-movements">
                  {stockHistory
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, 5)
                    .map(movement => (
                      <div key={movement.id} className="movement-item">
                        <span className="movement-type">{movement.adjustmentType}</span>
                        <span className="movement-product">{movement.product?.name}</span>
                        <span className="movement-time">
                          {format(new Date(movement.timestamp), "MMM dd, HH:mm")}
                        </span>
                      </div>
                    ))}
                  {stockHistory.length === 0 && (
                    <p className="no-alerts">No recent movements</p>
                  )}
                </div>
              </div>

              <div className="overview-card">
                <h4>Quick Actions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    className="add-button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditingId(null);
                      setProductForm({ name: "", sku: "", category: "", unit: "", price: "" });
                      setShowProductModal(true);
                    }}
                    style={{ fontSize: '0.9rem', padding: '10px 16px' }}
                  >
                    ➕ Add Product
                  </button>
                  <button 
                    className="add-button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditingId(null);
                      setSupplierForm({ name: "", contactPerson: "", email: "", phone: "", address: "", paymentTerms: "" });
                      setShowSupplierModal(true);
                    }}
                    style={{ fontSize: '0.9rem', padding: '10px 16px' }}
                  >
                    🏭 Add Supplier
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="products-content">
            <div className="section-header">
              <h3>Product Management</h3>
              <button 
                className="add-button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingId(null);
                  setProductForm({ name: "", sku: "", category: "", unit: "", price: "" });
                  setShowProductModal(true);
                }}
              >
                ➕ Add Product
              </button>
            </div>

            <div className="products-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map(product => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.sku}</td>
                        <td>{product.category}</td>
                        <td>{product.unit}</td>
                        <td>${product.price}</td>
                        <td className="actions">
                          <button 
                            className="action-btn edit"
                            onClick={() => editProduct(product)}
                            title="Edit Product"
                          >
                            ✏️
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => deleteProduct(product.id)}
                            title="Delete Product"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        No products found. Add your first product to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Suppliers Tab */}
        {activeTab === "suppliers" && (
          <div className="suppliers-content">
            <div className="section-header">
              <h3>Supplier Management</h3>
              <button 
                className="add-button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingId(null);
                  setSupplierForm({ name: "", contactPerson: "", email: "", phone: "", address: "", paymentTerms: "" });
                  setShowSupplierModal(true);
                }}
              >
                ➕ Add Supplier
              </button>
            </div>

            <div className="suppliers-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact Person</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Payment Terms</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.length > 0 ? (
                    suppliers.map(supplier => (
                      <tr key={supplier.id}>
                        <td>{supplier.name}</td>
                        <td>{supplier.contactPerson}</td>
                        <td>{supplier.email}</td>
                        <td>{supplier.phone}</td>
                        <td>{supplier.paymentTerms}</td>
                        <td className="actions">
                          <button 
                            className="action-btn edit"
                            onClick={() => editSupplier(supplier)}
                            title="Edit Supplier"
                          >
                            ✏️
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => deleteSupplier(supplier.id)}
                            title="Delete Supplier"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        No suppliers found. Add your first supplier to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <div className="inventory-content">
            <h3>Inventory Overview</h3>
            <div className="inventory-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Warehouse</th>
                    <th>Stock Level</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.length > 0 ? (
                    inventory.map(item => (
                      <tr key={item.id} className={item.stockLevel < stockThreshold ? "low-stock" : ""}>
                        <td>{item.product?.name || 'Unknown Product'}</td>
                        <td>{item.warehouse?.name || 'Unknown Warehouse'}</td>
                        <td>{item.stockLevel}</td>
                        <td>
                          <span className={`status ${item.stockLevel < stockThreshold ? "critical" : "normal"}`}>
                            {item.stockLevel < 5 ? "Critical" : item.stockLevel < stockThreshold ? "Low Stock" : "Normal"}
                          </span>
                        </td>
                        <td style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                          {item.lastUpdated ? format(new Date(item.lastUpdated), "MMM dd, yyyy") : 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        No inventory data found. Stock movements will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="reports-content">
            <h3>Reports & Analytics</h3>
            <div className="reports-grid">
              <div className="report-card">
                <h4>Total Stock Value</h4>
                <div className="report-summary">
                  <p>Current Value: ${totalStockValue.toLocaleString()}</p>
                  <p>Total Units: {totalStock.toLocaleString()}</p>
                </div>
                <button className="export-btn" onClick={exportInventoryCSV}>
                  ⬇️ Export Inventory CSV
                </button>
              </div>

              <div className="report-card">
                <h4>Stock Movement Report</h4>
                <div className="report-summary">
                  <p>Total Movements: {totalMovements}</p>
                  <p>Stock-In: {stockInCount}</p>
                  <p>Stock-Out: {stockOutCount}</p>
                  <p>Recent ({selectedTimeRange}): {recentMovements.length}</p>
                </div>
                <button className="export-btn" onClick={() => exportReport("Stock Movement")}>
                  📊 Export Report
                </button>
              </div>

              <div className="report-card">
                <h4>Low Stock Report</h4>
                <div className="report-summary">
                  <p>Critical Items: {criticalStockProducts}</p>
                  <p>Low Stock Items: {lowStockProducts}</p>
                  <p>Threshold: {stockThreshold} units</p>
                  <p>Total Products: {totalProducts}</p>
                </div>
                {lowStockProducts > 0 && (
                  <div style={{marginTop: 8, color: '#f44336'}}>⚠️ Some items are below the threshold</div>
                )}
                <button className="export-btn" onClick={() => exportReport("Low Stock")}>
                  📊 Export Report
                </button>
              </div>

              <div className="report-card">
                <h4>Supplier Performance</h4>
                <div className="report-summary">
                  <p>Total Suppliers: {totalSuppliers}</p>
                  <p>Active Products: {totalProducts}</p>
                  <p>Warehouses: {totalWarehouses}</p>
                  <p>Total Stock Value: ${(totalStock * 100).toLocaleString()}</p>
                </div>
                <button className="export-btn" onClick={() => exportReport("Supplier Performance")}>
                  📊 Export Report
                </button>
              </div>

              <div className="report-card">
                <h4>Inventory Health</h4>
                <div className="report-summary">
                  <p>Healthy Items: {inventory.filter(item => (item.stockLevel || 0) >= stockThreshold).length}</p>
                  <p>Low Stock Items: {lowStockProducts}</p>
                  <p>Critical Items: {criticalStockProducts}</p>
                  <p>Health Score: {Math.round(((totalProducts - lowStockProducts) / totalProducts) * 100)}%</p>
                </div>
                <button className="export-btn" onClick={() => exportReport("Inventory Health")}>
                  📊 Export Report
                </button>
              </div>

              <div className="report-card" style={{ gridColumn: '1 / -1' }}>
                <h4>Consolidated Stock by Product (All Warehouses)</h4>
                <div className="products-table-container" style={{ maxHeight: 260, overflow: 'auto' }}>
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
        )}
      </div>

      {/* Logout Button */}
      <button className="logout-btn" onClick={logout}>
        Logout
      </button>

      {/* Product Modal */}
      <AddProductModal
        isOpen={showProductModal}
        title={isEditing ? "Edit Product" : "Add New Product"}
        initialValues={productForm}
        submitting={isSubmitting}
        onClose={() => setShowProductModal(false)}
        onSubmit={async (values) => {
          setIsSubmitting(true);
          try {
            if (isEditing) {
              await axios.put(`${API_BASE}/api/products/${editingId}`, values);
              setSuccess("Product updated successfully!");
            } else {
              await axios.post(`${API_BASE}/api/products`, values);
              setSuccess("Product added successfully!");
            }
            setShowProductModal(false);
            setIsEditing(false);
            setEditingId(null);
            setProductForm({ name: "", sku: "", category: "", unit: "", price: "" });
            await loadAllData();
          } catch (err) {
            setError(err.response?.data?.error || "Operation failed. Please try again.");
          } finally {
            setIsSubmitting(false);
          }
        }}
      />

      {/* Supplier Modal */}
      <AddSupplierModal
        isOpen={showSupplierModal}
        title={isEditing ? "Edit Supplier" : "Add New Supplier"}
        initialValues={supplierForm}
        submitting={isSubmitting}
        onClose={() => setShowSupplierModal(false)}
        onSubmit={async (values) => {
          setIsSubmitting(true);
          try {
            if (isEditing) {
              await axios.put(`${API_BASE}/api/suppliers/${editingId}`, values);
              setSuccess("Supplier updated successfully!");
            } else {
              await axios.post(`${API_BASE}/api/suppliers`, values);
              setSuccess("Supplier added successfully!");
            }
            setShowSupplierModal(false);
            setIsEditing(false);
            setEditingId(null);
            setSupplierForm({ name: "", contactPerson: "", email: "", phone: "", address: "", paymentTerms: "" });
            await loadAllData();
          } catch (err) {
            setError(err.response?.data?.error || "Operation failed. Please try again.");
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    </div>
  );
}
