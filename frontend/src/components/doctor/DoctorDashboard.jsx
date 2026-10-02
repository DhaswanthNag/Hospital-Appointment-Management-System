import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo
} from 'react';
import DoctorSidebar from "../../sidebar/DoctorSidebar";
// import { Download, Eye, Pencil } from "lucide-react";
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  User,
  RefreshCw,
  FileText,
  FlaskConical,
  ClipboardList,
  Activity,
  TrendingUp,
  Stethoscope,
  CalendarCheck,
  // Bell,
  ArrowUpRight,
  CircleCheck,
  CircleAlert,
  // CircleDollarSign
} from "lucide-react";
import AppointmentManagement from './Appointment';
import Prescription from './Prescription';
import PatientManagement from './PatientManagement';
import Billingandpayment from './Billingandpayment';
import LabReports from "./LabReports";
import MedicalHistory from "./MedicalHistory";
import Reports from "./Reports";
import Notifications from "./Notifications";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  // LineChart,
  // Line,
  // ReferenceLine
} from "recharts";

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
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
      const savedHamsUser =
        localStorage.getItem("hams_user");

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
      const savedUser =
        localStorage.getItem("user");

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
    const loggedInUser =
      getLoggedInUser();

    console.log(
      "DoctorDashboard - Logged in user:",
      loggedInUser
    );

    if (!loggedInUser?.email) {
      throw new Error(
        "Could not identify the logged-in doctor."
      );
    }

    const response =
      await api.get("/api/doctors");

    const doctors =
      Array.isArray(response.data)
        ? response.data
        : [];

    console.log(
      "DoctorDashboard - Doctors from backend:",
      doctors
    );

    const loggedInEmail =
      loggedInUser.email
        .trim()
        .toLowerCase();

    const matchedDoctor =
      doctors.find(
        (doctorRecord) =>
          doctorRecord.email &&
          doctorRecord.email
            .trim()
            .toLowerCase() ===
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
  const loadDashboardData =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const matchedDoctor =
          await resolveDoctor();

        const doctorId =
          matchedDoctor?.id;

        if (!doctorId) {
          throw new Error(
            "Doctor ID is not available."
          );
        }

        const [
          patientResponse,
          appointmentResponse,
          prescriptionResponse,
          labReportResponse,
          medicalRecordResponse
        ] = await Promise.all([
          api.get("/api/patients"),
          api.get(
            `/api/appointments/doctor/${doctorId}`
          ),
          api.get(
            `/api/prescriptions/doctor/${doctorId}`
          ),
          api.get(
            `/api/lab-reports/doctor/${doctorId}`
          ),
          api.get(
            `/api/medical-records/doctor/${doctorId}`
          )
        ]);

        const patientData =
          Array.isArray(
            patientResponse.data
          )
            ? patientResponse.data
            : [];

        const appointmentData =
          Array.isArray(
            appointmentResponse.data
          )
            ? appointmentResponse.data
            : [];

        const prescriptionData =
          Array.isArray(
            prescriptionResponse.data
          )
            ? prescriptionResponse.data
            : [];

        const labReportData =
          Array.isArray(
            labReportResponse.data
          )
            ? labReportResponse.data
            : [];

        const medicalRecordData =
          Array.isArray(
            medicalRecordResponse.data
          )
            ? medicalRecordResponse.data
            : [];

        setPatients(patientData);
        setAppointments(appointmentData);
        setPrescriptions(prescriptionData);
        setLabReports(labReportData);
        setMedicalRecords(
          medicalRecordData
        );

        console.log(
          "DoctorDashboard - Patients from backend:",
          patientData
        );

        console.log(
          "DoctorDashboard - Appointments from backend:",
          appointmentData
        );

        console.log(
          "DoctorDashboard - Prescriptions from backend:",
          prescriptionData
        );

        console.log(
          "DoctorDashboard - Lab reports from backend:",
          labReportData
        );

        console.log(
          "DoctorDashboard - Medical records from backend:",
          medicalRecordData
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
        setPrescriptions([]);
        setLabReports([]);
        setMedicalRecords([]);

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
  const getAppointmentPatientId =
    useCallback(
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
  const getPatientFromAppointment =
    useCallback(
      (appointment) => {
        const appointmentPatientId =
          getAppointmentPatientId(
            appointment
          );

        if (!appointmentPatientId) {
          return null;
        }

        return patients.find(
          (patient) => {
            const patientId =
              patient.patientId ||
              patient.id;

            return (
              String(patientId) ===
              String(
                appointmentPatientId
              )
            );
          }
        );
      },
      [
        patients,
        getAppointmentPatientId
      ]
    );

  // Find patients assigned to this doctor through appointments
  const assignedPatients =
    useMemo(() => {
      const patientMap =
        new Map();

      appointments.forEach(
        (appointment) => {
          const patient =
            getPatientFromAppointment(
              appointment
            );

          if (!patient) {
            return;
          }

          const patientId =
            patient.patientId ||
            patient.id;

          patientMap.set(
            String(patientId),
            patient
          );
        }
      );

      return Array.from(
        patientMap.values()
      );
    }, [
      appointments,
      getPatientFromAppointment
    ]);

  // Real appointment statistics
  const appointmentStats =
    useMemo(() => {
      const total =
        appointments.length;

      const pending =
        appointments.filter(
          (appointment) =>
            String(
              appointment.status || ""
            ).toLowerCase() ===
            "pending"
        ).length;

      const confirmed =
        appointments.filter(
          (appointment) =>
            String(
              appointment.status || ""
            ).toLowerCase() ===
            "confirmed"
        ).length;

      const completed =
        appointments.filter(
          (appointment) =>
            String(
              appointment.status || ""
            ).toLowerCase() ===
            "completed"
        ).length;

      const cancelled =
        appointments.filter(
          (appointment) =>
            String(
              appointment.status || ""
            ).toLowerCase() ===
            "cancelled"
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
  const upcomingAppointments =
    useMemo(() => {
      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      return appointments
        .filter((appointment) => {
          const status =
            String(
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

          const appointmentDate =
            new Date(
              `${appointment.date}T00:00:00`
            );

          return (
            appointmentDate >= today
          );
        })
        .sort((a, b) => {
          const dateA =
            new Date(
              `${a.date || "9999-12-31"}T${
                a.time || "23:59"
              }`
            );

          const dateB =
            new Date(
              `${b.date || "9999-12-31"}T${
                b.time || "23:59"
              }`
            );

          return dateA - dateB;
        });
    }, [appointments]);

  // Patients count
  const patientStats =
    useMemo(() => {
      const total =
        assignedPatients.length;

      const active =
        assignedPatients.filter(
          (patient) =>
            String(
              patient.status ||
              "active"
            ).toLowerCase() ===
            "active"
        ).length;

      const inactive =
        assignedPatients.filter(
          (patient) =>
            String(
              patient.status || ""
            ).toLowerCase() ===
            "inactive"
        ).length;

      return {
        total,
        active,
        inactive
      };
    }, [assignedPatients]);

  const getPatientName =
    (appointment) => {
      const patient =
        getPatientFromAppointment(
          appointment
        );

      if (patient) {
        return (
          `${patient.firstName || ""} ${
            patient.lastName || ""
          }`.trim() ||
          "Unknown Patient"
        );
      }

      if (appointment?.patientName) {
        return appointment.patientName;
      }

      if (appointment?.patient?.name) {
        return appointment.patient.name;
      }

      return "Unknown Patient";
    };

  const formatAppointmentDate =
    (date) => {
      if (!date) {
        return "Date not available";
      }

      const parsedDate =
        new Date(
          `${date}T00:00:00`
        );

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
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

  const formatAppointmentTime =
    (time) => {
      if (!time) {
        return "Time not available";
      }

      const [
        hours,
        minutes
      ] = time.split(":");

      const parsedDate =
        new Date();

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

  const getStatusClass =
    (status) => {
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

  /*
   * ============================================================
   * DOCTOR DASHBOARD ANALYTICS
   * ============================================================
   */

  const appointmentStatusData =
    useMemo(() => {
      return [
        {
          name: "Pending",
          value:
            appointmentStats.pending
        },
        {
          name: "Confirmed",
          value:
            appointmentStats.confirmed
        },
        {
          name: "Completed",
          value:
            appointmentStats.completed
        },
        {
          name: "Cancelled",
          value:
            appointmentStats.cancelled
        }
      ];
    }, [appointmentStats]);

  const appointmentStatusColors = [
    "#a3e635",
    "#84cc16",
    "#65a30d",
    "#4d7c0f"
  ];

  const prescriptionStatusData =
    useMemo(() => {
      const counts = {
        Pending: 0,
        Active: 0,
        Completed: 0,
        Cancelled: 0
      };

      prescriptions.forEach(
        (prescription) => {
          const status =
            String(
              prescription.status || ""
            )
              .trim()
              .toLowerCase();

          if (
            status.includes("pending")
          ) {
            counts.Pending += 1;
          } else if (
            status.includes("completed") ||
            status.includes("complete")
          ) {
            counts.Completed += 1;
          } else if (
            status.includes("cancelled") ||
            status.includes("canceled")
          ) {
            counts.Cancelled += 1;
          } else {
            counts.Active += 1;
          }
        }
      );

      return [
        {
          status: "Pending",
          prescriptions:
            counts.Pending
        },
        {
          status: "Active",
          prescriptions:
            counts.Active
        },
        {
          status: "Completed",
          prescriptions:
            counts.Completed
        },
        {
          status: "Cancelled",
          prescriptions:
            counts.Cancelled
        }
      ];
    }, [prescriptions]);

  /*
   * Clinical activity combines real prescription,
   * laboratory and medical-record data.
   */
  const clinicalActivityData =
    useMemo(() => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];

      const currentYear =
        new Date().getFullYear();

      return months.map(
        (month, index) => {
          const prescriptionCount =
            prescriptions.filter(
              (item) => {
                const dateValue =
                  item.prescriptionDate ||
                  item.createdAt;

                if (!dateValue) {
                  return false;
                }

                const date =
                  new Date(
                    String(dateValue).length ===
                      10
                      ? `${dateValue}T00:00:00`
                      : dateValue
                  );

                return (
                  date.getFullYear() ===
                    currentYear &&
                  date.getMonth() ===
                    index
                );
              }
            ).length;

          const labCount =
            labReports.filter(
              (item) => {
                const dateValue =
                  item.reportDate ||
                  item.createdAt;

                if (!dateValue) {
                  return false;
                }

                const date =
                  new Date(
                    String(dateValue).length ===
                      10
                      ? `${dateValue}T00:00:00`
                      : dateValue
                  );

                return (
                  date.getFullYear() ===
                    currentYear &&
                  date.getMonth() ===
                    index
                );
              }
            ).length;

          const medicalCount =
            medicalRecords.filter(
              (item) => {
                const dateValue =
                  item.recordDate ||
                  item.createdAt ||
                  item.date;

                if (!dateValue) {
                  return false;
                }

                const date =
                  new Date(
                    String(dateValue).length ===
                      10
                      ? `${dateValue}T00:00:00`
                      : dateValue
                  );

                return (
                  date.getFullYear() ===
                    currentYear &&
                  date.getMonth() ===
                    index
                );
              }
            ).length;

          return {
            month,
            prescriptions:
              prescriptionCount,
            labReports:
              labCount,
            medicalRecords:
              medicalCount
          };
        }
      );
    }, [
      prescriptions,
      labReports,
      medicalRecords
    ]);

  /*
   * Patient status distribution.
   */
  const patientStatusData =
    useMemo(() => {
      const active =
        assignedPatients.filter(
          (patient) =>
            String(
              patient.status ||
                "active"
            ).toLowerCase() ===
            "active"
        ).length;

      const inactive =
        assignedPatients.filter(
          (patient) =>
            String(
              patient.status || ""
            ).toLowerCase() ===
            "inactive"
        ).length;

      const other =
        Math.max(
          assignedPatients.length -
            active -
            inactive,
          0
        );

      return [
        {
          name: "Active",
          value: active
        },
        {
          name: "Inactive",
          value: inactive
        },
        {
          name: "Other",
          value: other
        }
      ];
    }, [assignedPatients]);

  const patientStatusColors = [
    "#84cc16",
    "#94a3b8",
    "#d9f99d"
  ];

  /*
   * Recent clinical activity.
   */
  const recentClinicalActivity =
    useMemo(() => {
      const activityItems = [];

      prescriptions.forEach(
        (item) => {
          activityItems.push({
            type: "Prescription",
            date:
              item.prescriptionDate ||
              item.createdAt,
            icon: FileText,
            color:
              "bg-purple-50 text-purple-600",
            label:
              item.diagnosis ||
              "Prescription created"
          });
        }
      );

      labReports.forEach(
        (item) => {
          activityItems.push({
            type: "Lab Report",
            date:
              item.reportDate ||
              item.createdAt,
            icon: FlaskConical,
            color:
              "bg-cyan-50 text-cyan-600",
            label:
              item.testName ||
              "Laboratory report"
          });
        }
      );

      medicalRecords.forEach(
        (item) => {
          activityItems.push({
            type: "Medical Record",
            date:
              item.recordDate ||
              item.createdAt ||
              item.date,
            icon: ClipboardList,
            color:
              "bg-orange-50 text-orange-600",
            label:
              item.title ||
              item.diagnosis ||
              "Medical record"
          });
        }
      );

      return activityItems
        .sort((a, b) => {
          const dateA =
            a.date
              ? new Date(a.date)
              : new Date(0);

          const dateB =
            b.date
              ? new Date(b.date)
              : new Date(0);

          return dateB - dateA;
        })
        .slice(0, 6);
    }, [
      prescriptions,
      labReports,
      medicalRecords
    ]);

  const formatClinicalDate =
    (date) => {
      if (!date) {
        return "Date unavailable";
      }

      const parsed =
        new Date(
          String(date).length === 10
            ? `${date}T00:00:00`
            : date
        );

      if (
        Number.isNaN(
          parsed.getTime()
        )
      ) {
        return String(date);
      }

      return parsed.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric"
        }
      );
    };

  const chartTooltipStyle = {
    backgroundColor: "#ffffff",
    border:
      "1px solid #d9f99d",
    borderRadius: "14px",
    color: "#1f2937",
    boxShadow:
      "0 10px 30px rgba(0, 0, 0, 0.08)"
  };

  const chartGridColor =
    "#e5e7eb";

  const renderAppointments = () => (
    <div className="space-y-6">

      {/* Dashboard Header */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-gray-200 shadow-sm">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-lime-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-28 -left-20 w-72 h-72 bg-lime-50 rounded-full blur-3xl opacity-80" />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-50 border border-lime-200 text-lime-700 text-xs font-semibold">
                <Stethoscope
                  size={14}
                />
                Doctor Workspace
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4">
                Doctor
                <span className="text-lime-600">
                  {" "}Dashboard
                </span>
              </h1>

              <p className="text-gray-500 mt-2 max-w-2xl">
                Monitor appointments, patients,
                prescriptions, laboratory reports
                and clinical activity from one
                connected dashboard.
              </p>

              {doctor && (
                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="w-8 h-8 rounded-lg bg-lime-100 flex items-center justify-center">
                      <User
                        size={16}
                        className="text-lime-600"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Logged in as
                      </p>

                      <p className="text-sm font-semibold text-gray-800">
                        Dr. {doctor.name}
                      </p>
                    </div>
                  </div>

                  {doctor.specialization && (
                    <div className="px-3 py-2 rounded-xl bg-lime-50 border border-lime-100 text-sm font-medium text-lime-700">
                      {doctor.specialization}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={loadDashboardData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-lime-500 text-white text-sm font-semibold shadow-lg shadow-lime-200 hover:bg-lime-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh Dashboard
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mt-6">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Real Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Total Patients */}
        <div className="border rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition">
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

            <div className="bg-lime-100 p-3 rounded-xl">
              <Users
                size={22}
                className="text-lime-600"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-lime-700">
            <TrendingUp size={14} />

            <span>
              {patientStats.active} active patients
            </span>
          </div>
        </div>

        {/* Appointments This Month */}
        <div className="border rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition">
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

            <div className="bg-blue-100 p-3 rounded-xl">
              <Calendar
                size={22}
                className="text-blue-600"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-blue-700">
            <CalendarCheck size={14} />

            <span>
              {appointmentStats.confirmed} confirmed
            </span>
          </div>
        </div>

        {/* Pending Appointments */}
        <div className="border rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition">
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

            <div className="bg-yellow-100 p-3 rounded-xl">
              <Clock
                size={22}
                className="text-yellow-600"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-yellow-700">
            <CircleAlert size={14} />

            <span>
              Requires attention
            </span>
          </div>
        </div>

        {/* Completed Appointments */}
        <div className="border rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition">
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

            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircle
                size={22}
                className="text-green-600"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-green-700">
            <CircleCheck size={14} />

            <span>
              Completed visits
            </span>
          </div>
        </div>

        {/* Total Prescriptions */}
        <div className="border rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Prescriptions
              </p>

              <p className="text-3xl font-bold mt-2 text-gray-800">
                {loading
                  ? "..."
                  : prescriptions.length}
              </p>
            </div>

            <div className="bg-purple-100 p-3 rounded-xl">
              <FileText
                size={22}
                className="text-purple-600"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-purple-700">
            <FileText size={14} />

            <span>
              Clinical prescriptions
            </span>
          </div>
        </div>

        {/* Total Lab Reports */}
        <div className="border rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Lab Reports
              </p>

              <p className="text-3xl font-bold mt-2 text-gray-800">
                {loading
                  ? "..."
                  : labReports.length}
              </p>
            </div>

            <div className="bg-cyan-100 p-3 rounded-xl">
              <FlaskConical
                size={22}
                className="text-cyan-600"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-cyan-700">
            <Activity size={14} />

            <span>
              Laboratory activity
            </span>
          </div>
        </div>

        {/* Total Medical Reports */}
        <div className="border rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Medical Reports
              </p>

              <p className="text-3xl font-bold mt-2 text-gray-800">
                {loading
                  ? "..."
                  : medicalRecords.length}
              </p>
            </div>

            <div className="bg-orange-100 p-3 rounded-xl">
              <ClipboardList
                size={22}
                className="text-orange-600"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-orange-700">
            <ClipboardList size={14} />

            <span>
              Patient records
            </span>
          </div>
        </div>

        {/* Dashboard Coverage */}
        <div className="border rounded-2xl p-5 bg-lime-50 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-lime-700">
                Clinical Coverage
              </p>

              <p className="text-3xl font-bold mt-2 text-gray-900">
                {loading
                  ? "..."
                  : labReports.length +
                    medicalRecords.length +
                    prescriptions.length}
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl">
              <Stethoscope
                size={22}
                className="text-lime-600"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-lime-700">
            <ArrowUpRight size={14} />

            <span>
              Clinical activities
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          PROFESSIONAL ANALYTICS
      ============================================================ */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Appointment Status Pie Chart */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 md:p-6">

            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                  Appointment Analytics
                </p>

                <h2 className="text-xl font-bold text-gray-800 mt-1">
                  Appointment Status
                </h2>
              </div>

              <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center text-lime-600">
                <CalendarCheck size={20} />
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-2">
              Current appointment distribution
            </p>

            <div className="h-[300px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={
                      appointmentStatusData
                    }
                    cx="50%"
                    cy="48%"
                    innerRadius={72}
                    outerRadius={105}
                    paddingAngle={4}
                    cornerRadius={10}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {appointmentStatusData.map(
                      (entry, index) => (
                        <Cell
                          key={
                            `appointment-${index}`
                          }
                          fill={
                            appointmentStatusColors[
                              index
                            ]
                          }
                          stroke="#ffffff"
                          strokeWidth={4}
                        />
                      )
                    )}
                  </Pie>

                  <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#111827"
                    fontSize="28"
                    fontWeight="700"
                  >
                    {appointmentStats.total}
                  </text>

                  <text
                    x="50%"
                    y="55%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#6b7280"
                    fontSize="12"
                  >
                    Appointments
                  </text>

                  <Tooltip
                    contentStyle={
                      chartTooltipStyle
                    }
                  />

                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "12px",
                      color: "#4b5563"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Patient Status Pie Chart */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 md:p-6">

            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                  Patient Analytics
                </p>

                <h2 className="text-xl font-bold text-gray-800 mt-1">
                  Patient Status
                </h2>
              </div>

              <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center text-lime-600">
                <Users size={20} />
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-2">
              Patients currently assigned to you
            </p>

            <div className="h-[300px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={
                      patientStatusData
                    }
                    cx="50%"
                    cy="48%"
                    innerRadius={72}
                    outerRadius={105}
                    paddingAngle={4}
                    cornerRadius={10}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {patientStatusData.map(
                      (entry, index) => (
                        <Cell
                          key={
                            `patient-${index}`
                          }
                          fill={
                            patientStatusColors[
                              index
                            ]
                          }
                          stroke="#ffffff"
                          strokeWidth={4}
                        />
                      )
                    )}
                  </Pie>

                  <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#111827"
                    fontSize="28"
                    fontWeight="700"
                  >
                    {patientStats.total}
                  </text>

                  <text
                    x="50%"
                    y="55%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#6b7280"
                    fontSize="12"
                  >
                    Patients
                  </text>

                  <Tooltip
                    contentStyle={
                      chartTooltipStyle
                    }
                  />

                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "12px",
                      color: "#4b5563"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Prescription Histogram */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 md:p-6">

            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                  Prescription Analytics
                </p>

                <h2 className="text-xl font-bold text-gray-800 mt-1">
                  Prescription Activity
                </h2>
              </div>

              <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center text-lime-600">
                <FileText size={20} />
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Prescription status distribution
            </p>

            <div className="h-[270px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    prescriptionStatusData
                  }
                  margin={{
                    top: 10,
                    right: 5,
                    left: -15,
                    bottom: 5
                  }}
                >
                  <CartesianGrid
                    stroke={
                      chartGridColor
                    }
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="status"
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
                    contentStyle={
                      chartTooltipStyle
                    }
                  />

                  <Bar
                    dataKey="prescriptions"
                    name="Prescriptions"
                    fill="#84cc16"
                    radius={[
                      10,
                      10,
                      0,
                      0
                    ]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Activity Range Mountain Graph AND Clinical Activity Histogram */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Clinical Activity Range Mountain Graph */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 md:p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                  Clinical Coverage
                </p>

                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                  Clinical Activity Range
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Prescriptions, laboratory reports and medical records
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-500" />
                  Prescriptions
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  Lab Reports
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  Medical Records
                </div>
              </div>
            </div>

            <div className="h-[370px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={
                    clinicalActivityData
                  }
                  margin={{
                    top: 15,
                    right: 15,
                    left: -10,
                    bottom: 5
                  }}
                >
                  <defs>
                    <linearGradient
                      id="clinicalPrescriptionGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#84cc16"
                        stopOpacity={0.28}
                      />

                      <stop
                        offset="100%"
                        stopColor="#84cc16"
                        stopOpacity={0.02}
                      />
                    </linearGradient>

                    <linearGradient
                      id="clinicalLabGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#06b6d4"
                        stopOpacity={0.20}
                      />

                      <stop
                        offset="100%"
                        stopColor="#06b6d4"
                        stopOpacity={0.02}
                      />
                    </linearGradient>

                    <linearGradient
                      id="clinicalMedicalGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#f97316"
                        stopOpacity={0.18}
                      />

                      <stop
                        offset="100%"
                        stopColor="#f97316"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke={
                      chartGridColor
                    }
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
                    contentStyle={
                      chartTooltipStyle
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="prescriptions"
                    name="Prescriptions"
                    stroke="#84cc16"
                    strokeWidth={3}
                    fill="url(#clinicalPrescriptionGradient)"
                  />

                  <Area
                    type="monotone"
                    dataKey="labReports"
                    name="Lab Reports"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fill="url(#clinicalLabGradient)"
                  />

                  <Area
                    type="monotone"
                    dataKey="medicalRecords"
                    name="Medical Records"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    fill="url(#clinicalMedicalGradient)"
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

        {/* Clinical Activity Histogram */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 md:p-6">

            <div className="flex items-center justify-between mb-24">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                  Clinical Analytics
                </p>

                <h2 className="text-xl font-bold text-gray-800 mt-1">
                  Monthly Clinical Records
                </h2>
              </div>

              <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center text-lime-600">
                <Activity size={20} />
              </div>
            </div>

            <div className="h-[330px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    clinicalActivityData
                  }
                  margin={{
                    top: 10,
                    right: 10,
                    left: -10,
                    bottom: 5
                  }}
                  barGap={4}
                >
                  <CartesianGrid
                    stroke={
                      chartGridColor
                    }
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
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
                      fontSize: 10
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={
                      chartTooltipStyle
                    }
                  />

                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "11px",
                      color: "#4b5563",
                      paddingBottom: "10px"
                    }}
                  />

                  <Bar
                    dataKey="prescriptions"
                    name="Prescriptions"
                    fill="#84cc16"
                    radius={[
                      6,
                      6,
                      0,
                      0
                    ]}
                    maxBarSize={18}
                  />

                  <Bar
                    dataKey="labReports"
                    name="Lab Reports"
                    fill="#06b6d4"
                    radius={[
                      6,
                      6,
                      0,
                      0
                    ]}
                    maxBarSize={18}
                  />

                  <Bar
                    dataKey="medicalRecords"
                    name="Medical Records"
                    fill="#f97316"
                    radius={[
                      6,
                      6,
                      0,
                      0
                    ]}
                    maxBarSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Appointment Summary */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                Appointment Summary
              </p>

              <h2 className="text-xl font-bold text-gray-800 mt-1">
                Current Workflow
              </h2>
            </div>

            <CalendarCheck
              size={21}
              className="text-lime-600"
            />
          </div>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-yellow-400" />

                <span className="text-sm text-gray-600">
                  Pending
                </span>
              </div>

              <span className="font-semibold text-gray-800">
                {appointmentStats.pending}
              </span>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-lime-500" />

                <span className="text-sm text-gray-600">
                  Confirmed
                </span>
              </div>

              <span className="font-semibold text-gray-800">
                {appointmentStats.confirmed}
              </span>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500" />

                <span className="text-sm text-gray-600">
                  Completed
                </span>
              </div>

              <span className="font-semibold text-gray-800">
                {appointmentStats.completed}
              </span>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500" />

                <span className="text-sm text-gray-600">
                  Cancelled
                </span>
              </div>

              <span className="font-semibold text-gray-800">
                {appointmentStats.cancelled}
              </span>
            </div>
          </div>
        </div>

        {/* Clinical Coverage */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                Clinical Coverage
              </p>

              <h2 className="text-xl font-bold text-gray-800 mt-1">
                Records Overview
              </h2>
            </div>

            <ClipboardList
              size={21}
              className="text-lime-600"
            />
          </div>

          <div className="mt-6 space-y-5">

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Prescriptions
                </span>

                <span className="text-sm font-semibold text-gray-800">
                  {prescriptions.length}
                </span>
              </div>

              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-lime-500"
                  style={{
                    width: `${
                      Math.min(
                        prescriptions.length *
                          10,
                        100
                      )
                    }%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Lab Reports
                </span>

                <span className="text-sm font-semibold text-gray-800">
                  {labReports.length}
                </span>
              </div>

              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-500"
                  style={{
                    width: `${
                      Math.min(
                        labReports.length *
                          10,
                        100
                      )
                    }%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Medical Records
                </span>

                <span className="text-sm font-semibold text-gray-800">
                  {medicalRecords.length}
                </span>
              </div>

              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{
                    width: `${
                      Math.min(
                        medicalRecords.length *
                          10,
                        100
                      )
                    }%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Clinical Activity */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                Recent Activity
              </p>

              <h2 className="text-xl font-bold text-gray-800 mt-1">
                Clinical Timeline
              </h2>
            </div>

            <Activity
              size={21}
              className="text-lime-600"
            />
          </div>

          <div className="mt-5 space-y-3">
            {recentClinicalActivity.length === 0 ? (
              <div className="py-8 text-center">
                <Activity
                  size={30}
                  className="text-gray-300 mx-auto"
                />

                <p className="text-sm text-gray-500 mt-2">
                  No clinical activity available
                </p>
              </div>
            ) : (
              recentClinicalActivity
                .map(
                  (item, index) => {
                    const Icon =
                      item.icon;

                    return (
                      <div
                        key={`${item.type}-${index}`}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}
                        >
                          <Icon size={16} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {item.label}
                          </p>

                          <p className="text-xs text-gray-400">
                            {item.type} •{" "}
                            {formatClinicalDate(
                              item.date
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 md:p-6">

          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                Schedule
              </p>

              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                Upcoming Appointments
              </h2>
            </div>

            {loading && (
              <span className="text-xs text-gray-400">
                Loading...
              </span>
            )}
          </div>

          {loading ? (
            <div className="border border-gray-200 rounded-2xl p-10 text-center">
              <RefreshCw
                className="h-7 w-7 text-lime-600 animate-spin mx-auto"
              />

              <p className="text-gray-500 mt-3">
                Loading appointments...
              </p>
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="border border-gray-200 rounded-2xl p-10 text-center">
              <Calendar
                className="h-10 w-10 text-gray-300 mx-auto"
              />

              <h3 className="font-semibold text-gray-700 mt-3">
                No upcoming appointments
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Appointments assigned to you will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments
                .slice(0, 8)
                .map(
                  (appointment) => (
                    <div
                      key={
                        appointment.id
                      }
                      className="group border border-gray-200 rounded-2xl p-4 hover:border-lime-200 hover:bg-lime-50/30 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

                        <div className="flex items-start gap-4">
                          <div className="bg-lime-100 p-3 rounded-xl shrink-0">
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

                            <p className="text-gray-600 text-sm">
                              {appointment.type ||
                                appointment.procedure ||
                                "Consultation"}
                            </p>

                            {appointment.department && (
                              <p className="text-xs text-gray-500 mt-1">
                                {appointment.department}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              <p className="text-sm text-gray-500">
                                {formatAppointmentDate(
                                  appointment.date
                                )}
                              </p>

                              <span className="text-gray-300">
                                •
                              </span>

                              <p className="text-sm text-gray-500">
                                {formatAppointmentTime(
                                  appointment.time
                                )}
                              </p>

                              {appointment.room && (
                                <>
                                  <span className="text-gray-300">
                                    •
                                  </span>

                                  <p className="text-sm text-gray-500">
                                    {appointment.room}
                                  </p>
                                </>
                              )}
                            </div>

                            {appointment.reason && (
                              <p className="text-sm text-gray-500 mt-2">
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
                  )
                )}
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

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return renderAppointments();

      case 'appointments':
        return <AppointmentManagement />;

      case 'my-patients':
        return renderMyPatients();

      case 'prescriptions':
        return renderPrescriptions();

      case 'billing':
        return <Billingandpayment />;

      case 'lab-management':
        return (
          <LabReports
            doctorId={doctor?.id}
          />
        );

      case "medical-records":
        return <MedicalHistory />;

      case 'reports':
        return <Reports />;

      case 'notifications':
        return (
          <Notifications
            doctorId={doctor?.id}
          />
        );

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

      <main className="flex-1 overflow-auto mt-2 mb-2">
        <div className="p-4 md:p-6">

          {/* Module Content */}
          {renderModuleContent()}

        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;