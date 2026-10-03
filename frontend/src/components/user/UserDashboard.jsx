import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import UserSidebar from "../../sidebar/UserSidebar";
import Appointment from "./Appointment";
import Prescription from "./Prescription";
import Profile from "./Profile";
import Billingandpayment from "./Billingandpayment";
import LabReports from "./LabReports";
import UserMedicalHistory from "./MedicalHistory";
import Notifications from "./Notifications";
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
  TrendingUp,
  Activity,
  // CheckCircle,
  // AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  // RefreshCw
 // X,
 // CheckCircle
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

// const API_BASE = API_BASE_URL || "[http://localhost:8080/api](http://localhost:8080/api)";

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

  const [labReports, setLabReports] = useState([]);

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

  // Fetch this patient's real laboratory reports
  const fetchPatientLabReports = useCallback(async () => {
    const patientId = patient?.patientId || patient?.id;

    if (!patientId) {
      console.log(
        "UserDashboard - Patient ID not available for laboratory reports:",
        patient
      );
      return;
    }

    try {
      console.log(
        "UserDashboard - Fetching laboratory reports for patient:",
        patientId
      );

      const response = await api.get(
        `/api/lab-reports/patient/${patientId}`
      );

      const data = response.data;

      console.log(
        "UserDashboard - Laboratory reports received:",
        data
      );

      setLabReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Failed to load patient laboratory reports:",
        error
      );

      console.error(
        "UserDashboard - Laboratory report API response:",
        error?.response?.data
      );

      setLabReports([]);
    }
  }, [patient]);

  useEffect(() => {
    fetchPatientLabReports();
  }, [fetchPatientLabReports]);

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

  /*
   * Dashboard chart data
   * All values below are calculated from the real backend data
   * already loaded into appointments, prescriptions and labReports.
   */

  const appointmentStatusData = useMemo(() => {
    const counts = {
      Pending: 0,
      Confirmed: 0,
      Completed: 0,
      Cancelled: 0,
      Rescheduled: 0
    };

    appointments.forEach((appointment) => {
      const status = String(
        appointment.status || ""
      ).toLowerCase();

      if (status === "pending") {
        counts.Pending += 1;
      } else if (status === "confirmed") {
        counts.Confirmed += 1;
      } else if (status === "completed") {
        counts.Completed += 1;
      } else if (status === "cancelled") {
        counts.Cancelled += 1;
      } else if (status === "rescheduled") {
        counts.Rescheduled += 1;
      }
    });

    return [
      {
        name: "Pending",
        value: counts.Pending
      },
      {
        name: "Confirmed",
        value: counts.Confirmed
      },
      {
        name: "Completed",
        value: counts.Completed
      },
      {
        name: "Cancelled",
        value: counts.Cancelled
      },
      {
        name: "Rescheduled",
        value: counts.Rescheduled
      }
    ];
  }, [appointments]);

  const appointmentMonthlyData = useMemo(() => {
    const months = [];

    const now = new Date();

    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - index,
        1
      );

      months.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: date.toLocaleDateString("en-US", {
          month: "short"
        }),
        appointments: 0,
        completed: 0,
        confirmed: 0,
        pending: 0
      });
    }

    appointments.forEach((appointment) => {
      if (!appointment.date) return;

      const appointmentDate = new Date(
        `${appointment.date}T00:00:00`
      );

      if (Number.isNaN(appointmentDate.getTime())) {
        return;
      }

      const key = `${appointmentDate.getFullYear()}-${appointmentDate.getMonth()}`;

      const monthData = months.find(
        (month) => month.key === key
      );

      if (!monthData) return;

      monthData.appointments += 1;

      const status = String(
        appointment.status || ""
      ).toLowerCase();

      if (status === "completed") {
        monthData.completed += 1;
      }

      if (status === "confirmed") {
        monthData.confirmed += 1;
      }

      if (status === "pending") {
        monthData.pending += 1;
      }
    });

    return months;
  }, [appointments]);

  const clinicalActivityData = useMemo(() => {
    const months = [];

    const now = new Date();

    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - index,
        1
      );

      months.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: date.toLocaleDateString("en-US", {
          month: "short"
        }),
        prescriptions: 0,
        labReports: 0,
        completedAppointments: 0
      });
    }

    prescriptions.forEach((prescription) => {
      const rawDate =
        prescription.prescriptionDate ||
        prescription.createdAt;

      if (!rawDate) return;

      const prescriptionDate = new Date(
        String(rawDate).length <= 10
          ? `${rawDate}T00:00:00`
          : rawDate
      );

      if (Number.isNaN(prescriptionDate.getTime())) {
        return;
      }

      const key = `${prescriptionDate.getFullYear()}-${prescriptionDate.getMonth()}`;

      const monthData = months.find(
        (month) => month.key === key
      );

      if (monthData) {
        monthData.prescriptions += 1;
      }
    });

    labReports.forEach((report) => {
      const rawDate =
        report.reportDate ||
        report.createdAt;

      if (!rawDate) return;

      const reportDate = new Date(
        String(rawDate).length <= 10
          ? `${rawDate}T00:00:00`
          : rawDate
      );

      if (Number.isNaN(reportDate.getTime())) {
        return;
      }

      const key = `${reportDate.getFullYear()}-${reportDate.getMonth()}`;

      const monthData = months.find(
        (month) => month.key === key
      );

      if (monthData) {
        monthData.labReports += 1;
      }
    });

    appointments.forEach((appointment) => {
      if (!appointment.date) return;

      const appointmentDate = new Date(
        `${appointment.date}T00:00:00`
      );

      if (Number.isNaN(appointmentDate.getTime())) {
        return;
      }

      const key = `${appointmentDate.getFullYear()}-${appointmentDate.getMonth()}`;

      const monthData = months.find(
        (month) => month.key === key
      );

      if (
        monthData &&
        String(appointment.status || "").toLowerCase() ===
          "completed"
      ) {
        monthData.completedAppointments += 1;
      }
    });

    return months;
  }, [appointments, prescriptions, labReports]);

  const clinicalSummaryData = useMemo(() => {
    return [
      {
        category: "Appointments",
        count: appointments.length
      },
      {
        category: "Prescriptions",
        count: prescriptions.length
      },
      {
        category: "Lab Reports",
        count: labReports.length
      },
      {
        category: "Completed Visits",
        count: completedAppointments.length
      }
    ];
  }, [
    appointments,
    prescriptions,
    labReports,
    completedAppointments.length
  ]);

  const chartTooltipStyle = {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)"
  };

  const chartGridColor = "#e5e7eb";

  const appointmentPieColors = [
    "#84cc16",
    "#22c55e",
    "#06b6d4",
    "#ef4444",
    "#8b5cf6"
  ];

  const renderDashboard = () => {
    return (
      <div className="space-y-6 w-full">
        {/* Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-lime-500 via-lime-600 to-lime-700 rounded-3xl p-6 md:p-8 text-white shadow-lg">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute right-20 -bottom-16 h-48 w-48 rounded-full bg-white/5" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-lime-100 text-sm font-medium uppercase tracking-wider mb-2">
                Patient Dashboard
              </p>

              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {user?.name || patient?.firstName || "Patient"}!
              </h1>

              <p className="text-lime-100 max-w-2xl">
                Here&apos;s an overview of your healthcare information.
              </p>
            </div>

            <div className="hidden md:flex h-20 w-20 rounded-2xl bg-white/15 border border-white/20 items-center justify-center">
              <Activity className="h-9 w-9 text-white" />
            </div>
          </div>
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
                        <span className="break-words">
                          {appointment.reason}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleConfirmAppointment(appointment)}
                      disabled={
                        confirmingAppointmentId === appointment.id
                      }
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
                <p className="text-sm text-gray-500">
                  Upcoming Appointments
                </p>

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
                <p className="text-sm text-gray-500">
                  Prescriptions
                </p>

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
                <p className="text-sm text-gray-500">
                  Lab Results
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {labReports.length}
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
                <p className="text-sm text-gray-500">
                  Medical History
                </p>

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

        {/* Appointment Trends */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Appointment Activity */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                    Appointment Trends
                  </p>

                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                    Appointment Activity
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Your monthly appointment movement from the connected backend
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-lime-700 bg-lime-50 border border-lime-100 rounded-xl px-3 py-2">
                  <TrendingUp size={16} />
                  Live data
                </div>
              </div>

              <div className="h-[350px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart
                    data={appointmentMonthlyData}
                    margin={{
                      top: 15,
                      right: 15,
                      left: -10,
                      bottom: 5
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="userAppointmentGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#84cc16"
                          stopOpacity={0.45}
                        />

                        <stop
                          offset="100%"
                          stopColor="#84cc16"
                          stopOpacity={0.04}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke={chartGridColor}
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fill: "#6b7280",
                        fontSize: 11
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: "#6b7280",
                        fontSize: 11
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={chartTooltipStyle}
                    />

                    <Area
                      type="monotone"
                      dataKey="appointments"
                      name="Appointments"
                      stroke="#84cc16"
                      strokeWidth={3}
                      fill="url(#userAppointmentGradient)"
                      dot={{
                        r: 4,
                        fill: "#84cc16",
                        strokeWidth: 2,
                        stroke: "#ffffff"
                      }}
                      activeDot={{
                        r: 7
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Clinical Activity Range */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                    Clinical Coverage
                  </p>

                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                    Clinical Activity Range
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Prescriptions, laboratory reports and completed visits
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-lime-700 bg-lime-50 border border-lime-100 rounded-xl px-3 py-2">
                  <Activity size={16} />
                  Clinical data
                </div>
              </div>

              <div className="h-[350px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart
                    data={clinicalActivityData}
                    margin={{
                      top: 15,
                      right: 15,
                      left: -10,
                      bottom: 5
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="userClinicalPrescriptionGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#84cc16"
                          stopOpacity={0.35}
                        />

                        <stop
                          offset="100%"
                          stopColor="#84cc16"
                          stopOpacity={0.03}
                        />
                      </linearGradient>

                      <linearGradient
                        id="userClinicalLabGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#06b6d4"
                          stopOpacity={0.25}
                        />

                        <stop
                          offset="100%"
                          stopColor="#06b6d4"
                          stopOpacity={0.03}
                        />
                      </linearGradient>

                      <linearGradient
                        id="userClinicalVisitGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#f97316"
                          stopOpacity={0.22}
                        />

                        <stop
                          offset="100%"
                          stopColor="#f97316"
                          stopOpacity={0.03}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke={chartGridColor}
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fill: "#6b7280",
                        fontSize: 11
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: "#6b7280",
                        fontSize: 11
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={chartTooltipStyle}
                    />

                    <Area
                      type="monotone"
                      dataKey="prescriptions"
                      name="Prescriptions"
                      stroke="#84cc16"
                      strokeWidth={3}
                      fill="url(#userClinicalPrescriptionGradient)"
                      dot={{
                        r: 3
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="labReports"
                      name="Lab Reports"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      fill="url(#userClinicalLabGradient)"
                    />

                    <Area
                      type="monotone"
                      dataKey="completedAppointments"
                      name="Completed Visits"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      fill="url(#userClinicalVisitGradient)"
                    />

                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "12px",
                        color: "#4b5563"
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Appointment Status Pie Chart */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                    Appointment Overview
                  </p>

                  <h2 className="text-xl font-bold text-gray-800 mt-1">
                    Appointment Status
                  </h2>
                </div>

                <div className="bg-lime-50 p-3 rounded-xl">
                  <PieChartIcon className="h-5 w-5 text-lime-600" />
                </div>
              </div>

              <div className="h-[330px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={appointmentStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                    >
                      {appointmentStatusData.map(
                        (entry, index) => (
                          <Cell
                            key={`appointment-status-${entry.name}`}
                            fill={
                              appointmentPieColors[
                                index %
                                  appointmentPieColors.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      contentStyle={chartTooltipStyle}
                    />

                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "12px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Clinical Summary Bar Chart */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                    Healthcare Summary
                  </p>

                  <h2 className="text-xl font-bold text-gray-800 mt-1">
                    Clinical Activity
                  </h2>
                </div>

                <div className="bg-lime-50 p-3 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-lime-600" />
                </div>
              </div>

              <div className="h-[330px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={clinicalSummaryData}
                    margin={{
                      top: 15,
                      right: 10,
                      left: -10,
                      bottom: 5
                    }}
                  >
                    <CartesianGrid
                      stroke={chartGridColor}
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="category"
                      tick={{
                        fill: "#6b7280",
                        fontSize: 10
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: "#6b7280",
                        fontSize: 11
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={chartTooltipStyle}
                    />

                    <Bar
                      dataKey="count"
                      name="Records"
                      fill="#84cc16"
                      radius={[
                        8,
                        8,
                        0,
                        0
                      ]}
                      barSize={42}
                    />
                  </BarChart>
                </ResponsiveContainer>
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
                          {medicine?.dosage ||
                            "Dosage not specified"}{" "}
                          •{" "}
                          {medicine?.frequency ||
                            "Frequency not specified"}
                        </p>

                        <p className="text-sm text-gray-500">
                          Diagnosis:{" "}
                          {prescription.diagnosis ||
                            "Not specified"}
                        </p>

                        <p className="text-sm text-gray-500">
                          Doctor:{" "}
                          {getDoctorName(
                            prescription.doctorId
                          )}
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
      <LabReports
        patientId={patient?.patientId || patient?.id}
      />
    );
  };

  const renderPayments = () => {
    return (
      <Billingandpayment
        patientId={patient?.patientId || patient?.id}
      />
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
        return <UserMedicalHistory />;

      case "notifications":
        return (
          <Notifications
            patientId={patient?.patientId || patient?.id}
          />
        );

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
          {/* Module Content */}
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