import React from "react";
import "./styles.css";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeProfile from "./components/EmployeeProfile";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/ToastContainer";
import NotFound from "./components/NotFound";
import AdminProfile from "./components/AdminProfile";
import ManagerProfile from "./components/ManagerProfile";
import WarehouseDetails from "./components/WarehouseDetails";
import LandingPage from "./components/LandingPage";
import GlobalNavbar from "./components/GlobalNavbar";
import AdminReports from "./pages/AdminReports";


// ✅ PrivateRoute with role validation and loading state
function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #141e30, #243b55)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid #00c6ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return user.role?.toLowerCase() === role.toLowerCase() ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <GlobalNavbar />
          <ToastContainer />
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute role="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <PrivateRoute role="admin">
                <AdminProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <PrivateRoute role="admin">
                <AdminReports />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/warehouses"
            element={
              <PrivateRoute role="admin">
                <WarehouseDetails />
              </PrivateRoute>
            }
          />
      
          {/* Manager Routes */}
          <Route
            path="/manager"
            element={
              <PrivateRoute role="manager">
                <ManagerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager/profile"
            element={
              <PrivateRoute role="manager">
                <ManagerProfile />
              </PrivateRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/employee"
            element={
              <PrivateRoute role="employee">
                <EmployeeDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/profile"
            element={
              <PrivateRoute role="employee">
                <EmployeeProfile />
              </PrivateRoute>
            }
          />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
