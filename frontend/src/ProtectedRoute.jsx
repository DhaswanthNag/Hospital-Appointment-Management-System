// src/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * allowedRoles: array of role names exactly matching backend User.Role enum values
 * (e.g. 'admin', 'doctor', 'patient')
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("hams_token");          // ✔ fixed key
  const userStr = localStorage.getItem("hams_user");         // ✔ fixed key

  // If not logged in → redirect
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);

    // Backend already returns a plain string role (e.g. "admin")
    const role = user.role;

    // If no role OR role not allowed → redirect
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/login" replace />;
    }

    // Allowed → render the page
    return children;

  } catch (error) {
    // If corrupted localStorage → redirect
    return <Navigate to="/login" replace />;
  }
}
