import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../logo.png";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Signup() {
  const { show } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "employee"
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, user, loading } = useAuth();

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

  // Don't show signup form if user is already authenticated
  if (user) {
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic client-side validation
    if (!formData.name || !formData.email || !formData.password || !formData.phoneNumber) {
      const msg = "Please fill in all fields.";
      setIsLoading(false);
      setError(msg);
      show(msg, { type: "error" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      const msg = "Please enter a valid email address.";
      setIsLoading(false);
      setError(msg);
      show(msg, { type: "error" });
      return;
    }
    if (formData.password.length < 6) {
      const msg = "Password must be at least 6 characters.";
      setIsLoading(false);
      setError(msg);
      show(msg, { type: "error" });
      return;
    }

    try {
      const newUser = {
        name: formData.name,
        email: formData.email,
        passwordHash: formData.password,
        phoneNumber: formData.phoneNumber,
        role: formData.role.toUpperCase()
      };

      const createdUser = await signup(newUser);

      if (createdUser) {
        console.log("User created successfully:", createdUser);
        show("Account created! Please login.", { type: "success" });
        navigate("/");
      } else {
        setError("Signup failed. Please try again.");
        show("Signup failed. Please try again.", { type: "error" });
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setError("Something went wrong! Please try again.");
      show("Something went wrong! Please try again.", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="form-container">
        <img src={logo} alt="Inventory Logo" className="logo-image" />
        <h2>Sign Up</h2>
        {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input 
            name="name" 
            placeholder="Full Name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <input 
            name="phoneNumber" 
            placeholder="Phone Number" 
            value={formData.phoneNumber} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <select 
            name="role" 
            value={formData.role} 
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <p>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}