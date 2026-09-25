import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo
} from 'react';
import DoctorSidebar from "../../sidebar/DoctorSidebar";
// import { Download, Eye, Pencil } from "lucide-react";
import { Calendar, Users, Clock, CheckCircle, User, RefreshCw, Stethoscope } from "lucide-react";
import AppointmentManagement from './Appointment';
import Prescription from './Prescription';
import PatientManagement from './PatientManagement';
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";
const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState('appointments');
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // MUST BE ADDED (Your DoctorSidebar uses this)
  // const modules = [
  //   { id: 'appointments', description: 'View & confirm appointments' },
  //   { id: 'my-patients', description: 'View assigned patients' },
  //   { id: 'prescriptions', description: 'Create/Edit prescriptions' },
  //   { id: 'lab-results', description: 'Request/View lab results' },
  //   { id: 'reports', description: 'View doctor reports' },
  // ];
  // Get the currently logged-in user
  const getLoggedInUser = useCallback(() => {
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
    } catch (storageError) {
      console.error(
        "DoctorDashboard - Failed to read hams_user:",
        storageError
      );
    }
    // Fallback to the old "user" storage key
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (storageError) {
      console.error(
        "DoctorDashboard - Failed to read user:",
        storageError
      );
    }
    return null;
  }, [user]);
  // Resolve the logged-in doctor's real doctor ID
  const resolveDoctor = useCallback(async () => {
    const loggedInUser = getLoggedInUser();
    console.log(
      "DoctorDashboard - Logged in user:",
      loggedInUser
    );
    if (!loggedInUser?.email) {
      throw new Error(
        "Could not identify the logged-in doctor."
      );
    }
    const response = await api.get("/api/doctors");
    const doctors = Array.isArray(response.data)
      ? response.data
      : [];
    console.log(
      "DoctorDashboard - Doctors from backend:",
      doctors
    );
    const loggedInEmail =
      loggedInUser.email.trim().toLowerCase();
    const matchedDoctor = doctors.find(
      (doctorRecord) =>
        doctorRecord.email &&
        doctorRecord.email.trim().toLowerCase() ===
          loggedInEmail
    );
    console.log(
      "DoctorDashboard - Matched doctor:",
      matchedDoctor
    );
    if (!matchedDoctor) {
      throw new Error(
        "No doctor record found for this account."
      );
    }
    setDoctor(matchedDoctor);
    return matchedDoctor;
  }, [getLoggedInUser]);
  // Load real doctors, patients and appointments from backend
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const matchedDoctor = await resolveDoctor();
      const doctorId = matchedDoctor?.id;
      if (!doctorId) {
        throw new Error(
          "Doctor ID is not available."
        );
      }
      const [patientResponse, appointmentResponse] =
        await Promise.all([
          api.get("/api/patients"),
          api.get(
            `/api/appointments/doctor/${doctorId}`
          )
        ]);
      const patientData = Array.isArray(
        patientResponse.data
      )
        ? patientResponse.data
        : [];
      const appointmentData = Array.isArray(
        appointmentResponse.data
      )
        ? appointmentResponse.data
        : [];
      setPatients(patientData);
      setAppointments(appointmentData);
      console.log(
        "DoctorDashboard - Patients from backend:",
        patientData
      );
      console.log(
        "DoctorDashboard - Appointments from backend:",
        appointmentData
      );
    } catch (err) {
      console.error(
        "DoctorDashboard - Failed to load dashboard data:",
        err
      );
      console.error(
        "DoctorDashboard - API response:",
        err?.response?.data
      );
      setDoctor(null);
      setPatients([]);
      setAppointments([]);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not load doctor dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, [resolveDoctor]);
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  // Get patient ID from an appointment
  const getAppointmentPatientId = useCallback(
    (appointment) => {
      return (
        appointment?.patientId ||
        appointment?.patient?.patientId ||
        appointment?.patient?.id ||
        null
      );
    },
    []
  );
  // Find patient record from appointment
  const getPatientFromAppointment = useCallback(
    (appointment) => {
      const appointmentPatientId =
        getAppointmentPatientId(appointment);
      if (!appointmentPatientId) {
        return null;
      }
      return patients.find((patient) => {
        const patientId =
          patient.patientId || patient.id;
        return (
          String(patientId) ===
          String(appointmentPatientId)
        );
      });
    },
    [patients, getAppointmentPatientId]
  );
  // Find patients assigned to this doctor through appointments
  const assignedPatients = useMemo(() => {
    const patientMap = new Map();
    appointments.forEach((appointment) => {
      const patient =
        getPatientFromAppointment(appointment);
      if (!patient) {
        return;
      }
      const patientId =
        patient.patientId || patient.id;
      patientMap.set(
        String(patientId),
        patient
      );
    });
    return Array.from(patientMap.values());
  }, [
    appointments,
    getPatientFromAppointment
  ]);
  // Real appointment statistics
  const appointmentStats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter(
      (appointment) =>
        String(appointment.status || "")
          .toLowerCase() === "pending"
    ).length;
    const confirmed = appointments.filter(
      (appointment) =>
        String(appointment.status || "")
          .toLowerCase() === "confirmed"
    ).length;
    const completed = appointments.filter(
      (appointment) =>
        String(appointment.status || "")
          .toLowerCase() === "completed"
    ).length;
    const cancelled = appointments.filter(
      (appointment) =>
        String(appointment.status || "")
          .toLowerCase() === "cancelled"
    ).length;
    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled
    };
  }, [appointments]);
  // Upcoming appointments
  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointments
      .filter((appointment) => {
        const status = String(
          appointment.status || ""
        ).toLowerCase();
        if (
          status === "cancelled" ||
          status === "completed"
        ) {
          return false;
        }
        if (!appointment.date) {
          return true;
        }
        const appointmentDate = new Date(
          `${appointment.date}T00:00:00`
        );
        return appointmentDate >= today;
      })
      .sort((a, b) => {
        const dateA = new Date(
          `${a.date || "9999-12-31"}T${
            a.time || "23:59"
          }`
        );
        const dateB = new Date(
          `${b.date || "9999-12-31"}T${
            b.time || "23:59"
          }`
        );
        return dateA - dateB;
      });
  }, [appointments]);
  // Patients count
  const patientStats = useMemo(() => {
    const total = assignedPatients.length;
    const active = assignedPatients.filter(
      (patient) =>
        String(patient.status || "active")
          .toLowerCase() === "active"
    ).length;
    const inactive = assignedPatients.filter(
      (patient) =>
        String(patient.status || "")
          .toLowerCase() === "inactive"
    ).length;
    return {
      total,
      active,
      inactive
    };
  }, [assignedPatients]);
  const getPatientName = (appointment) => {
    const patient =
      getPatientFromAppointment(appointment);
    if (patient) {
      return `${patient.firstName || ""} ${
        patient.lastName || ""
      }`.trim() || "Unknown Patient";
    }
    if (appointment?.patientName) {
      return appointment.patientName;
    }
    if (appointment?.patient?.name) {
      return appointment.patient.name;
    }
    return "Unknown Patient";
  };
  const formatAppointmentDate = (date) => {
    if (!date) return "Date not available";
    const parsedDate = new Date(
      `${date}T00:00:00`
    );
    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }
    return parsedDate.toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    );
  };
  const formatAppointmentTime = (time) => {
    if (!time) return "Time not available";
    const [hours, minutes] =
      time.split(":");
    const parsedDate = new Date();
    parsedDate.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );
    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return time;
    }
    return parsedDate.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit"
      }
    );
  };
  const getStatusClass = (status) => {
    switch (
      String(status || "")
        .toLowerCase()
    ) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "rescheduled":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  // Sample data
  // Removed: dashboard now uses real backend appointment data.
  // Removed: dashboard now uses real backend patient data.
  // Removed: lab result sample data because there is no connected lab-result backend yet.
  const renderAppointments = () => (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Manage and confirm your upcoming appointments
            </h2>
            {doctor && (
              <p className="text-gray-500 mt-1">
                Dr. {doctor.name}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={loadDashboardData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-lime-500 text-white text-sm font-medium hover:bg-lime-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}
        {/* Real Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Total Patients */}
          <div className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Patients
                </p>
                <p className="text-3xl font-bold mt-2 text-gray-800">
                  {loading
                    ? "..."
                    : patientStats.total}
                </p>
              </div>
              <div className="bg-lime-100 p-3 rounded-lg">
                <Users
                  size={22}
                  className="text-lime-600"
                />
              </div>
            </div>
          </div>
          {/* Appointments This Month */}
          <div className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Appointments
                </p>
                <p className="text-3xl font-bold mt-2 text-gray-800">
                  {loading
                    ? "..."
                    : appointmentStats.total}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar
                  size={22}
                  className="text-blue-600"
                />
              </div>
            </div>
          </div>
          {/* Pending Appointments */}
          <div className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Pending Appointments
                </p>
                <p className="text-3xl font-bold mt-2 text-gray-800">
                  {loading
                    ? "..."
                    : appointmentStats.pending}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock
                  size={22}
                  className="text-yellow-600"
                />
              </div>
            </div>
          </div>
          {/* Completed Appointments */}
          <div className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Completed Appointments
                </p>
                <p className="text-3xl font-bold mt-2 text-gray-800">
                  {loading
                    ? "..."
                    : appointmentStats.completed}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle
                  size={22}
                  className="text-green-600"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Upcoming Appointments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Upcoming Appointments
            </h3>
            {loading && (
              <span className="text-xs text-gray-400">
                Loading...
              </span>
            )}
          </div>
          {loading ? (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <RefreshCw
                className="h-6 w-6 text-lime-600 animate-spin mx-auto"
              />
              <p className="text-gray-500 mt-2">
                Loading appointments...
              </p>
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <Calendar className="h-10 w-10 text-gray-300 mx-auto" />
              <h3 className="font-semibold text-gray-700 mt-3">
                No upcoming appointments
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Appointments assigned to you will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments
                .slice(0, 10)
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-lime-100 p-3 rounded-lg shrink-0">
                          <User
                            size={20}
                            className="text-lime-600"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {getPatientName(
                              appointment
                            )}
                          </h3>
                          <p className="text-gray-600">
                            {appointment.type ||
                              appointment.procedure ||
                              "Consultation"}
                          </p>
                          {appointment.department && (
                            <p className="text-sm text-gray-500">
                              {appointment.department}
                            </p>
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
                            <p className="text-sm text-gray-500">
                              {formatAppointmentDate(
                                appointment.date
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatAppointmentTime(
                                appointment.time
                              )}
                            </p>
                          </div>
                          {appointment.room && (
                            <p className="text-sm text-gray-500 mt-1">
                              {appointment.room}
                            </p>
                          )}
                          {appointment.reason && (
                            <p className="text-sm text-gray-500 mt-1">
                              Reason:{" "}
                              {appointment.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`px-4 py-2 rounded-full text-xs font-semibold capitalize ${getStatusClass(
                            appointment.status
                          )}`}
                        >
                          {appointment.status ||
                            "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  const renderMyPatients = () => (
    <PatientManagement
      doctorId={doctor?.id}
    />
  );
  const renderPrescriptions = () => (
    <Prescription />
  );
  const renderLabResults = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Request and view laboratory test results
        </h2>
        <div className="border border-gray-200 rounded-xl p-8 text-center">
          <Stethoscope className="h-10 w-10 text-gray-300 mx-auto" />
          <h3 className="font-semibold text-gray-700 mt-3">
            No laboratory results available
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Laboratory results will appear here when the lab-results backend module is connected.
          </p>
        </div>
      </div>
    </div>
  );
  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          View your medical practice analytics and reports
        </h2>
        {/* ======== Stats Section (White Cards) ======== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Patients */}
          <div className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition">
            <p className="text-sm text-lime-600 font-medium mb-2">
              Current Data
            </p>
            <p className="text-sm text-gray-500">
              Total Patients
            </p>
            <p className="text-3xl font-bold mt-2">
              {loading
                ? "..."
                : patientStats.total}
            </p>
          </div>
          {/* Appointments This Month */}
          <div className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition">
            <p className="text-sm text-lime-600 font-medium mb-2">
              Current Data
            </p>
            <p className="text-sm text-gray-500">
              Total Appointments
            </p>
            <p className="text-3xl font-bold mt-2">
              {loading
                ? "..."
                : appointmentStats.total}
            </p>
          </div>
          {/* Avg Rating */}
          <div className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition">
            <p className="text-sm text-lime-600 font-medium mb-2">
              Current Data
            </p>
            <p className="text-sm text-gray-500">
              Confirmed Appointments
            </p>
            <p className="text-3xl font-bold mt-2">
              {loading
                ? "..."
                : appointmentStats.confirmed}
            </p>
          </div>
        </div>
        {/* ======== Charts Section ======== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* -------- Monthly Appointments Chart (Horizontal Bars) -------- */}
          <div className="border bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Appointment Status
              </h3>
              <button
                type="button"
                onClick={loadDashboardData}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                title="Refresh Report"
              >
                <RefreshCw size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                {
                  status: "Pending",
                  value: appointmentStats.pending
                },
                {
                  status: "Confirmed",
                  value: appointmentStats.confirmed
                },
                {
                  status: "Completed",
                  value: appointmentStats.completed
                },
                {
                  status: "Cancelled",
                  value: appointmentStats.cancelled
                }
              ].map((item) => {
                const percentage =
                  appointmentStats.total > 0
                    ? Math.round(
                        (item.value /
                          appointmentStats.total) *
                          100
                      )
                    : 0;
                return (
                  <div
                    key={item.status}
                    className="flex items-center justify-between"
                  >
                    {/* Month name on left */}
                    <div className="w-24">
                      <p className="text-sm font-medium text-gray-700">
                        {item.status}
                      </p>
                    </div>
                    {/* Bar in middle */}
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-lime-100 h-5 rounded-full">
                        <div
                          className="h-5 rounded-full bg-lime-500"
                          style={{
                            width: `${percentage}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    {/* Appointment number on right */}
                    <div className="w-16 text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* -------- Patient Visit Distribution -------- */}
          <div className="border bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Patient Visit Distribution
              </h3>
              <button
                type="button"
                onClick={loadDashboardData}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                title="Refresh Report"
              >
                <RefreshCw size={18} />
              </button>
            </div>
            <div className="space-y-6">
              {[
                {
                  type: "Active Patients",
                  percentage:
                    patientStats.total > 0
                      ? Math.round(
                          (patientStats.active /
                            patientStats.total) *
                            100
                        )
                      : 0,
                  count: patientStats.active
                },
                {
                  type: "Inactive Patients",
                  percentage:
                    patientStats.total > 0
                      ? Math.round(
                          (patientStats.inactive /
                            patientStats.total) *
                            100
                        )
                      : 0,
                  count: patientStats.inactive
                },
                {
                  type: "Patients With Appointments",
                  percentage:
                    patientStats.total > 0
                      ? Math.round(
                          (assignedPatients.length /
                            patientStats.total) *
                            100
                        )
                      : 0,
                  count: assignedPatients.length
                }
              ].map((item) => (
                <div key={item.type}>
                  <div className="flex justify-between mb-1 text-sm text-gray-700">
                    <span>
                      {item.type}
                    </span>
                    <span>
                      {item.percentage}% ({item.count})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div
                      className="h-2 rounded-full bg-lime-500"
                      style={{
                        width: `${item.percentage}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const renderModuleContent = () => {
    switch (activeModule) {
      case 'appointments':
        return <AppointmentManagement />;
      case 'my-patients':
        return renderMyPatients();
      case 'prescriptions':
        return renderPrescriptions();
      case 'lab-results':
        return renderLabResults();
      case 'reports':
        return renderReports();
      default:
        return renderAppointments();
    }
  };
  return (
    <div className="flex h-screen bg-gray-50">
      <DoctorSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-2 mt-2 mb-2">
          {/* Header */}
          {/* <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 capitalize">
              {activeModule.replace('-', ' ')}
            </h1>
            <p className="text-gray-600 mt-1">
              {modules.find(m => m.id === activeModule)?.description}
            </p>
          </div> */}
          {/* Module Content */}
          {renderModuleContent()}
        </div>
      </main>
    </div>
  );
};
export default DoctorDashboard;
