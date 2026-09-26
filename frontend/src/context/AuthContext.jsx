import React, { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const savedUser = sessionStorage.getItem("hams_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Unable to restore logged-in user:", error);
        sessionStorage.removeItem("hams_user");
        sessionStorage.removeItem("hams_token");
      }
    }
  }, []);
  const login = (userData, token) => {
    if (!userData) {
      return;
    }
    sessionStorage.setItem("hams_user", JSON.stringify(userData));
    if (token) {
      sessionStorage.setItem("hams_token", token);
    }
    setUser(userData);
  };
  const logout = () => {
    sessionStorage.removeItem("hams_user");
    sessionStorage.removeItem("hams_token");
    localStorage.removeItem("user");
    localStorage.removeItem("hams_user");
    localStorage.removeItem("hams_token");
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};