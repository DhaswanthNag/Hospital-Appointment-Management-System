import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  // MdPeople,
  // MdSupervisedUserCircle,
  MdCalendarToday,
  MdPayment,
  // MdReceiptLong,
  // MdScience,
  // MdDescription,
  MdAttachMoney
} from 'react-icons/md';

import {
  Activity,
  // ArrowUpRight,
  Bell,
  CalendarCheck,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  FileText,
  // FlaskConical,
  // HeartPulse,
  RefreshCw,
  Stethoscope,
  Users,
  WalletCards,
  // XCircle
} from 'lucide-react';

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
  LineChart,
  Line,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';

import AdminSidebar from "../../sidebar/AdminSidebar";
import DoctorManagement from "./DoctorManagement";
import PatientManagement from "./PatientManagement";
import AppointmentSchedulling from "./AppointmentSchedulling";
import Prescription from "./Prescription";
import Billingandpayment from "./Billingandpayment";
import LabReports from "./LabReports";
import MedicalHistory from "./MedicalHistory"; 
import Reports from "./Reports";
import Notifications from "./Notifications";
// import AdminProfilePage from './AdminProfilePage';
import api from "../../api/api";

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [billings, setBillings] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load all real dashboard data from backend
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        patientsResponse,
        doctorsResponse,
        appointmentsResponse,
        prescriptionsResponse,
        billingResponse,
        labReportsResponse,
        medicalRecordsResponse,
        notificationsResponse
      ] = await Promise.all([
        api.get("/api/patients"),
        api.get("/api/doctors"),
        api.get("/api/appointments"),
        api.get("/api/prescriptions"),
        api.get("/api/billing"),
        api.get("/api/lab-reports"),
        api.get("/api/medical-records"),
        api.get("/api/notifications")
      ]);

      const patientData = Array.isArray(
        patientsResponse.data
      )
        ? patientsResponse.data
        : [];

      const doctorData = Array.isArray(
        doctorsResponse.data
      )
        ? doctorsResponse.data
        : [];

      const appointmentData = Array.isArray(
        appointmentsResponse.data
      )
        ? appointmentsResponse.data
        : [];

      const prescriptionData = Array.isArray(
        prescriptionsResponse.data
      )
        ? prescriptionsResponse.data
        : [];

      const billingData = Array.isArray(
        billingResponse.data
      )
        ? billingResponse.data
        : [];

      const labReportData = Array.isArray(
        labReportsResponse.data
      )
        ? labReportsResponse.data
        : [];

      const medicalRecordData = Array.isArray(
        medicalRecordsResponse.data
      )
        ? medicalRecordsResponse.data
        : [];

      const notificationData = Array.isArray(
        notificationsResponse.data
      )
        ? notificationsResponse.data
        : [];

      setPatients(patientData);
      setDoctors(doctorData);
      setAppointments(appointmentData);
      setPrescriptions(prescriptionData);
      setBillings(billingData);
      setLabReports(labReportData);
      setMedicalRecords(medicalRecordData);
      setNotifications(notificationData);

      console.log(
        "Admin Dashboard - Patients:",
        patientData
      );

      console.log(
        "Admin Dashboard - Doctors:",
        doctorData
      );

      console.log(
        "Admin Dashboard - Appointments:",
        appointmentData
      );

      console.log(
        "Admin Dashboard - Prescriptions:",
        prescriptionData
      );

      console.log(
        "Admin Dashboard - Billing:",
        billingData
      );

      console.log(
        "Admin Dashboard - Laboratory Reports:",
        labReportData
      );

      console.log(
        "Admin Dashboard - Medical Records:",
        medicalRecordData
      );

      console.log(
        "Admin Dashboard - Notifications:",
        notificationData
      );
    } catch (err) {
      console.error(
        "Admin Dashboard - Failed to load dashboard data:",
        err
      );

      console.error(
        "Admin Dashboard - API response:",
        err?.response?.data
      );

      setPatients([]);
      setDoctors([]);
      setAppointments([]);
      setPrescriptions([]);
      setBillings([]);
      setLabReports([]);
      setMedicalRecords([]);
      setNotifications([]);

      setError(
        err?.response?.data?.message ||
          "Could not load dashboard data. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Find patient name from the real patient records
  const getPatientName = useCallback(
    (appointment) => {
      const appointmentPatientId =
        appointment?.patientId ||
        appointment?.patient?.patientId ||
        appointment?.patient?.id;

      if (appointmentPatientId) {
        const matchedPatient = patients.find(
          (patient) => {
            const patientId =
              patient.patientId || patient.id;

            return (
              String(patientId) ===
              String(appointmentPatientId)
            );
          }
        );

        if (matchedPatient) {
          return (
            `${matchedPatient.firstName || ""} ${
              matchedPatient.lastName || ""
            }`.trim() || "Unknown Patient"
          );
        }
      }

      if (appointment?.patientName) {
        return appointment.patientName;
      }

      if (appointment?.patient?.name) {
        return appointment.patient.name;
      }

      return "Unknown Patient";
    },
    [patients]
  );

  // Find doctor name from the real doctor records
  const getDoctorName = useCallback(
    (appointment) => {
      const appointmentDoctorId =
        appointment?.doctorId ||
        appointment?.doctor?.id;

      if (appointmentDoctorId) {
        const matchedDoctor = doctors.find(
          (doctor) =>
            String(doctor.id) ===
            String(appointmentDoctorId)
        );

        if (matchedDoctor) {
          const doctorName =
            matchedDoctor.name || "Unknown Doctor";

          return doctorName.startsWith("Dr.")
            ? doctorName
            : `Dr. ${doctorName}`;
        }
      }

      if (appointment?.doctorName) {
        return appointment.doctorName.startsWith(
          "Dr."
        )
          ? appointment.doctorName
          : `Dr. ${appointment.doctorName}`;
      }

      if (appointment?.doctor?.name) {
        const doctorName =
          appointment.doctor.name;

        return doctorName.startsWith("Dr.")
          ? doctorName
          : `Dr. ${doctorName}`;
      }

      return "Unknown Doctor";
    },
    [doctors]
  );

  const formatAppointmentTime = (time) => {
    if (!time) return "Time not available";

    const [hours, minutes] =
      String(time).split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    if (Number.isNaN(date.getTime())) {
      return time;
    }

    return date.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit"
      }
    );
  };

  // Get today's real appointments
  const todayAppointments = useMemo(() => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      today.getDate()
    ).padStart(2, "0");

    const todayString =
      `${year}-${month}-${day}`;

    return appointments.filter(
      (appointment) =>
        appointment.date === todayString
    );
  }, [appointments]);

  // Get recent appointments
  const recentAppointments = useMemo(() => {
    return [...appointments]
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

        return dateB - dateA;
      })
      .slice(0, 10);
  }, [appointments]);

  // Real appointment statistics
  const appointmentStats = useMemo(() => {
    const pending = appointments.filter(
      (appointment) =>
        String(
          appointment.status || ""
        ).toLowerCase() === "pending"
    ).length;

    const confirmed = appointments.filter(
      (appointment) =>
        String(
          appointment.status || ""
        ).toLowerCase() === "confirmed"
    ).length;

    const completed = appointments.filter(
      (appointment) =>
        String(
          appointment.status || ""
        ).toLowerCase() === "completed"
    ).length;

    const cancelled = appointments.filter(
      (appointment) =>
        String(
          appointment.status || ""
        ).toLowerCase() === "cancelled"
    ).length;

    return {
      total: appointments.length,
      today: todayAppointments.length,
      pending,
      confirmed,
      completed,
      cancelled
    };
  }, [
    appointments,
    todayAppointments
  ]);

  // Real billing statistics
  const billingStats = useMemo(() => {
    const totalBills = billings.length;

    const totalBillingAmount = billings.reduce(
      (sum, billing) =>
        sum + Number(billing.totalAmount || 0),
      0
    );

    const paidAmount = billings.reduce(
      (sum, billing) =>
        sum + Number(billing.paidAmount || 0),
      0
    );

    const dueAmount = billings.reduce(
      (sum, billing) =>
        sum + Number(billing.dueAmount || 0),
      0
    );

    const pendingBills = billings.filter(
      (billing) =>
        String(
          billing.paymentStatus || ""
        ).toUpperCase() === "PENDING"
    ).length;

    const partialBills = billings.filter(
      (billing) =>
        String(
          billing.paymentStatus || ""
        ).toUpperCase() === "PARTIAL"
    ).length;

    const paidBills = billings.filter(
      (billing) =>
        String(
          billing.paymentStatus || ""
        ).toUpperCase() === "PAID"
    ).length;

    return {
      totalBills,
      totalBillingAmount,
      paidAmount,
      dueAmount,
      pendingBills,
      partialBills,
      paidBills
    };
  }, [billings]);

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const getStatusClass = (status) => {
    switch (
      String(status || "")
        .toLowerCase()
    ) {
      case 'confirmed':
        return 'bg-lime-100 text-lime-800';

      case 'pending':
        return 'bg-yellow-100 text-yellow-800';

      case 'cancelled':
        return 'bg-red-100 text-red-800';

      case 'completed':
        return 'bg-lime-200 text-lime-900';

      case 'rescheduled':
        return 'bg-lime-50 text-lime-800';

      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /* ============================================================
     PROFESSIONAL DASHBOARD ANALYTICS
  ============================================================ */

  const chartTooltipStyle = {
    backgroundColor: "#ffffff",
    border: "1px solid #bef264",
    borderRadius: "12px",
    color: "#1f2937",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)"
  };

  const chartGridColor = "#e5e7eb";

  const limeGradientId = "dashboardLimeGradient";
  const limeGradientDarkId = "dashboardLimeGradientDark";

  /* ============================================================
     APPOINTMENT STATUS DONUT
  ============================================================ */

  const appointmentStatusData = useMemo(() => {
    return [
      {
        name: "Pending",
        value: appointmentStats.pending
      },
      {
        name: "Confirmed",
        value: appointmentStats.confirmed
      },
      {
        name: "Completed",
        value: appointmentStats.completed
      },
      {
        name: "Cancelled",
        value: appointmentStats.cancelled
      }
    ];
  }, [appointmentStats]);

  const appointmentStatusColors = [
    "#d9f99d",
    "#84cc16",
    "#4d7c0f",
    "#ef4444"
  ];

  /* ============================================================
     BILLING STATUS DONUT
  ============================================================ */

  const billingStatusData = useMemo(() => {
    return [
      {
        name: "Paid",
        value: billingStats.paidBills
      },
      {
        name: "Partial",
        value: billingStats.partialBills
      },
      {
        name: "Pending",
        value: billingStats.pendingBills
      }
    ];
  }, [billingStats]);

  const billingStatusColors = [
    "#84cc16",
    "#a3e635",
    "#facc15"
  ];

  /* ============================================================
     SYSTEM MODULE BAR CHART
  ============================================================ */

  const systemModuleData = useMemo(() => {
    return [
      {
        module: "Patients",
        records: patients.length
      },
      {
        module: "Doctors",
        records: doctors.length
      },
      {
        module: "Appointments",
        records: appointments.length
      },
      {
        module: "Prescriptions",
        records: prescriptions.length
      },
      {
        module: "Bills",
        records: billings.length
      },
      {
        module: "Lab Reports",
        records: labReports.length
      },
      {
        module: "Medical Records",
        records: medicalRecords.length
      }
    ];
  }, [
    patients,
    doctors,
    appointments,
    prescriptions,
    billings,
    labReports,
    medicalRecords
  ]);

  /* ============================================================
     DOCTOR WORKLOAD HISTOGRAM
  ============================================================ */

  const doctorWorkloadData = useMemo(() => {
    const workloadMap = {};

    doctors.forEach((doctor) => {
      workloadMap[doctor.id] = {
        doctorId: doctor.id,
        doctor:
          doctor.name ||
          doctor.id ||
          "Doctor",
        appointments: 0,
        prescriptions: 0
      };
    });

    appointments.forEach((appointment) => {
      const doctorId =
        appointment?.doctorId ||
        appointment?.doctor?.id;

      if (
        doctorId &&
        workloadMap[String(doctorId)]
      ) {
        workloadMap[String(doctorId)].appointments += 1;
      }
    });

    prescriptions.forEach((prescription) => {
      const doctorId =
        prescription?.doctorId ||
        prescription?.doctor?.id;

      if (
        doctorId &&
        workloadMap[String(doctorId)]
      ) {
        workloadMap[String(doctorId)].prescriptions += 1;
      }
    });

    return Object.values(workloadMap)
      .sort(
        (a, b) =>
          b.appointments -
          a.appointments
      )
      .slice(0, 8);
  }, [
    doctors,
    appointments,
    prescriptions
  ]);

  /* ============================================================
     MONTHLY ACTIVITY DATA
  ============================================================ */

  const monthlyActivityData = useMemo(() => {
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

    const data = months.map(
      (month, index) => ({
        month,
        appointments: 0,
        prescriptions: 0,
        labReports: 0,
        medicalRecords: 0,
        monthIndex: index
      })
    );

    appointments.forEach(
      (appointment) => {
        if (!appointment.date) return;

        const date =
          new Date(appointment.date);

        if (
          date.getFullYear() ===
          currentYear
        ) {
          data[
            date.getMonth()
          ].appointments += 1;
        }
      }
    );

    prescriptions.forEach(
      (prescription) => {
        const value =
          prescription.prescriptionDate ||
          prescription.date ||
          prescription.createdAt;

        if (!value) return;

        const date =
          new Date(value);

        if (
          date.getFullYear() ===
          currentYear
        ) {
          data[
            date.getMonth()
          ].prescriptions += 1;
        }
      }
    );

    labReports.forEach(
      (report) => {
        const value =
          report.reportDate ||
          report.date ||
          report.createdAt;

        if (!value) return;

        const date =
          new Date(value);

        if (
          date.getFullYear() ===
          currentYear
        ) {
          data[
            date.getMonth()
          ].labReports += 1;
        }
      }
    );

    medicalRecords.forEach(
      (record) => {
        const value =
          record.recordDate ||
          record.date ||
          record.createdAt;

        if (!value) return;

        const date =
          new Date(value);

        if (
          date.getFullYear() ===
          currentYear
        ) {
          data[
            date.getMonth()
          ].medicalRecords += 1;
        }
      }
    );

    return data;
  }, [
    appointments,
    prescriptions,
    labReports,
    medicalRecords
  ]);

  /* ============================================================
     RANGE / MOUNTAIN GRAPH DATA
  ============================================================ */

  const activityRangeData = useMemo(() => {
    return monthlyActivityData.map(
      (item) => ({
        month: item.month,
        lower:
          Math.max(
            0,
            item.appointments -
              Math.round(
                item.appointments *
                  0.35
              )
          ),
        activity:
          item.appointments +
          item.prescriptions +
          item.labReports,
        upper:
          item.appointments +
          item.prescriptions +
          item.labReports +
          item.medicalRecords
      })
    );
  }, [monthlyActivityData]);

  /* ============================================================
     PRESCRIPTION STATUS HISTOGRAM
  ============================================================ */

  const prescriptionStatusData = useMemo(() => {
    const counts = {
      Pending: 0,
      Active: 0,
      Completed: 0,
      Cancelled: 0
    };

    prescriptions.forEach(
      (prescription) => {
        const status = String(
          prescription.status || ""
        )
          .trim()
          .toLowerCase();

        if (
          status.includes("pending")
        ) {
          counts.Pending += 1;
        } else if (
          status.includes("active") ||
          status.includes("issued") ||
          status === ""
        ) {
          counts.Active += 1;
        } else if (
          status.includes(
            "completed"
          ) ||
          status.includes(
            "complete"
          )
        ) {
          counts.Completed += 1;
        } else if (
          status.includes(
            "cancelled"
          ) ||
          status.includes(
            "canceled"
          )
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
        prescriptions: counts.Pending
      },
      {
        status: "Active",
        prescriptions: counts.Active
      },
      {
        status: "Completed",
        prescriptions: counts.Completed
      },
      {
        status: "Cancelled",
        prescriptions: counts.Cancelled
      }
    ];
  }, [prescriptions]);

  /* ============================================================
     NOTIFICATION ANALYTICS
  ============================================================ */

  const notificationData = useMemo(() => {
    const doctorNotifications =
      notifications.filter(
        (notification) =>
          String(
            notification.recipientType ||
              ""
          ).toUpperCase() ===
          "DOCTOR"
      ).length;

    const patientNotifications =
      notifications.filter(
        (notification) =>
          String(
            notification.recipientType ||
              ""
          ).toUpperCase() ===
          "PATIENT"
      ).length;

    const unreadNotifications =
      notifications.filter(
        (notification) =>
          !notification.read
      ).length;

    const readNotifications =
      notifications.filter(
        (notification) =>
          notification.read
      ).length;

    return {
      doctorNotifications,
      patientNotifications,
      unreadNotifications,
      readNotifications
    };
  }, [notifications]);

  /* ============================================================
     RECENT DASHBOARD ACTIVITY
  ============================================================ */

  const dashboardActivity = useMemo(() => {
    const activities = [];

    appointments
      .slice()
      .sort(
        (a, b) =>
          new Date(
            `${b.date || "1900-01-01"}T${
              b.time || "00:00"
            }`
          ) -
          new Date(
            `${a.date || "1900-01-01"}T${
              a.time || "00:00"
            }`
          )
      )
      .slice(0, 4)
      .forEach(
        (appointment) => {
          activities.push({
            type: "Appointment",
            title:
              "Appointment activity",
            detail:
              `${getPatientName(
                appointment
              )} with ${getDoctorName(
                appointment
              )}`,
            date:
              appointment.date ||
              "Date unavailable",
            icon: CalendarCheck
          });
        }
      );

    notifications
      .slice(0, 3)
      .forEach(
        (notification) => {
          activities.push({
            type: "Notification",
            title:
              notification.title ||
              "Notification",
            detail:
              notification.message ||
              "Notification activity",
            date:
              notification.createdAt ||
              "Recent",
            icon: Bell
          });
        }
      );

    return activities.slice(0, 7);
  }, [
    appointments,
    notifications,
    getPatientName,
    getDoctorName
  ]);

  /* ============================================================
     DASHBOARD HERO VALUES
  ============================================================ */

  const dashboardOverview = useMemo(() => {
    return {
      totalPatients:
        patients.length,
      totalDoctors:
        doctors.length,
      totalAppointments:
        appointments.length,
      totalPrescriptions:
        prescriptions.length,
      totalBills:
        billings.length,
      totalLabReports:
        labReports.length,
      totalMedicalRecords:
        medicalRecords.length,
      totalNotifications:
        notifications.length
    };
  }, [
    patients,
    doctors,
    appointments,
    prescriptions,
    billings,
    labReports,
    medicalRecords,
    notifications
  ]);

  // SWITCH CASE MODULE RENDERING
  
  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return (
          <div className="space-y-6">

            {/* ============================================================
                PROFESSIONAL DASHBOARD HEADER
            ============================================================ */}

            <div className="relative overflow-hidden rounded-3xl bg-white text-gray-800 shadow-sm border border-lime-200">

              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime-100 blur-3xl" />
                <div className="absolute -left-20 -bottom-32 h-72 w-72 rounded-full bg-lime-50 blur-3xl" />
              </div>

              <div className="relative p-6 md:p-8">

                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

                  <div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-lime-300 bg-lime-50 px-3 py-1.5 text-xs font-semibold text-lime-700 mb-4">

                      <Activity size={14} />

                      HAMS ADMIN ANALYTICS

                    </div>

                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-800">

                      Hospital Management
                      <span className="text-lime-500">
                        {" "}Overview
                      </span>

                    </h1>

                    <p className="text-gray-500 mt-2 max-w-2xl text-sm md:text-base">

                      Real-time operational analytics across
                      patients, doctors, appointments,
                      prescriptions, billing, laboratory
                      reports and medical records.

                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={loadDashboardData}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-lime-300 bg-lime-50 px-5 py-3 text-sm font-semibold text-lime-700 hover:bg-lime-100 hover:border-lime-400 transition disabled:opacity-50"
                  >

                    <RefreshCw
                      size={17}
                      className={
                        loading
                          ? "animate-spin"
                          : ""
                      }
                    />

                    {loading
                      ? "Refreshing..."
                      : "Refresh Dashboard"}

                  </button>

                </div>

                {/* ============================================================
                    SINGLE SYSTEM OVERVIEW STRIP
                ============================================================ */}

                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mt-8">

                  <div className="rounded-2xl border border-lime-100 bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-500">
                      Patients
                    </p>
                    <p className="text-xl font-bold text-lime-600 mt-1">
                      {loading
                        ? "..."
                        : dashboardOverview.totalPatients}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-lime-100 bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-500">
                      Doctors
                    </p>
                    <p className="text-xl font-bold text-lime-600 mt-1">
                      {loading
                        ? "..."
                        : dashboardOverview.totalDoctors}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-lime-100 bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-500">
                      Appointments
                    </p>
                    <p className="text-xl font-bold text-lime-600 mt-1">
                      {loading
                        ? "..."
                        : dashboardOverview.totalAppointments}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-lime-100 bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-500">
                      Prescriptions
                    </p>
                    <p className="text-xl font-bold text-lime-600 mt-1">
                      {loading
                        ? "..."
                        : dashboardOverview.totalPrescriptions}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-lime-100 bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-500">
                      Bills
                    </p>
                    <p className="text-xl font-bold text-lime-600 mt-1">
                      {loading
                        ? "..."
                        : dashboardOverview.totalBills}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-lime-100 bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-500">
                      Labs
                    </p>
                    <p className="text-xl font-bold text-lime-600 mt-1">
                      {loading
                        ? "..."
                        : dashboardOverview.totalLabReports}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-lime-100 bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-500">
                      Records
                    </p>
                    <p className="text-xl font-bold text-lime-600 mt-1">
                      {loading
                        ? "..."
                        : dashboardOverview.totalMedicalRecords}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-lime-100 bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-500">
                      Alerts
                    </p>
                    <p className="text-xl font-bold text-lime-600 mt-1">
                      {loading
                        ? "..."
                        : dashboardOverview.totalNotifications}
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
                {error}
              </div>
            )}

            {/* ============================================================
                TOP ANALYTICS — DONUT CHARTS
            ============================================================ */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Appointment Status Donut */}

              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="p-5 md:p-6 border-b border-gray-100">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                        Appointment Analytics
                      </p>

                      <h2 className="text-xl font-bold text-gray-800 mt-1">
                        Appointments By Status
                      </h2>

                    </div>

                    <div className="w-11 h-11 rounded-xl bg-lime-50 flex items-center justify-center text-lime-600">
                      <CalendarCheck size={21} />
                    </div>

                  </div>

                </div>

                <div className="h-[330px] p-4">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <PieChart>

                      <Pie
                        data={
                          appointmentStatusData
                        }
                        cx="42%"
                        cy="50%"
                        innerRadius={76}
                        outerRadius={116}
                        paddingAngle={5}
                        cornerRadius={8}
                        dataKey="value"
                        stroke="#ffffff"
                        strokeWidth={3}
                      >

                        {appointmentStatusData.map(
                          (entry, index) => (
                            <Cell
                              key={
                                entry.name
                              }
                              fill={
                                appointmentStatusColors[
                                  index %
                                    appointmentStatusColors.length
                                ]
                              }
                            />
                          )
                        )}

                      </Pie>

                      <text
                        x="42%"
                        y="47%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-gray-800"
                        style={{
                          fontSize: "28px",
                          fontWeight: 700
                        }}
                      >
                        {appointmentStats.total}
                      </text>

                      <text
                        x="42%"
                        y="56%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-gray-400"
                        style={{
                          fontSize: "11px",
                          fontWeight: 600
                        }}
                      >
                        Total
                      </text>

                      <Tooltip
                        contentStyle={
                          chartTooltipStyle
                        }
                        itemStyle={{
                          color: "#374151"
                        }}
                        labelStyle={{
                          color: "#1f2937",
                          fontWeight: 600
                        }}
                      />

                      <Legend
                        verticalAlign="middle"
                        align="right"
                        layout="vertical"
                        iconType="circle"
                        wrapperStyle={{
                          fontSize: "12px",
                          color: "#4b5563"
                        }}
                      />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

                <div className="px-6 pb-5">

                  <div className="flex items-center justify-between rounded-2xl bg-lime-50 border border-lime-100 px-4 py-3">

                    <div>
                      <p className="text-xs text-gray-500">
                        Total appointments
                      </p>
                      <p className="text-lg font-bold text-gray-800">
                        {appointmentStats.total}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Today
                      </p>
                      <p className="text-lg font-bold text-lime-700">
                        {appointmentStats.today}
                      </p>
                    </div>

                  </div>

                </div>

              </div>

              {/* Billing Status Donut */}

              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="p-5 md:p-6 border-b border-gray-100">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                        Financial Analytics
                      </p>

                      <h2 className="text-xl font-bold text-gray-800 mt-1">
                        Billing Status Distribution
                      </h2>

                    </div>

                    <div className="w-11 h-11 rounded-xl bg-lime-50 flex items-center justify-center text-lime-600">
                      <WalletCards size={21} />
                    </div>

                  </div>

                </div>

                <div className="h-[330px] p-4">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <PieChart>

                      <Pie
                        data={
                          billingStatusData
                        }
                        cx="42%"
                        cy="50%"
                        innerRadius={76}
                        outerRadius={116}
                        paddingAngle={5}
                        cornerRadius={8}
                        dataKey="value"
                        stroke="#ffffff"
                        strokeWidth={3}
                      >

                        {billingStatusData.map(
                          (entry, index) => (
                            <Cell
                              key={
                                entry.name
                              }
                              fill={
                                billingStatusColors[
                                  index %
                                    billingStatusColors.length
                                ]
                              }
                            />
                          )
                        )}

                      </Pie>

                      <text
                        x="42%"
                        y="47%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-gray-800"
                        style={{
                          fontSize: "28px",
                          fontWeight: 700
                        }}
                      >
                        {billingStats.totalBills}
                      </text>

                      <text
                        x="42%"
                        y="56%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-gray-400"
                        style={{
                          fontSize: "11px",
                          fontWeight: 600
                        }}
                      >
                        Bills
                      </text>

                      <Tooltip
                        contentStyle={
                          chartTooltipStyle
                        }
                        itemStyle={{
                          color: "#374151"
                        }}
                        labelStyle={{
                          color: "#1f2937",
                          fontWeight: 600
                        }}
                      />

                      <Legend
                        verticalAlign="middle"
                        align="right"
                        layout="vertical"
                        iconType="circle"
                        wrapperStyle={{
                          fontSize: "12px",
                          color: "#4b5563"
                        }}
                      />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

                <div className="px-6 pb-5">

                  <div className="grid grid-cols-3 gap-3">

                    <div className="rounded-2xl bg-lime-50 p-3">
                      <p className="text-xs text-gray-500">
                        Paid
                      </p>
                      <p className="font-bold text-lime-700 mt-1">
                        {formatCurrency(
                          billingStats.paidAmount
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Due
                      </p>
                      <p className="font-bold text-red-600 mt-1">
                        {formatCurrency(
                          billingStats.dueAmount
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-lime-50 p-3">
                      <p className="text-xs text-gray-500">
                        Bills
                      </p>
                      <p className="font-bold text-gray-800 mt-1">
                        {billingStats.totalBills}
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* ============================================================
                MOUNTAIN / RANGE AREA GRAPH
            ============================================================ */}

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

              <div className="p-5 md:p-6">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                      Operational Range
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-1">
                      HAMS Activity Range
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Mountain-style area visualization of operational activity
                    </p>

                  </div>

                  <div className="inline-flex items-center gap-2 rounded-xl bg-lime-50 border border-lime-100 px-3 py-2 text-xs font-semibold text-lime-700">

                    <Activity size={14} />

                    Live backend data

                  </div>

                </div>

                <div className="h-[330px] mt-5">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <AreaChart
                      data={
                        activityRangeData
                      }
                      margin={{
                        top: 15,
                        right: 15,
                        left: 0,
                        bottom: 5
                      }}
                    >

                      <defs>

                        <linearGradient
                          id={
                            limeGradientId
                          }
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >

                          <stop
                            offset="0%"
                            stopColor="#84cc16"
                            stopOpacity={0.55}
                          />

                          <stop
                            offset="100%"
                            stopColor="#84cc16"
                            stopOpacity={0.04}
                          />

                        </linearGradient>

                        <linearGradient
                          id={
                            limeGradientDarkId
                          }
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >

                          <stop
                            offset="0%"
                            stopColor="#65a30d"
                            stopOpacity={0.35}
                          />

                          <stop
                            offset="100%"
                            stopColor="#65a30d"
                            stopOpacity={0.02}
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
                          fontSize: 12
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={{
                          fill: "#6b7280",
                          fontSize: 12
                        }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />

                      <Tooltip
                        contentStyle={
                          chartTooltipStyle
                        }
                        itemStyle={{
                          color: "#374151"
                        }}
                        labelStyle={{
                          color: "#1f2937",
                          fontWeight: 600
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="upper"
                        name="Upper Activity Range"
                        stroke="#65a30d"
                        fill={`url(#${limeGradientDarkId})`}
                        strokeWidth={2}
                      />

                      <Area
                        type="monotone"
                        dataKey="activity"
                        name="Current Activity"
                        stroke="#84cc16"
                        fill={`url(#${limeGradientId})`}
                        strokeWidth={3}
                      />

                      <Area
                        type="monotone"
                        dataKey="lower"
                        name="Lower Activity Range"
                        stroke="#a3e635"
                        fill="transparent"
                        strokeWidth={2}
                        strokeDasharray="6 5"
                      />

                    </AreaChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </div>

            {/* ============================================================
                SYSTEM MODULE BAR CHART + DOCTOR HISTOGRAM
            ============================================================ */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* System Module Bar Chart */}

              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="p-5 md:p-6">

                  <div className="flex items-center justify-between mb-5">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                        System Coverage
                      </p>

                      <h2 className="text-xl font-bold text-gray-800 mt-1">
                        Records By Module
                      </h2>

                    </div>

                    <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center text-lime-600">
                      <ClipboardList size={20} />
                    </div>

                  </div>

                  <div className="h-[350px]">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <BarChart
                        data={
                          systemModuleData
                        }
                        margin={{
                          top: 10,
                          right: 10,
                          left: -10,
                          bottom: 45
                        }}
                      >

                        <CartesianGrid
                          stroke="#e5e7eb"
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="module"
                          angle={-25}
                          textAnchor="end"
                          interval={0}
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
                          itemStyle={{
                            color: "#374151"
                          }}
                          labelStyle={{
                            color: "#1f2937",
                            fontWeight: 600
                          }}
                        />

                        <Bar
                          dataKey="records"
                          name="Records"
                          fill="#84cc16"
                          radius={[
                            8,
                            8,
                            0,
                            0
                          ]}
                          maxBarSize={42}
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  </div>

                </div>

              </div>

              {/* Doctor Workload Histogram */}

              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="p-5 md:p-6">

                  <div className="flex items-center justify-between mb-5">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                        Clinical Operations
                      </p>

                      <h2 className="text-xl font-bold text-gray-800 mt-1">
                        Doctor Workload
                      </h2>

                    </div>

                    <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center text-lime-600">
                      <Stethoscope size={20} />
                    </div>

                  </div>

                  <div className="h-[350px]">

                    {doctorWorkloadData.length === 0 ? (

                      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                        No doctor workload data available.
                      </div>

                    ) : (

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <BarChart
                          data={
                            doctorWorkloadData
                          }
                          layout="vertical"
                          margin={{
                            top: 10,
                            right: 15,
                            left: 15,
                            bottom: 10
                          }}
                        >

                          <CartesianGrid
                            stroke="#e5e7eb"
                            strokeDasharray="3 3"
                            horizontal={false}
                          />

                          <XAxis
                            type="number"
                            allowDecimals={false}
                            tick={{
                              fill: "#6b7280",
                              fontSize: 11
                            }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            type="category"
                            dataKey="doctor"
                            width={90}
                            tick={{
                              fill: "#4b5563",
                              fontSize: 11
                            }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <Tooltip
                            contentStyle={
                              chartTooltipStyle
                            }
                            itemStyle={{
                              color: "#374151"
                            }}
                            labelStyle={{
                              color: "#1f2937",
                              fontWeight: 600
                            }}
                          />

                          <Bar
                            dataKey="appointments"
                            name="Appointments"
                            fill="#84cc16"
                            radius={[
                              0,
                              8,
                              8,
                              0
                            ]}
                            maxBarSize={22}
                          />

                          <Bar
                            dataKey="prescriptions"
                            name="Prescriptions"
                            fill="#bef264"
                            radius={[
                              0,
                              8,
                              8,
                              0
                            ]}
                            maxBarSize={22}
                          />

                        </BarChart>

                      </ResponsiveContainer>

                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* ============================================================
                PRESCRIPTION HISTOGRAM + NOTIFICATION ANALYTICS
            ============================================================ */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Prescription Histogram */}

              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="p-5 md:p-6">

                  <div className="flex items-center justify-between mb-5">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                        Prescription Analytics
                      </p>

                      <h2 className="text-xl font-bold text-gray-800 mt-1">
                        Prescription Status
                      </h2>

                    </div>

                    <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center text-lime-600">
                      <FileText size={20} />
                    </div>

                  </div>

                  <div className="h-[310px]">

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
                          right: 10,
                          left: 0,
                          bottom: 10
                        }}
                      >

                        <CartesianGrid
                          stroke="#e5e7eb"
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
                          itemStyle={{
                            color: "#374151"
                          }}
                          labelStyle={{
                            color: "#1f2937",
                            fontWeight: 600
                          }}
                        />

                        <Bar
                          dataKey="prescriptions"
                          name="Prescriptions"
                          fill="#84cc16"
                          radius={[
                            8,
                            8,
                            0,
                            0
                          ]}
                          maxBarSize={55}
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  </div>

                </div>

              </div>

              {/* Notification Analytics */}

              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="p-5 md:p-6">

                  <div className="flex items-center justify-between mb-5">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                        Notification Center
                      </p>

                      <h2 className="text-xl font-bold text-gray-800 mt-1">
                        Notification Overview
                      </h2>

                    </div>

                    <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center text-lime-600">
                      <Bell size={20} />
                    </div>

                  </div>

                  <div className="space-y-4">

                    <div className="rounded-2xl bg-lime-50 border border-lime-100 p-4">

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-xl bg-lime-100 flex items-center justify-center text-lime-700">
                            <Stethoscope size={18} />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              Doctor Notifications
                            </p>
                            <p className="text-xs text-gray-500">
                              Alerts sent to doctors
                            </p>
                          </div>

                        </div>

                        <p className="text-2xl font-bold text-lime-700">
                          {
                            notificationData.doctorNotifications
                          }
                        </p>

                      </div>

                    </div>

                    <div className="rounded-2xl bg-lime-50 border border-lime-100 p-4">

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-xl bg-lime-100 flex items-center justify-center text-lime-700">
                            <Users size={18} />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              Patient Notifications
                            </p>
                            <p className="text-xs text-gray-500">
                              Alerts sent to patients
                            </p>
                          </div>

                        </div>

                        <p className="text-2xl font-bold text-lime-700">
                          {
                            notificationData.patientNotifications
                          }
                        </p>

                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">

                        <div className="flex items-center gap-2">

                          <Bell
                            size={17}
                            className="text-lime-600"
                          />

                          <p className="text-xs font-semibold text-gray-500">
                            Unread
                          </p>

                        </div>

                        <p className="text-2xl font-bold text-gray-800 mt-2">
                          {
                            notificationData.unreadNotifications
                          }
                        </p>

                      </div>

                      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">

                        <div className="flex items-center gap-2">

                          <CheckCircle2
                            size={17}
                            className="text-lime-600"
                          />

                          <p className="text-xs font-semibold text-gray-500">
                            Read
                          </p>

                        </div>

                        <p className="text-2xl font-bold text-gray-800 mt-2">
                          {
                            notificationData.readNotifications
                          }
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* ============================================================
                CLINICAL / FINANCIAL RANGE
            ============================================================ */}

            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-200">

              <div className="p-5 md:p-6">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-lime-600">
                      Clinical Activity
                    </p>

                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                      Multi-Service Activity Graph
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Appointments, prescriptions, laboratory reports and medical records
                    </p>

                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">

                    <span className="inline-flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-lime-300" />
                      Appointments
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-lime-500" />
                      Prescriptions
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-lime-700" />
                      Lab Reports
                    </span>

                  </div>

                </div>

                <div className="h-[350px] mt-5">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <LineChart
                      data={
                        monthlyActivityData
                      }
                      margin={{
                        top: 10,
                        right: 15,
                        left: 0,
                        bottom: 5
                      }}
                    >

                      <CartesianGrid
                        stroke="#e5e7eb"
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="month"
                        tick={{
                          fill: "#6b7280",
                          fontSize: 12
                        }}
                        axisLine={{
                          stroke: "#d1d5db"
                        }}
                        tickLine={false}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fill: "#6b7280",
                          fontSize: 12
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={
                          chartTooltipStyle
                        }
                        itemStyle={{
                          color: "#374151"
                        }}
                        labelStyle={{
                          color: "#1f2937",
                          fontWeight: 600
                        }}
                      />

                      <ReferenceLine
                        y={0}
                        stroke="#d1d5db"
                      />

                      <Line
                        type="monotone"
                        dataKey="appointments"
                        name="Appointments"
                        stroke="#bef264"
                        strokeWidth={3}
                        dot={false}
                      />

                      <Line
                        type="monotone"
                        dataKey="prescriptions"
                        name="Prescriptions"
                        stroke="#84cc16"
                        strokeWidth={2}
                        dot={false}
                      />

                      <Line
                        type="monotone"
                        dataKey="labReports"
                        name="Laboratory Reports"
                        stroke="#65a30d"
                        strokeWidth={2}
                        dot={false}
                      />

                      <Line
                        type="monotone"
                        dataKey="medicalRecords"
                        name="Medical Records"
                        stroke="#4d7c0f"
                        strokeWidth={2}
                        dot={false}
                      />

                    </LineChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </div>

            {/* ============================================================
                BILLING FINANCIAL SUMMARY
            ============================================================ */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-white rounded-3xl border border-lime-100 shadow-sm p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm text-gray-500">
                      Total Billing Value
                    </p>

                    <p className="text-2xl font-bold text-gray-800 mt-2">
                      {formatCurrency(
                        billingStats.totalBillingAmount
                      )}
                    </p>

                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-lime-50 flex items-center justify-center text-lime-600">
                    <CircleDollarSign size={23} />
                  </div>

                </div>

                <div className="mt-5 h-2 rounded-full bg-gray-100 overflow-hidden">

                  <div
                    className="h-full rounded-full bg-lime-500"
                    style={{
                      width:
                        billingStats.totalBillingAmount > 0
                          ? `${Math.min(
                              100,
                              (
                                billingStats.paidAmount /
                                billingStats.totalBillingAmount
                              ) * 100
                            )}%`
                          : "0%"
                    }}
                  />

                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Paid amount against total billing value
                </p>

              </div>

              <div className="bg-white rounded-3xl border border-lime-100 shadow-sm p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm text-gray-500">
                      Paid Amount
                    </p>

                    <p className="text-2xl font-bold text-lime-700 mt-2">
                      {formatCurrency(
                        billingStats.paidAmount
                      )}
                    </p>

                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-lime-50 flex items-center justify-center text-lime-600">
                    <MdPayment className="text-2xl" />
                  </div>

                </div>

                <p className="text-xs text-gray-400 mt-5">
                  {billingStats.paidBills} fully paid bill(s)
                </p>

              </div>

              <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm text-gray-500">
                      Outstanding Due
                    </p>

                    <p className="text-2xl font-bold text-red-600 mt-2">
                      {formatCurrency(
                        billingStats.dueAmount
                      )}
                    </p>

                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-lime-50 flex items-center justify-center text-red-600">
                    <MdAttachMoney className="text-2xl" />
                  </div>

                </div>

                <p className="text-xs text-gray-400 mt-5">
                  Pending and outstanding payments
                </p>

              </div>

            </div>

            {/* ============================================================
                RECENT ACTIVITY + RECENT APPOINTMENTS
            ============================================================ */}

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

              {/* Recent Activity */}

              <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="p-5 border-b border-gray-100">

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="text-lg font-bold text-gray-800">
                        Recent Activity
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        Latest system events
                      </p>

                    </div>

                    <Activity
                      size={20}
                      className="text-lime-600"
                    />

                  </div>

                </div>

                <div className="p-5 space-y-4">

                  {dashboardActivity.length === 0 ? (

                    <div className="py-8 text-center text-gray-400 text-sm">
                      No recent activity available.
                    </div>

                  ) : (

                    dashboardActivity.map(
                      (activity, index) => {

                        const ActivityIcon =
                          activity.icon;

                        return (

                          <div
                            key={`${activity.type}-${index}`}
                            className="flex gap-3"
                          >

                            <div className="w-10 h-10 rounded-xl bg-lime-50 text-lime-600 flex items-center justify-center shrink-0">
                              <ActivityIcon
                                size={18}
                              />
                            </div>

                            <div className="min-w-0">

                              <p className="font-semibold text-sm text-gray-800 truncate">
                                {activity.title}
                              </p>

                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {activity.detail}
                              </p>

                              <p className="text-[11px] text-gray-400 mt-1">
                                {activity.date}
                              </p>

                            </div>

                          </div>

                        );
                      }
                    )

                  )}

                </div>

              </div>

              {/* Recent Appointments */}

              <div className="xl:col-span-3 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="p-5 md:p-6 border-b border-gray-100">

                  <div className="flex justify-between items-center">

                    <div>

                      <h3 className="text-lg font-semibold text-gray-800">
                        Recent Appointments
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        Latest appointments from the backend
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={
                        loadDashboardData
                      }
                      disabled={loading}
                      className="inline-flex items-center gap-2 text-lime-600 hover:text-lime-700 font-medium disabled:opacity-50"
                    >

                      <RefreshCw
                        size={15}
                        className={
                          loading
                            ? "animate-spin"
                            : ""
                        }
                      />

                      {loading
                        ? "Refreshing..."
                        : "Refresh"}

                    </button>

                  </div>

                </div>

                <div className="overflow-x-auto">

                  {loading ? (

                    <div className="py-10 text-center text-gray-500">
                      Loading appointments...
                    </div>

                  ) : recentAppointments.length === 0 ? (

                    <div className="py-10 text-center">

                      <MdCalendarToday className="text-4xl text-gray-300 mx-auto" />

                      <p className="text-gray-500 mt-3">
                        No appointments found.
                      </p>

                    </div>

                  ) : (

                    <table className="w-full">

                      <thead>

                        <tr className="text-left text-gray-500 border-b bg-gray-50/70">

                          <th className="px-5 py-3 text-xs uppercase tracking-wider">
                            Patient
                          </th>

                          <th className="px-5 py-3 text-xs uppercase tracking-wider">
                            Doctor
                          </th>

                          <th className="px-5 py-3 text-xs uppercase tracking-wider">
                            Date
                          </th>

                          <th className="px-5 py-3 text-xs uppercase tracking-wider">
                            Time
                          </th>

                          <th className="px-5 py-3 text-xs uppercase tracking-wider">
                            Status
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {recentAppointments.map(
                          (appointment) => (

                            <tr
                              key={
                                appointment.id
                              }
                              className="border-b border-gray-100 hover:bg-lime-50/30 transition"
                            >

                              <td className="px-5 py-4 text-sm font-medium text-gray-800">

                                {getPatientName(
                                  appointment
                                )}

                              </td>

                              <td className="px-5 py-4 text-sm text-gray-600">

                                {getDoctorName(
                                  appointment
                                )}

                              </td>

                              <td className="px-5 py-4 text-sm text-gray-600">

                                {appointment.date ||
                                  "N/A"}

                              </td>

                              <td className="px-5 py-4 text-sm text-gray-600">

                                {formatAppointmentTime(
                                  appointment.time
                                )}

                              </td>

                              <td className="px-5 py-4">

                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                                    appointment.status
                                  )}`}
                                >

                                  {appointment.status ||
                                    "Unknown"}

                                </span>

                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  )}

                </div>

              </div>

            </div>

          </div>
        );

      case "doctor-management":
        return <DoctorManagement />;

      case "Profile":
        return (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Profile
            </h3>
            <p className="text-gray-600">
              Admin profile module is under development.
            </p>
          </div>
        );

      case "patient-management":
        return <PatientManagement />;

      case "appointment":
        return <AppointmentSchedulling />;

      case "prescription":
        return <Prescription />;

      case "billing":
        return <Billingandpayment />;

      case "laboratory-management":
        return <LabReports />;

      case "medical-records": 
        return <MedicalHistory />;  

      case "reports":
        return <Reports />; 
        
      case "notifications":
        return <Notifications />;  

      default:
        return (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
              {activeModule.replace('-', ' ')}
            </h3>
            <p className="text-gray-600">
              This module is under development. Content for {activeModule.replace('-', ' ')} will be displayed here.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Sidebar */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto mt-2 mb-2">

        {/* Header */}
        {/* <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {activeModule.replace('-', ' ')}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-lime-50">
                <MdNotificationsActive className="text-xl text-gray-600" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-lime-500 rounded-full flex items-center justify-center text-white">
                A
              </div>
              <span className="text-gray-700">Admin User</span>
            </div>
          </div>
        </header> */}

        {/* Dynamically Rendered Content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;