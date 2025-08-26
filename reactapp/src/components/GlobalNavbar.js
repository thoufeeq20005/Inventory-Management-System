import React from "react";
import {  useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function GlobalNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { show } = useToast();
  const onLanding = location.pathname === "/";
  const onAdminReports = location.pathname === "/admin/reports";

  const handleLoginClick = () => {
    console.log("🔄 Login button clicked, navigating to /login");
    navigate("/login");
  };

  const handleSignupClick = () => {
    console.log("🔄 Signup button clicked, navigating to /signup");
    navigate("/signup");
  };

  const handleInventoryClick = () => {
    console.log("🔄 Inventory button clicked, logging out and navigating to landing page");
    logout(); // Log out the user
    navigate("/"); // Navigate to landing page
    try { show("You have been logged out.", { type: "info" }); } catch (_) {}
  };

  const handleBackToDashboard = () => {
    if (!user) return navigate("/");
    const role = (user.role || "").toLowerCase();
    if (role === "admin") return navigate("/admin");
    if (role === "manager") return navigate("/manager");
    if (role === "employee") return navigate("/employee");
    return navigate("/");
  };

  return (
    <div className="global-navbar">
      <button 
        onClick={handleInventoryClick} 
        className="brand-inventory" 
        aria-label="Go to landing page and logout"
      >
        Inventory
      </button>
      <div style={{ flex: 1 }} />
      {user && onAdminReports && (
        <button
          onClick={handleBackToDashboard}
          className="back-button"
          type="button"
          aria-label="Back to your dashboard"
        >
          ⟵ Back to Dashboard
        </button>
      )}
      {onLanding && (
        <div className="nav-auth-links">
          <button 
            onClick={handleLoginClick} 
            className="nav-btn login-btn"
            type="button"
            aria-label="Navigate to login page"
          >
            Login
          </button>
          <button 
            onClick={handleSignupClick} 
            className="nav-btn signup-btn primary"
            type="button"
            aria-label="Navigate to signup page"
          >
            Sign Up
          </button>
        </div>
      )}
    </div>
  );
}


