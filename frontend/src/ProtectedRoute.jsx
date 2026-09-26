// src/ProtectedRoute.jsx
import React from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

/**
 * allowedRoles: array of role names exactly matching backend User.Role enum values
 * (e.g. 'admin', 'doctor', 'patient')
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  // Use sessionStorage for the current login session
  // Keep localStorage as fallback for existing stored sessions
  const token =
    sessionStorage.getItem("hams_token") ||
    localStorage.getItem("hams_token");

  const userStr =
    sessionStorage.getItem("hams_user") ||
    localStorage.getItem("hams_user");

  // If not logged in → redirect
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);

    // Backend returns role as a string (e.g. "admin")
    // Also support an object role just in case the backend returns { name: "admin" }
    const role =
      typeof user.role === "object"
        ? user.role?.name
        : user.role;

    // If no role OR role not allowed → redirect
    if (!role || !allowedRoles.includes(role.toLowerCase())) {
      return <Navigate to="/login" replace />;
    }

    // Allowed → render the page
    return children;

  } catch (error) {
    // If corrupted storage → redirect
    sessionStorage.removeItem("hams_user");
    sessionStorage.removeItem("hams_token");

    localStorage.removeItem("hams_user");
    localStorage.removeItem("hams_token");

    return <Navigate to="/login" replace />;
  }
}
