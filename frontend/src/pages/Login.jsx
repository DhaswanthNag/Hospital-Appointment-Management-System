// src/pages/login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Enter email & password");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/api/auth/login", form);

      const data = response.data;

      if (!data || !data.token) {
        setError("Invalid response from server");
        return;
      }

      localStorage.setItem("hams_token", data.token);
      localStorage.setItem("hams_user", JSON.stringify(data.user));

      const role =
        data.user.role?.name || data.user.role || "patient";

      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "doctor") navigate("/doctor/dashboard");
      else navigate("/user/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-lime-50 to-lime-100 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full space-y-6 mt-4 mb-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your Q-Medico account</p>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-lime-100">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">Hospital Appointment Management System</h1>
            <div className="border-t border-gray-200 pt-6" />
            <p className="text-gray-600 mb-8 text-lg">
              Empowering healthcare organizations with a centralized solution to manage patient appointments.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full border-2 border-lime-600 flex items-center justify-center mr-3">
                  <div className="w-3 h-3 bg-lime-600 rounded-full" />
                </div>
                <span className="text-gray-700">Patient data management</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full border-2 border-lime-600 flex items-center justify-center mr-3">
                  <div className="w-3 h-3 bg-lime-600 rounded-full" />
                </div>
                <span className="text-gray-700">Appointment scheduling</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full border-2 border-lime-600 flex items-center justify-center mr-3">
                  <div className="w-3 h-3 bg-lime-600 rounded-full" />
                </div>
                <span className="text-gray-700">Medical records tracking</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full border-2 border-lime-600 flex items-center justify-center mr-3">
                  <div className="w-3 h-3 bg-lime-600 rounded-full" />
                </div>
                <span className="text-gray-700">Doctor & staff management</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl space-y-6 border border-lime-100">
            <div className="bg-lime-600 bg-gradient-to-br from-lime-400 to-lime-500 py-3 rounded-t-2xl text-center">
              <div className="mx-auto h-14 w-14 bg-white rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-lime-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {error && <div className="text-red-600">{error}</div>}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-md font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-lime-400 transition duration-300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-md font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-lime-400 transition duration-300"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <Link to="#" className="font-medium text-lime-600 hover:text-lime-500 transition-colors">Forgot your password?</Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-lime-400 to-lime-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in to your account'
                  )}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">New to Q-Medico?</span>
                </div>
              </div>

              <div className="text-center">
                <Link to="/register" className="font-medium text-lime-600 hover:text-lime-500 transition-colors">Create your account</Link>
              </div>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 mt-4 mb-4">By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}
