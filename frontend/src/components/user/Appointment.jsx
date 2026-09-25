import React, { useState, useEffect, useContext, useCallback } from "react";
import { Calendar, Clock, User, Bell, FileText, Stethoscope, CheckCircle, RefreshCw } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";

const Appointment = () => {
  const { user } = useContext(AuthContext);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmingAppointmentId, setConfirmingAppointmentId] = useState(null);

  const getLoggedInUser = useCallback(() => {
    if (user?.email) {
      return user;
    }

    try {
      const savedHamsUser = localStorage.getItem("hams_user");
      if (savedHamsUser) {
        return JSON.parse(savedHamsUser);
      }
    } catch (storageError) {
      console.error("Failed to read hams_user from localStorage:", storageError);
    }

    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (storageError) {
      console.error("Failed to read user from localStorage:", storageError);
    }

    return null;
  }, [user]);

  const fetchPatient = useCallback(async () => {
    const loggedInUser = getLoggedInUser();

    if (!loggedInUser?.email) {
      setError("Could not identify the logged-in patient.");
      return null;
    }

    try {
      const response = await api.get("/api/patients");
      const patients = Array.isArray(response.data) ? response.data : [];
      const loggedInEmail = loggedInUser.email.trim().toLowerCase();

      const match = patients.find(
        (p) =>
          p.email &&
          p.email.trim().toLowerCase() === loggedInEmail
      );

      if (!match) {
        setError("No patient record found for this account.");
        return null;
      }

      setPatient(match);
      setError(null);
      return match;
    } catch (fetchError) {
      console.error("Failed to load patient:", fetchError);
      setError("Could not verify patient identity.");
      return null;
    }
  }, [getLoggedInUser]);

  const fetchAppointments = useCallback(async (patientData = patient) => {
    const patientId = patientData?.patientId || patientData?.id;

    if (!patientId) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/api/appointments/patient/${patientId}`);
      const data = Array.isArray(response.data) ? response.data : [];
      setAppointments(data);
      setError(null);
    } catch (fetchError) {
      console.error("Failed to load patient appointments:", fetchError);
      console.error("Appointment API response:", fetchError?.response?.data);
      setAppointments([]);
      setError("Could not load your appointments.");
    } finally {
      setLoading(false);
    }
  }, [patient]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  useEffect(() => {
    if (patient) {
      fetchAppointments(patient);
    }
  }, [patient, fetchAppointments]);

  useEffect(() => {
    if (!patient) {
      return undefined;
    }

    const interval = setInterval(() => {
      fetchAppointments(patient);
    }, 5000);

    return () => clearInterval(interval);
  }, [patient, fetchAppointments]);

  const handleConfirmAppointment = async (appointment) => {
    if (!appointment?.id) {
      return;
    }

    try {
      setConfirmingAppointmentId(appointment.id);

      await api.put(`/api/appointments/${appointment.id}`, {
        ...appointment,
        status: "confirmed",
      });

      await fetchAppointments(patient);
    } catch (confirmError) {
      console.error("Failed to confirm appointment:", confirmError);
      console.error("Confirm appointment API response:", confirmError?.response?.data);
      alert("Unable to confirm the appointment. Please try again.");
    } finally {
      setConfirmingAppointmentId(null);
    }
  };

  const formatAppointmentDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAppointmentTime = (timeString) => {
    if (!timeString) return "";

    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getAppointmentStatusClass = (status) => {
    switch (status?.toLowerCase()) {
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

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status?.toLowerCase() === "pending"
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            My Appointments
          </h1>
          <p className="text-gray-500 mt-1">
            View and confirm appointments scheduled by the hospital.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchAppointments(patient)}
          disabled={loading || !patient}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>
      )}

      {pendingAppointments.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-yellow-100 p-2 rounded-full shrink-0">
              <Bell className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="font-bold text-yellow-800">
                New Appointment Notification
                {pendingAppointments.length > 1 ? "s" : ""}
              </h2>
              <p className="text-sm text-yellow-700 mt-1">
                You have {pendingAppointments.length} pending appointment
                {pendingAppointments.length > 1 ? "s" : ""}. Please review and confirm.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {pendingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white border border-yellow-200 rounded-xl p-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="bg-lime-100 p-2.5 rounded-lg shrink-0">
                        <Stethoscope className="h-5 w-5 text-lime-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {appointment.doctorName || "Doctor"}
                        </h3>
                        <p className="text-sm text-lime-600 font-medium">
                          {appointment.department || "Department not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-lime-600 shrink-0" />
                        <span>{formatAppointmentDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-lime-600 shrink-0" />
                        <span>{formatAppointmentTime(appointment.time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-lime-600 shrink-0" />
                        <span>{appointment.type || "Appointment"}</span>
                      </div>
                      {appointment.reason && (
                        <div className="flex items-start gap-2 sm:col-span-2">
                          <FileText className="h-4 w-4 text-lime-600 shrink-0 mt-0.5" />
                          <span>{appointment.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                      Pending
                    </span>
                    <button
                      type="button"
                      onClick={() => handleConfirmAppointment(appointment)}
                      disabled={confirmingAppointmentId === appointment.id}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-lime-500 text-white font-medium hover:bg-lime-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {confirmingAppointmentId === appointment.id
                        ? "Confirming..."
                        : "Confirm Appointment"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              All Appointments
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Your appointments are updated automatically.
            </p>
          </div>
          {loading && (
            <span className="text-sm text-gray-500">Updating...</span>
          )}
        </div>

        {appointments.length === 0 ? (
          <div className="p-10 md:p-14 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-600">No appointments found.</p>
            <p className="text-sm mt-1">New appointments scheduled for you will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="p-5 md:p-6">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-4">
                      <div className="bg-lime-100 p-3 rounded-lg shrink-0">
                        <User className="h-5 w-5 text-lime-600" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-base md:text-lg truncate">
                          {appointment.doctorName || "Doctor"}
                        </h3>
                        <p className="text-sm text-lime-600 font-medium mt-1">
                          {appointment.department || "Department not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 ml-0 md:ml-16">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-lime-600 shrink-0" />
                        <span>{formatAppointmentDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-lime-600 shrink-0" />
                        <span>{formatAppointmentTime(appointment.time)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Stethoscope className="h-4 w-4 text-lime-600 shrink-0" />
                        <span>{appointment.type || "Appointment"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4 text-lime-600 shrink-0" />
                        <span>{appointment.appointmentId || "N/A"}</span>
                      </div>
                    </div>

                    {appointment.reason && (
                      <div className="mt-3 ml-0 md:ml-16 text-sm text-gray-600">
                        <span className="font-medium text-gray-700">Reason:</span>{" "}
                        {appointment.reason}
                      </div>
                    )}

                    {appointment.notes && (
                      <div className="mt-2 ml-0 md:ml-16 text-sm text-gray-600">
                        <span className="font-medium text-gray-700">Notes:</span>{" "}
                        {appointment.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row xl:flex-col items-center xl:items-end gap-3 shrink-0">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${getAppointmentStatusClass(
                        appointment.status
                      )}`}
                    >
                      {appointment.status || "Unknown"}
                    </span>

                    {appointment.status?.toLowerCase() === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleConfirmAppointment(appointment)}
                        disabled={confirmingAppointmentId === appointment.id}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-lime-500 text-white text-sm font-medium hover:bg-lime-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {confirmingAppointmentId === appointment.id
                          ? "Confirming..."
                          : "Confirm"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointment;