
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function EmployeeProfile() {
  const { user, fetchUserDetails } = useAuth();
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    phoneNumber: "",
    role: "",
    email: "",
    password: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id || "",
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        role: user.role || "",
        email: user.email || "",
        password: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const payload = {
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      ...(formData.password ? { passwordHash: formData.password } : {}),
    };

    try {
      const response = await fetch(`${API_BASE}/api/users/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("authToken") ? { "Authorization": `Bearer ${localStorage.getItem("authToken")}` } : {})
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const updatedUser = await response.json();

      // Refresh AuthContext data
      await fetchUserDetails(updatedUser.email);

      setEditMode(false);
      setFormData((f) => ({ ...f, password: "" }));
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setError("");
    // Reset form data to current user data
    if (user) {
      setFormData({
        id: user.id || "",
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        role: user.role || "",
        email: user.email || "",
        password: "",
      });
    }
  };

  if (!user) {
    return <div className="profile-page">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>Employee Profile</h2>

        {error && <div className="form-error" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <div className="profile-grid">
          <label>Name</label>
          {editMode ? (
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
          ) : (
            <p>{formData.name || "-"}</p>
          )}

          <label>Phone Number</label>
          {editMode ? (
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={isLoading}
            />
          ) : (
            <p>{formData.phoneNumber || "-"}</p>
          )}

          <label>Role</label>
          <p>{formData.role?.toUpperCase() || "-"}</p>

          <label>Email</label>
          {editMode ? (
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          ) : (
            <p>{formData.email || "-"}</p>
          )}

          <label>New Password</label>
          {editMode ? (
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current"
              disabled={isLoading}
            />
          ) : (
            <p>********</p>
          )}
        </div>

        <div className="profile-actions">
          <button
            className="btn ghost"
            onClick={() => navigate("/employee")}
          >
            ⬅️ Home
          </button>
          {editMode ? (
            <>
              <button 
                className="btn primary" 
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
              <button
                className="btn ghost"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="btn primary"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
