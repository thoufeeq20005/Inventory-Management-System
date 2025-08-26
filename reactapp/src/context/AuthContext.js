import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    "http://localhost:8080";

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const stored = localStorage.getItem("loggedInUser");
        if (stored) {
          const userData = JSON.parse(stored);
          // Verify the stored user data is still valid by checking with backend
          const res = await fetch(`${API_BASE}/api/users/email/${encodeURIComponent(userData.email)}`);
          if (res.ok) {
            const fullUser = await res.json();
            setUser(fullUser);
            localStorage.setItem("loggedInUser", JSON.stringify(fullUser));
          } else {
            // Stored data is invalid, clear it
            localStorage.removeItem("loggedInUser");
            
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("loggedInUser");
        
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [API_BASE]);


  const fetchAdminDetails = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/email/${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error("Fetch user details failed");
      const fullUser = await res.json();
      setUser(fullUser);
      localStorage.setItem("loggedInUser", JSON.stringify(fullUser));
      return fullUser;
    } catch (err) {
      console.error("Fetch user details error:", err);
      return null;
    }
  };

  const fetchManagerDetails = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/email/${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error("Fetch user details failed");
      const fullUser = await res.json();
      setUser(fullUser);
      localStorage.setItem("loggedInUser", JSON.stringify(fullUser));
      return fullUser;
    } catch (err) {
      console.error("Fetch user details error:", err);
      return null;
    }
  };

  const fetchUserDetails = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/email/${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error("Fetch user details failed");
      const fullUser = await res.json();
      setUser(fullUser);
      localStorage.setItem("loggedInUser", JSON.stringify(fullUser));
      return fullUser;
    } catch (err) {
      console.error("Fetch user details error:", err);
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        console.error("Login failed:", data.error);
        return null;
      }

      // Fetch complete user details after successful login
      return await fetchUserDetails(data.email);
    } catch (err) {
      console.error("Login error:", err);
      return null;
    }
  };

  const signup = async (newUser) => {
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        console.error("Signup failed:", data.error);
        return null;
      }
      
      // Don't automatically log in the user after signup
      // Just return the created user data
      return data;
    } catch (err) {
      console.error("Signup error:", err);
      return null;
    }
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem("loggedInUser");
    
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, fetchUserDetails, fetchAdminDetails, fetchManagerDetails }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);