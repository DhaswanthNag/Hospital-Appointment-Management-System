// src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "patient",
  });

  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.type === "checkbox") {
      setAgree(e.target.checked);
      return;
    }
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name.trim()) return "Name required";
    if (!form.email.includes("@")) return "Invalid email";
    if (form.password.length < 6)
      return "Password must be at least 6 characters";
    if (!agree) return "You must agree to the terms";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/auth/register", form);

      navigate("/login");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-50 to-lime-100 py-7 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join Q-Medico and manage your healthcare appointments</p>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl border border-lime-100 flex flex-col justify-between">
            <div className="bg-lime-600 bg-gradient-to-br from-lime-400 to-lime-500 pt-4 pb-2 rounded-t-2xl text-center text-white">
              <div className="mx-auto h-14 w-14 bg-white rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-lime-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3c3.08 0 5.5 2.42 5.5 5.5 0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">Hospital Appointment Management System</h1>
              <p className="text-lime-100 text-base mb-0">Q-Medico</p>
            </div>

            <div className="p-8">
              <p className="text-gray-600 mb-8 text-lg">
                Dedicated to improving patient experience and operational efficiency through seamless digital health integration.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full border-2 border-lime-600 flex items-center justify-center mr-3">
                    <div className="w-3 h-3 bg-lime-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Instant lab result notifications</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full border-2 border-lime-600 flex items-center justify-center mr-3">
                    <div className="w-3 h-3 bg-lime-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Appointment scheduling</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full border-2 border-lime-600 flex items-center justify-center mr-3">
                    <div className="w-3 h-3 bg-lime-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Medical records tracking</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full border-2 border-lime-600 flex items-center justify-center mr-3">
                    <div className="w-3 h-3 bg-lime-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Doctor & staff management</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-lime-100">
            {error && <div className="text-red-600">{error}</div>}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input id="name" name="name" type="text" value={form.name} onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-lime-400 transition duration-300"
                    required />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-lime-400 transition duration-300"
                    required />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input id="password" name="password" type="password" value={form.password} onChange={handleChange}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-lime-400 transition duration-300"
                    required />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <select id="role" name="role" value={form.role} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-lime-400 transition duration-300 appearance-none bg-white">
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start mt-6">
              <input id="terms" name="terms" type="checkbox" checked={agree} onChange={handleChange}
                className="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-300 rounded mt-1" />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-lime-600 hover:text-lime-500 font-medium">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-lime-600 hover:text-lime-500 font-medium">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-lime-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors duration-200 mt-6">
              {loading ? 'Creating...' : 'Create Account'}
            </button>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="text-center">
              <Link to="/login" className="font-medium text-lime-600 hover:text-lime-500 transition-colors">Sign in to your account</Link>
            </div>
          </form>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">Secure registration protected by healthcare privacy standards</p>
        </div>
      </div>
    </div>
  );
}
