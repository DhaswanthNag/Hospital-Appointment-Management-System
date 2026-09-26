import React, { useState, useEffect, useContext, useCallback } from "react";
import UserSidebar from "../../sidebar/UserSidebar";
import Appointment from "./Appointment";
import Prescription from "./Prescription";
import Profile from "./Profile";
import Billingandpayment from "./Billingandpayment";
// import LabResults from "./LabResults";
// import PropTypes from "prop-types";
import { AuthContext } from "../../context/AuthContext";
// import { API_BASE_URL } from "../../config";
import api from "../../api/api";
import {
  Calendar,
  Clock,
  // User,
  Bell,
  FileText,
  FlaskConical,
  //CreditCard,
  History,
  Stethoscope,
 // X,
 // CheckCircle
} from "lucide-react";

// const API_BASE = API_BASE_URL || "http://localhost:8080/api";

const UserDashboard = () => {
  const { user } = useContext(AuthContext);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState("dashboard");

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [appointmentError, setAppointmentError] = useState(null);
  const [confirmingAppointmentId, setConfirmingAppointmentId] = useState(null);

  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);

  // Existing dashboard data
  // Removed sample appointment data because dashboard now uses real backend appointment data.
  // Removed sample lab result data because there is no connected lab-result backend yet.
  // Removed sample billing data because billing now uses the real backend billing API.
  // Visit history now uses real completed appointments from the backend.

  // Step 1: resolve the logged-in patient's real patientId (PAT00x) from email
  useEffect(() => {
    const getLoggedInUser = () => {
      // First use AuthContext user if available
      if (user?.email) {
        return user;
      }

      // Fallback to the user stored by Login.jsx
      try {
        const savedHamsUser = localStorage.getItem("hams_user");

        if (savedHamsUser) {
          return JSON.parse(savedHamsUser);
        }
      } catch (error) {
        console.error("Failed to read hams_user from localStorage:", error);
      }

      // Fallback to the old "user" storage key
      try {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
          return JSON.parse(savedUser);
        }
      } catch (error) {
        console.error("Failed to read user from localStorage:", error);
      }

      return null;
    };

    const loggedInUser = getLoggedInUser();

    console.log("UserDashboard - Logged in user:", loggedInUser);

    if (!loggedInUser?.email) {
      console.log("UserDashboard - No logged-in user email found.");
      setAppointmentError("Could not identify the logged-in patient.");
      return;
    }

    api
      .get("/api/patients")
      .then((response) => {
        const patients = Array.isArray(response.data)
          ? response.data
          : [];

        console.log("UserDashboard - Patients from backend:", patients);

        const loggedInEmail = loggedInUser.email.trim().toLowerCase();

        const match = patients.find(
          (p) =>
            p.email &&
            p.email.trim().toLowerCase() === loggedInEmail
        );

        console.log("UserDashboard - Matched patient:", match);

        if (match) {
          setPatient(match);
          setAppointmentError(null);
        } else {
          console.log(
            "UserDashboard - No patient matched email:",
            loggedInEmail
          );

          setAppointmentError(
            "No patient record found for this account."
          );
        }
      })
      .catch((err) => {
        console.error("Failed to load patients:", err);
        setAppointmentError("Could not verify patient identity.");
      });
  }, [user]);

  // Step 2: fetch this patient's real appointments
  const fetchPatientAppointments = useCallback(async () => {
    // Support both possible backend patient ID field names
    const patientId = patient?.patientId || patient?.id;

    if (!patientId) {
      console.log(
        "UserDashboard - Patient ID not available yet:",
        patient
      );
      return;
    }

    setAppointmentLoading(true);

    try {
      console.log(
        "UserDashboard - Fetching appointments for patient:",
        patientId
      );

      const response = await api.get(
        `/api/appointments/patient/${patientId}`
      );

      const data = response.data;

      console.log(
        "UserDashboard - Appointments received:",
        data
      );

      setAppointments(Array.isArray(data) ? data : []);
      setAppointmentError(null);
    } catch (error) {
      console.error("Failed to load patient appointments:", error);
      console.error(
        "UserDashboard - Appointment API response:",
        error?.response?.data
      );

      setAppointments([]);
      setAppointmentError("Could not load your appointments.");
    } finally {
      setAppointmentLoading(false);
    }
  }, [patient]);

  useEffect(() => {
    fetchPatientAppointments();
  }, [fetchPatientAppointments]);

  // Step 3: poll every 5 seconds so new admin appointments appear automatically
  useEffect(() => {
    const patientId = patient?.patientId || patient?.id;

    if (!patientId) return;

    const interval = setInterval(() => {
      fetchPatientAppointments();
    }, 5000);

    return () => clearInterval(interval);
  }, [patient, fetchPatientAppointments]);

  // Fetch this patient's real prescriptions
  const fetchPatientPrescriptions = useCallback(async () => {
    const patientId = patient?.patientId || patient?.id;

    if (!patientId) {
      console.log(
        "UserDashboard - Patient ID not available for prescriptions:",
        patient
      );
      return;
    }

    setPrescriptionLoading(true);

    try {
      console.log(
        "UserDashboard - Fetching prescriptions for patient:",
        patientId
      );

      const response = await api.get(
        `/api/prescriptions/patient/${patientId}`
      );

      const data = response.data;

      console.log(
        "UserDashboard - Prescriptions received:",
        data
      );

      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Failed to load patient prescriptions:",
        error
      );

      console.error(
        "UserDashboard - Prescription API response:",
        error?.response?.data
      );

      setPrescriptions([]);
    } finally {
      setPrescriptionLoading(false);
    }
  }, [patient]);

  useEffect(() => {
    fetchPatientPrescriptions();
  }, [fetchPatientPrescriptions]);

  // Confirm a pending appointment
  const handleConfirmAppointment = async (appointment) => {
    if (!appointment?.id) {
      return;
    }

    try {
      setConfirmingAppointmentId(appointment.id);
      setAppointmentError(null);

      await api.put(`/api/appointments/${appointment.id}`, {
        ...appointment,
        status: "confirmed",
      });

      await fetchPatientAppointments();
    } catch (error) {
      console.error("Failed to confirm appointment:", error);
      console.error(
        "UserDashboard - Confirm appointment API response:",
        error?.response?.data
      );
      setAppointmentError(
        error?.response?.data?.message ||
          "Could not confirm the appointment. Please try again."
      );
    } finally {
      setConfirmingAppointmentId(null);
    }
  };

  // Real appointments that are currently pending
  const pendingAppointments = appointments.filter(
    (appointment) =>
      appointment.status?.toLowerCase() === "pending"
  );

  // Real appointments that are not cancelled
  const activeAppointments = appointments.filter(
    (appointment) =>
      appointment.status?.toLowerCase() !== "cancelled"
  );

  // Real completed appointments used as medical history
  const completedAppointments = appointments.filter(
    (appointment) =>
      appointment.status?.toLowerCase() === "completed"
  );

  const formatAppointmentDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatAppointmentTime = (timeString) => {
    if (!timeString) return "";

    const [hours, minutes] = timeString.split(":");

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    });
  };

  const getAppointmentStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      case "rescheduled":
        return "bg-blue-100 text-blue-700";

      case "completed":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getDoctorName = (doctorId) => {
    return doctorId || "Doctor";
  };

  const getFirstMedicine = (prescription) => {
    if (
      !prescription?.medicines ||
      prescription.medicines.length === 0
    ) {
      return null;
    }

    return prescription.medicines[0];
  };

  const renderDashboard = () => {
    return (
      <div className="space-y-6 w-full">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-lime-500 to-lime-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.name || patient?.firstName || "Patient"}!
          </h1>
          <p className="text-lime-100">
            Here&apos;s an overview of your healthcare information.
          </p>
        </div>

        {/* NEW REAL APPOINTMENT NOTIFICATIONS */}
        {pendingAppointments.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 p-2 rounded-full">
                <Bell className="h-5 w-5 text-yellow-600" />
              </div>

              <div>
                <h2 className="font-bold text-yellow-800">
                  New Appointment Notification
                  {pendingAppointments.length > 1 ? "s" : ""}
                </h2>

                <p className="text-sm text-yellow-700">
                  Admin has scheduled{" "}
                  {pendingAppointments.length} appointment
                  {pendingAppointments.length > 1 ? "s" : ""} for you.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {pendingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white border border-yellow-200 rounded-xl p-4 sm:p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 break-words">
                        {appointment.doctorName}
                      </h3>

                      <p className="text-sm text-lime-600 font-medium mt-1">
                        {appointment.department}
                      </p>
                    </div>

                    <span className="inline-flex w-fit shrink-0 items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                      <Clock className="h-3 w-3" />
                      Pending
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-lime-600" />
                      {formatAppointmentDate(appointment.date)}
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-lime-600" />
                      {formatAppointmentTime(appointment.time)}
                    </div>

                    <div className="flex items-center gap-2">
                      <StethoscopeIcon />
                      {appointment.type}
                    </div>

                    {appointment.reason && (
                      <div className="flex items-start gap-2 min-w-0">
                        <FileText className="h-4 w-4 shrink-0 text-lime-600 mt-0.5" />
                        <span className="break-words">{appointment.reason}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleConfirmAppointment(appointment)}
                      disabled={confirmingAppointmentId === appointment.id}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-lime-600 text-white text-sm font-semibold hover:bg-lime-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {confirmingAppointmentId === appointment.id
                        ? "Confirming..."
                        : "Confirm Appointment"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {appointmentError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {appointmentError}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {activeAppointments.length}
                </p>
              </div>

              <div className="bg-lime-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-lime-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Prescriptions</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {prescriptions.length}
                </p>
              </div>

              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Lab Results</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  0
                </p>
              </div>

              <div className="bg-purple-100 p-3 rounded-lg">
                <FlaskConical className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Medical History</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {completedAppointments.length}
                </p>
              </div>

              <div className="bg-orange-100 p-3 rounded-lg">
                <History className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Upcoming Appointments
            </h2>

            {appointmentLoading && (
              <span className="text-xs text-gray-400">
                Updating...
              </span>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {activeAppointments.length > 0 ? (
              activeAppointments.slice(0, 5).map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-lime-100 p-3 rounded-lg">
                      <Calendar className="h-5 w-5 text-lime-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {appointment.doctorName}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {appointment.department}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {formatAppointmentDate(appointment.date)} •{" "}
                        {formatAppointmentTime(appointment.time)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getAppointmentStatusClass(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto" />
                <p className="text-gray-500 mt-2">
                  No appointments available.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Prescriptions
            </h2>

            {prescriptionLoading && (
              <span className="text-xs text-gray-400">
                Updating...
              </span>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {prescriptions.length > 0 ? (
              prescriptions.slice(0, 5).map((prescription) => {
                const medicine = getFirstMedicine(prescription);

                return (
                  <div
                    key={prescription.id}
                    className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {medicine?.medicineName || "Prescription"}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {medicine?.dosage || "Dosage not specified"} •{" "}
                          {medicine?.frequency || "Frequency not specified"}
                        </p>

                        <p className="text-sm text-gray-500">
                          Diagnosis:{" "}
                          {prescription.diagnosis || "Not specified"}
                        </p>

                        <p className="text-sm text-gray-500">
                          Doctor: {getDoctorName(prescription.doctorId)}
                        </p>
                      </div>
                    </div>

                    <span className="text-sm text-gray-500">
                      {prescription.prescriptionDate}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-500">
                No prescriptions available.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLabResults = () => {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Lab Results
          </h1>
          <p className="text-gray-500 mt-1">
            View your available laboratory results.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FlaskConical className="w-12 h-12 text-gray-300 mx-auto" />

          <h3 className="font-semibold text-gray-700 mt-3">
            No laboratory results available
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Laboratory results will appear here when the lab-results backend module is connected.
          </p>
        </div>
      </div>
    );
  };

  const renderPayments = () => {
    return (
      <Billingandpayment
        patientId={patient?.patientId || patient?.id}
      />
    );
  };

  const renderMedicalHistory = () => {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Medical History
          </h1>
          <p className="text-gray-500 mt-1">
            View your previous visits.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
          {completedAppointments.length > 0 ? (
            completedAppointments.map((visit) => (
              <div key={visit.id} className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {visit.doctorName || "Doctor"}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {visit.department || "Department not specified"}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {formatAppointmentDate(visit.date)}
                      {visit.reason
                        ? ` • ${visit.reason}`
                        : ""}
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    {visit.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <History className="h-10 w-10 text-gray-300 mx-auto" />

              <h3 className="font-semibold text-gray-700 mt-3">
                No medical history available
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Completed appointments will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderModuleContent = () => {
    switch (activeModule) {
      case "dashboard":
        return renderDashboard();

      case "appointments":
        return <Appointment />;

      case "profile":
        return <Profile />;

      case "prescriptions":
        return (
          <Prescription
            patientId={patient?.patientId || patient?.id}
          />
        );

      case "lab-results":
        return renderLabResults();

      case "payments":
        return renderPayments();

      case "medical-history":
        return renderMedicalHistory();

      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      <UserSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />

      <main className="flex-1 min-w-0 transition-all duration-300">
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {renderModuleContent()}
        </div>
      </main>
    </div>
  );
};

const StethoscopeIcon = () => (
  <Stethoscope className="h-4 w-4 text-lime-600" />
);

export default UserDashboard;