// App.js (FULLY FIXED WITH ROLE BASED ROUTING)

import React from "react";
import { Routes, Route } from "react-router-dom";

// ProtectedRoute
import ProtectedRoute from "./ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorList from "./pages/DoctorList";
import DoctorForm from "./pages/DoctorForm";
import DoctorProfile from "./pages/DoctorProfile";
import AppointmentBooking from "./pages/AppointmentBooking";
import PatientAppointments from "./pages/PatientAppointments";
import AdminPanel from "./pages/AdminPanel";

// Admin Components
import Dashboard from "./components/admin/Dashboard";
import AdminSidebar from "./sidebar/AdminSidebar";

// Doctor Components
import DoctorSidebar from "./sidebar/DoctorSidebar";
import DoctorDashboard from "./components/doctor/DoctorDashboard";

// User Components
import UserDashboard from "./components/user/UserDashboard";
import UserSidebar from "./sidebar/UserSidebar";

// Common Components
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <Routes>
        {/* ---------------------- PUBLIC ROUTES ----------------------- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/patient/dashboard" element={<UserDashboard />} />

        {/* Doctors (Public) */}
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/doctors/add" element={<DoctorForm />} />
        <Route path="/doctors/:id" element={<DoctorProfile />} />
        <Route path="/doctors/:id/edit" element={<DoctorForm edit={true} />} />

        {/* Appointments (Public book, but user should login to view own appointments) */}
        <Route path="/book/:doctorId" element={<AppointmentBooking />} />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute allowedRoles={["patient", "user"]}>
              <PatientAppointments />
            </ProtectedRoute>
          }
        />

        {/* ---------------------- ADMIN PROTECTED ROUTES ----------------------- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/adminsidebar"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSidebar />
            </ProtectedRoute>
          }
        />

        {/* ---------------------- DOCTOR PROTECTED ROUTES ----------------------- */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctorsidebar"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorSidebar />
            </ProtectedRoute>
          }
        />

        {/* ---------------------- USER / PATIENT PROTECTED ROUTES ----------------------- */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRoles={["patient", "user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/usersidebar"
          element={
            <ProtectedRoute allowedRoles={["patient", "user"]}>
              <UserSidebar />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
