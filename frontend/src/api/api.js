// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto attach JWT token
api.interceptors.request.use((config) => {
  // Use sessionStorage for the current login session
  // Keep localStorage as fallback for existing stored sessions
  const token =
    sessionStorage.getItem("hams_token") ||
    localStorage.getItem("hams_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
