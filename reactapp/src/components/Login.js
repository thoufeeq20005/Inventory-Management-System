import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import logo from "../logo.png";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { show } = useToast();
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      const role = user.role?.toLowerCase();
      if (role === "admin") navigate("/admin");
      else if (role === "manager") navigate("/manager");
      else if (role === "employee") navigate("/employee");
    }
  }, [user, loading, navigate]);

  // Show loading while checking authentication
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

  // Don't show login form if user is already authenticated
  if (user) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic client validation
    if (!email || !password) {
      setIsLoading(false);
      setError("Please enter both email and password.");
      show("Please enter both email and password.", { type: "error" });
      return;
    }

    try {
      const loggedInUser = await login(email, password);

      if (!loggedInUser) {
        setError("Invalid email or password. Please try again.");
        show("Invalid credentials.", { type: "error" });
        return;
      }

      // Redirect based on role (case-insensitive)
      const role = loggedInUser.role?.toLowerCase();
      if (role === "admin") navigate("/admin");
      else if (role === "manager") navigate("/manager");
      else if (role === "employee") navigate("/employee");
      else {
        setError("Unknown role assigned. Please contact admin.");
        show("Unknown role assigned.", { type: "error" });
      }
      show("Welcome back!", { type: "success" });
    } catch (error) {
      setError("Login failed. Please try again.");
      console.error("Login error:", error);
      show("Login failed. Please try again.", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="form-container">
        <img src={logo} alt="Inventory Logo" className="logo-image" />
        <h2>Login</h2>
        {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
