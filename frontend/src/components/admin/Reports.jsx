import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  FlaskConical,
  HeartPulse,
  RefreshCw,
  Stethoscope,
  Users,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../api/api";

const Reports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    try {
      setError("");

      const response = await api.get(
        "/api/reports/analytics"
      );

      setAnalytics(response.data);
    } catch (err) {
      console.error(
        "Unable to load reports analytics:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load reports and analytics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
  };

  const statusData = useMemo(() => {
    /*
     * ---------------------------------------------------------
     * ALWAYS SHOW THE MAIN APPOINTMENT STATUSES
     * ---------------------------------------------------------
     *
     * The backend only returns statuses that currently exist
     * in the appointments table.
     *
     * To make the dashboard consistent, we always display:
     * Pending, Confirmed, Completed and Cancelled.
     *
     * The actual counts still come directly from the backend.
     */

    const backendStatusSummary =
      analytics?.appointmentStatusSummary || {};

    const normalizedBackendStatuses = Object.entries(
      backendStatusSummary
    ).reduce((result, [status, count]) => {
      const normalizedStatus =
        String(status || "")
          .trim()
          .toLowerCase();

      if (normalizedStatus) {
        result[normalizedStatus] =
          Number(count) || 0;
      }

      return result;
    }, {});

    const mainStatuses = [
      {
        status: "Pending",
        count:
          normalizedBackendStatuses.pending || 0,
      },
      {
        status: "Confirmed",
        count:
          normalizedBackendStatuses.confirmed || 0,
      },
      {
        status: "Completed",
        count:
          normalizedBackendStatuses.completed || 0,
      },
      {
        status: "Cancelled",
        count:
          normalizedBackendStatuses.cancelled ||
          normalizedBackendStatuses.canceled ||
          0,
      },
    ];

    /*
     * ---------------------------------------------------------
     * INCLUDE OTHER BACKEND STATUSES IF THEY EXIST
     * ---------------------------------------------------------
     *
     * This keeps the dashboard compatible with any additional
     * appointment status values used by the backend.
     */

    const mainStatusNames = new Set([
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "canceled",
    ]);

    const additionalStatuses = Object.entries(
      normalizedBackendStatuses
    )
      .filter(
        ([status]) =>
          !mainStatusNames.has(status)
      )
      .map(([status, count]) => ({
        status:
          status.charAt(0).toUpperCase() +
          status.slice(1),
        count,
      }));

    return [
      ...mainStatuses,
      ...additionalStatuses,
    ];
  }, [analytics]);

  const doctorData = useMemo(() => {
    return analytics?.doctorAppointments || [];
  }, [analytics]);

  const patientData = useMemo(() => {
    return analytics?.patientAppointments || [];
  }, [analytics]);

  const totalStatusAppointments = useMemo(() => {
    return statusData.reduce(
      (total, item) => total + item.count,
      0
    );
  }, [statusData]);

  const getStatusColor = (status) => {
    const normalized =
      String(status || "").toLowerCase();

    if (normalized.includes("completed")) {
      return "bg-lime-500";
    }

    if (normalized.includes("confirmed")) {
      return "bg-emerald-500";
    }

    if (
      normalized.includes("pending") ||
      normalized.includes("scheduled")
    ) {
      return "bg-amber-400";
    }

    if (
      normalized.includes("cancel") ||
      normalized.includes("reject")
    ) {
      return "bg-red-500";
    }

    if (
      normalized.includes("progress") ||
      normalized.includes("active")
    ) {
      return "bg-blue-500";
    }

    return "bg-slate-500";
  };

  const getStatusIcon = (status) => {
    const normalized =
      String(status || "").toLowerCase();

    if (normalized.includes("completed")) {
      return <CheckCircle2 size={17} />;
    }

    if (normalized.includes("confirmed")) {
      return <CheckCircle2 size={17} />;
    }

    if (
      normalized.includes("cancel") ||
      normalized.includes("reject")
    ) {
      return <XCircle size={17} />;
    }

    if (
      normalized.includes("pending") ||
      normalized.includes("scheduled")
    ) {
      return <Clock3 size={17} />;
    }

    return <CalendarDays size={17} />;
  };

  const getStatusTextClass = (status) => {
    const normalized =
      String(status || "").toLowerCase();

    if (normalized.includes("completed")) {
      return "text-lime-700";
    }

    if (normalized.includes("confirmed")) {
      return "text-emerald-700";
    }

    if (
      normalized.includes("cancel") ||
      normalized.includes("reject")
    ) {
      return "text-red-600";
    }

    if (
      normalized.includes("pending") ||
      normalized.includes("scheduled")
    ) {
      return "text-amber-600";
    }

    return "text-slate-600";
  };

  const statCards = [
    // {
    //   title: "Total Patients",
    //   value: analytics?.totalPatients || 0,
    //   icon: Users,
    //   iconBg: "bg-lime-100",
    //   iconColor: "text-lime-700",
    // },
    // {
    //   title: "Total Doctors",
    //   value: analytics?.totalDoctors || 0,
    //   icon: Stethoscope,
    //   iconBg: "bg-emerald-100",
    //   iconColor: "text-emerald-700",
    // },
    {
      title: "Appointments",
      value: analytics?.totalAppointments || 0,
      icon: CalendarDays,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      title: "Prescriptions",
      value: analytics?.totalPrescriptions || 0,
      icon: FileText,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-700",
    },
    {
      title: "Lab Reports",
      value: analytics?.totalLabReports || 0,
      icon: FlaskConical,
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-700",
    },
    {
      title: "Medical Records",
      value: analytics?.totalMedicalRecords || 0,
      icon: HeartPulse,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-700",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 flex flex-col items-center justify-center">
            <RefreshCw
              className="animate-spin text-lime-600 mb-4"
              size={36}
            />

            <p className="text-slate-600 font-medium">
              Loading reports and analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ============================================================
            HEADER
        ============================================================ */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-lime-100 flex items-center justify-center">
                  <BarChart3
                    className="text-lime-700"
                    size={24}
                  />
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                    Reports & Analytics
                  </h1>

                  <p className="text-sm text-slate-500 mt-1">
                    Hospital performance and clinical activity overview
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-600 disabled:opacity-60 text-white font-semibold transition shadow-sm"
            >
              <RefreshCw
                size={18}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh Reports"}
            </button>
          </div>
        </div>

        {/* ============================================================
            ERROR
        ============================================================ */}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle
              className="text-red-600 mt-0.5"
              size={20}
            />

            <div>
              <p className="font-semibold text-red-700">
                Unable to load analytics
              </p>

              <p className="text-sm text-red-600 mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ============================================================
            STAT CARDS
        ============================================================ */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">
                      {card.title}
                    </p>

                    <p className="text-3xl font-bold text-slate-800 mt-2">
                      {card.value}
                    </p>
                  </div>

                  <div
                    className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}
                  >
                    <Icon
                      size={22}
                      className={card.iconColor}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================
            Appointment Status Overview
        ============================================================ */}


        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">

            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Appointment Status Overview
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Current appointment distribution
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center">
                <CalendarDays
                  className="text-lime-600"
                  size={20}
                />
              </div>
            </div>

            {statusData.length > 0 ? (
              <div className="space-y-5">
                {statusData.map((item) => {

                  const percentage =
                    totalStatusAppointments > 0
                      ? Math.round(
                          (item.count /
                            totalStatusAppointments) *
                            100
                        )
                      : 0;

                  return (
                    <div key={item.status}>

                      <div className="flex items-center justify-between mb-2">

                        <div className="flex items-center gap-2">
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              String(item.status || "").toLowerCase().includes("confirmed")
                                ? "bg-lime-500"
                                : String(item.status || "").toLowerCase().includes("completed")
                                ? "bg-purple-500"
                                : getStatusColor(item.status)
                            } text-white`}
                          >
                            {getStatusIcon(item.status)}
                          </span>

                          <span className="font-semibold text-slate-700 capitalize">
                            {item.status.toLowerCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            {item.count}
                          </span>

                          <span
                            className={`text-xs font-semibold ${
                              String(item.status || "").toLowerCase().includes("confirmed")
                                ? "text-lime-600"
                                : String(item.status || "").toLowerCase().includes("completed")
                                ? "text-purple-600"
                                : getStatusTextClass(item.status)
                            }`}
                          >
                            {percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            String(item.status || "").toLowerCase().includes("confirmed")
                              ? "bg-lime-500"
                              : String(item.status || "").toLowerCase().includes("completed")
                              ? "bg-purple-500"
                              : getStatusColor(item.status)
                          }`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                No appointment status data available.
              </div>
            )}
          </div>

         {/* ============================================================
            CLINICAL RECORDS DISTRIBUTION PIE CHART
        ============================================================ */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">

            <h2 className="text-lg font-bold text-slate-800">
              Clinical Records Distribution
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Prescriptions, lab reports and medical records
            </p>

            <div className="h-64 mt-3">

              {analytics ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>

                    <Pie
                      data={[
                        {
                          name: "Prescriptions",
                          value: analytics.totalPrescriptions || 0,
                        },
                        {
                          name: "Lab Reports",
                          value: analytics.totalLabReports || 0,
                        },
                        {
                          name: "Medical Records",
                          value: analytics.totalMedicalRecords || 0,
                        },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={52}
                      paddingAngle={3}
                    >

                    <Cell fill="#84cc16" />  {/* Lime Green - Prescriptions */}
                    <Cell fill="#facc15" />  {/* Yellow - Lab Reports */}
                    <Cell fill="#a855f7" />  {/* Purple - Medical Records */}

                    </Pie>

                    <Tooltip />

                    <Legend
                      verticalAlign="bottom"
                      height={36}
                    />

                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  No data
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================
            DOCTOR APPOINTMENT BAR GRAPH
        ============================================================ */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Doctor Appointment Analytics
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Appointment volume by doctor ID
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Stethoscope
                className="text-emerald-700"
                size={20}
              />
            </div>
          </div>

          <div className="h-80">

            {doctorData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={doctorData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="doctorId"
                    tick={{
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                  />

                  <Tooltip
                    formatter={(value) => [
                      value,
                      "Appointments",
                    ]}
                    labelFormatter={(label) =>
                      `Doctor ID: ${label}`
                    }
                  />

                  <Legend />

                  <Bar
                    dataKey="appointmentCount"
                    name="Appointments"
                    fill="#84cc16"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No doctor appointment data available.
              </div>
            )}
          </div>
        </div>

        {/* ============================================================
            PATIENT APPOINTMENT HISTOGRAM
        ============================================================ */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Patient Appointment Analytics
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Appointment volume by patient ID
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users
                className="text-blue-700"
                size={20}
              />
            </div>
          </div>

          <div className="h-80">

            {patientData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={patientData}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 25,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    type="number"
                    allowDecimals={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="patientId"
                    width={75}
                  />

                  <Tooltip
                    formatter={(value) => [
                      value,
                      "Appointments",
                    ]}
                    labelFormatter={(label) =>
                      `Patient ID: ${label}`
                    }
                  />

                  <Legend />

                  <Bar
                    dataKey="appointmentCount"
                    name="Appointments"
                    fill="#22c55e"
                    radius={[
                      0,
                      6,
                      6,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No patient appointment data available.
              </div>
            )}
          </div>
        </div>

        {/* ============================================================
            DOCTOR / PATIENT PERFORMANCE TABLES
        ============================================================ */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* DOCTORS */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="p-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">
                Doctor Activity
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Doctor IDs and appointment volume
              </p>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">
                      Doctor ID
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">
                      Doctor
                    </th>

                    <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase">
                      Appointments
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {doctorData.length > 0 ? (
                    doctorData.map((doctor) => (
                      <tr
                        key={doctor.doctorId}
                        className="border-t border-slate-100 hover:bg-lime-50/50"
                      >
                        <td className="px-5 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-lg bg-lime-100 text-lime-700 text-xs font-bold">
                            {doctor.doctorId}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {doctor.doctorName}
                        </td>

                        <td className="px-5 py-4 text-right font-bold text-slate-800">
                          {doctor.appointmentCount}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        No doctor activity available.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>

          {/* PATIENTS */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="p-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">
                Patient Activity
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Patient IDs and appointment volume
              </p>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">
                      Patient ID
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">
                      Patient
                    </th>

                    <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase">
                      Appointments
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {patientData.length > 0 ? (
                    patientData.map((patient) => (
                      <tr
                        key={patient.patientId}
                        className="border-t border-slate-100 hover:bg-lime-50/50"
                      >
                        <td className="px-5 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold">
                            {patient.patientId}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {patient.patientName}
                        </td>

                        <td className="px-5 py-4 text-right font-bold text-slate-800">
                          {patient.appointmentCount}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        No patient activity available.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ============================================================
            RECENT APPOINTMENTS
        ============================================================ */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="p-5 md:p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-lime-100 flex items-center justify-center">
                <CalendarDays
                  className="text-lime-700"
                  size={20}
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Recent Appointment Activity
                </h2>

                <p className="text-sm text-slate-500">
                  Doctor and patient relationship overview
                </p>
              </div>

            </div>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50">

                <tr>

                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">
                    Appointment
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">
                    Doctor ID
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">
                    Patient ID
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">
                    Doctor
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">
                    Patient
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {analytics?.recentAppointments?.length > 0 ? (
                  analytics.recentAppointments.map(
                    (appointment) => (
                      <tr
                        key={
                          appointment.appointmentId
                        }
                        className="border-t border-slate-100 hover:bg-lime-50/40 transition"
                      >

                        <td className="px-5 py-4">
                          <span className="font-semibold text-slate-700">
                            {appointment.appointmentId}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="px-2 py-1 rounded-lg bg-lime-100 text-lime-700 text-xs font-bold">
                            {appointment.doctorId}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold">
                            {appointment.patientId}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {appointment.doctorName}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {appointment.patientName}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusTextClass(
                              appointment.status
                            )} bg-slate-100`}
                          >
                            {getStatusIcon(
                              appointment.status
                            )}

                            {appointment.status ||
                              "Unknown"}
                          </span>
                        </td>

                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      No recent appointments available.
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
