import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  HeartPulse,
  Loader2,
  RefreshCw,
  Stethoscope,
  Users,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";

const Reports = () => {
  const { user } = useContext(AuthContext);

//   const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);

  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // GET LOGGED-IN USER
  // =========================================================

  const getLoggedInUser = useCallback(() => {
    if (user?.email) {
      return user;
    }

    try {
      const savedHamsUser =
        sessionStorage.getItem("hams_user") ||
        localStorage.getItem("hams_user");

      if (savedHamsUser) {
        return JSON.parse(savedHamsUser);
      }
    } catch (storageError) {
      console.error(
        "Failed to read hams_user:",
        storageError
      );
    }

    try {
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (storageError) {
      console.error(
        "Failed to read user:",
        storageError
      );
    }

    return null;
  }, [user]);

  // =========================================================
  // FIND LOGGED-IN DOCTOR
  // =========================================================

  const findCurrentDoctor = useCallback(
    (doctorList) => {
      const loggedInUser = getLoggedInUser();

      if (!loggedInUser) {
        return null;
      }

      if (loggedInUser.doctorId) {
        const doctorById = doctorList.find(
          (doctor) =>
            String(doctor.id) ===
            String(loggedInUser.doctorId)
        );

        if (doctorById) {
          return doctorById;
        }
      }

      if (!loggedInUser.email) {
        return null;
      }

      return (
        doctorList.find(
          (doctor) =>
            doctor.email?.trim().toLowerCase() ===
            loggedInUser.email?.trim().toLowerCase()
        ) || null
      );
    },
    [getLoggedInUser]
  );

  // =========================================================
  // LOAD DOCTOR REPORT DATA
  // =========================================================

  const loadReports = useCallback(
    async (showRefreshLoader = false) => {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const [
          doctorResponse,
        ] = await Promise.all([
          api.get("/api/doctors"),
          api.get("/api/patients"),
        ]);

        const doctorList = Array.isArray(
          doctorResponse.data
        )
          ? doctorResponse.data
          : [];

        const loggedInDoctor =
          findCurrentDoctor(doctorList);

        if (!loggedInDoctor) {
          setCurrentDoctor(null);
          setAppointments([]);
          setPrescriptions([]);
          setLabReports([]);
          setMedicalRecords([]);
          setError(
            "Unable to identify the logged-in doctor."
          );
          return;
        }

        setCurrentDoctor(loggedInDoctor);

        const doctorId = loggedInDoctor.id;

        // =====================================================
        // LOAD DOCTOR-SPECIFIC DATA
        // =====================================================

        const [
          appointmentResponse,
          prescriptionResponse,
          labResponse,
          medicalRecordResponse,
        ] = await Promise.all([
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
          ),
        ]);

        setAppointments(
          Array.isArray(appointmentResponse.data)
            ? appointmentResponse.data
            : []
        );

        setPrescriptions(
          Array.isArray(prescriptionResponse.data)
            ? prescriptionResponse.data
            : []
        );

        setLabReports(
          Array.isArray(labResponse.data)
            ? labResponse.data
            : []
        );

        setMedicalRecords(
          Array.isArray(
            medicalRecordResponse.data
          )
            ? medicalRecordResponse.data
            : []
        );
      } catch (loadError) {
        console.error(
          "Failed to load doctor reports:",
          loadError
        );

        setError(
          "Unable to load doctor reports. Please check the backend connection."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [findCurrentDoctor]
  );

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // =========================================================
  // STATUS COUNTS
  // =========================================================

  const statusCounts = useMemo(() => {
    const counts = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    appointments.forEach((appointment) => {
      const status = String(
        appointment.status || ""
      )
        .trim()
        .toLowerCase();

      if (status.includes("pending")) {
        counts.pending += 1;
      } else if (
        status.includes("confirmed")
      ) {
        counts.confirmed += 1;
      } else if (
        status.includes("completed")
      ) {
        counts.completed += 1;
      } else if (
        status.includes("cancelled") ||
        status.includes("canceled")
      ) {
        counts.cancelled += 1;
      }
    });

    return counts;
  }, [appointments]);

  // =========================================================
  // TOTAL STATUS APPOINTMENTS
  // =========================================================

  const totalStatusAppointments = useMemo(() => {
    return (
      statusCounts.pending +
      statusCounts.confirmed +
      statusCounts.completed +
      statusCounts.cancelled
    );
  }, [statusCounts]);

  // =========================================================
  // UNIQUE PATIENTS
  // =========================================================

  const uniquePatientIds = useMemo(() => {
    return new Set(
      appointments
        .map(
          (appointment) =>
            appointment.patientId
        )
        .filter(Boolean)
        .map((id) => String(id))
    );
  }, [appointments]);

  // =========================================================
  // STATUS OVERVIEW DATA
  // =========================================================

  const statusData = useMemo(() => {
    return [
      {
        status: "Pending",
        count: statusCounts.pending,
      },
      {
        status: "Confirmed",
        count: statusCounts.confirmed,
      },
      {
        status: "Completed",
        count: statusCounts.completed,
      },
      {
        status: "Cancelled",
        count: statusCounts.cancelled,
      },
    ];
  }, [statusCounts]);

  // =========================================================
  // PRESCRIPTION STATUS BAR GRAPH DATA
  // =========================================================

  const prescriptionStatusBarData = useMemo(() => {
    const counts = {
      Pending: 0,
      Active: 0,
      Completed: 0,
      Cancelled: 0,
    };

    prescriptions.forEach((prescription) => {
      const status = String(
        prescription.status || ""
      )
        .trim()
        .toLowerCase();

      if (status.includes("pending")) {
        counts.Pending += 1;
      } else if (
        status.includes("active") ||
        status.includes("issued") ||
        status === ""
      ) {
        counts.Active += 1;
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
    });

    return [
      {
        status: "Pending",
        prescriptions: counts.Pending,
      },
      {
        status: "Active",
        prescriptions: counts.Active,
      },
      {
        status: "Completed",
        prescriptions: counts.Completed,
      },
      {
        status: "Cancelled",
        prescriptions: counts.Cancelled,
      },
    ];
  }, [prescriptions]);

  // =========================================================
  // PATIENT APPOINTMENT LOAD BAR GRAPH
  // =========================================================

  const patientAppointmentLoadData = useMemo(() => {
    const patientMap = {};

    appointments.forEach((appointment) => {
      if (!appointment.patientId) {
        return;
      }

      const patientId = String(
        appointment.patientId
      );

      patientMap[patientId] =
        (patientMap[patientId] || 0) + 1;
    });

    const patientCounts =
      Object.values(patientMap);

    const oneAppointment =
      patientCounts.filter(
        (count) => count === 1
      ).length;

    const twoToThreeAppointments =
      patientCounts.filter(
        (count) => count >= 2 && count <= 3
      ).length;

    const fourOrMoreAppointments =
      patientCounts.filter(
        (count) => count >= 4
      ).length;

    return [
      {
        category: "1 Appointment",
        patients: oneAppointment,
      },
      {
        category: "2–3 Appointments",
        patients: twoToThreeAppointments,
      },
      {
        category: "4+ Appointments",
        patients: fourOrMoreAppointments,
      },
    ];
  }, [appointments]);

  // =========================================================
  // CLINICAL ACTIVITY PIE CHART
  // =========================================================

  const clinicalPieData = useMemo(() => {
    return [
      {
        name: "Prescriptions",
        value: prescriptions.length,
      },
      {
        name: "Lab Reports",
        value: labReports.length,
      },
      {
        name: "Medical Records",
        value: medicalRecords.length,
      },
    ];
  }, [
    prescriptions.length,
    labReports.length,
    medicalRecords.length,
  ]);

  // =========================================================
  // CLINICAL PIE COLORS
  // =========================================================

  const clinicalPieColors = [
    "#84cc16",
    "#facc15",
    "#a855f7",
  ];

  // =========================================================
  // STATUS COLOR
  // =========================================================

  const getStatusColor = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

    if (value.includes("confirmed")) {
      return "bg-lime-500";
    }

    if (value.includes("completed")) {
      return "bg-purple-500";
    }

    if (value.includes("pending")) {
      return "bg-yellow-400";
    }

    if (
      value.includes("cancelled") ||
      value.includes("canceled")
    ) {
      return "bg-red-500";
    }

    return "bg-slate-400";
  };

  // =========================================================
  // STATUS TEXT COLOR
  // =========================================================

  const getStatusTextColor = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

    if (value.includes("confirmed")) {
      return "text-lime-700";
    }

    if (value.includes("completed")) {
      return "text-purple-700";
    }

    if (value.includes("pending")) {
      return "text-yellow-700";
    }

    if (
      value.includes("cancelled") ||
      value.includes("canceled")
    ) {
      return "text-red-600";
    }

    return "text-slate-600";
  };

  // =========================================================
  // STATUS ICON
  // =========================================================

  const getStatusIcon = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

    if (value.includes("confirmed")) {
      return <CheckCircle2 size={17} />;
    }

    if (value.includes("completed")) {
      return <CheckCircle2 size={17} />;
    }

    if (value.includes("pending")) {
      return <Clock3 size={17} />;
    }

    if (
      value.includes("cancelled") ||
      value.includes("canceled")
    ) {
      return <XCircle size={17} />;
    }

    return <Activity size={17} />;
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-lime-100 flex items-center justify-center mx-auto">
            <Loader2
              className="text-lime-600 animate-spin"
              size={28}
            />
          </div>

          <p className="mt-4 text-gray-600 font-medium">
            Loading doctor reports...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN REPORTS PANEL
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-0">

      {/* ============================================================
          HEADER
      ============================================================ */}

      <div className="bg-white rounded-2xl border border-lime-100 shadow-sm p-5 md:p-6 mb-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-lime-100 flex items-center justify-center">
              <Stethoscope
                className="text-lime-600"
                size={28}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Doctor Reports
              </h1>

              <p className="text-gray-500 mt-1">
                View your appointment and clinical activity analytics
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            {currentDoctor && (
              <div className="px-4 py-2 rounded-xl bg-lime-50 border border-lime-100">

                <p className="text-xs text-gray-500">
                  Doctor ID
                </p>

                <p className="font-bold text-lime-700">
                  {currentDoctor.id}
                </p>

              </div>
            )}

            <button
              onClick={() => loadReports(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lime-500 text-white font-semibold hover:bg-lime-600 transition disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>

        </div>

        {currentDoctor && (
          <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap gap-x-8 gap-y-3">

            <div>
              <span className="text-xs text-gray-500">
                Doctor
              </span>

              <p className="font-semibold text-gray-800">
                {currentDoctor.name ||
                  currentDoctor.email}
              </p>
            </div>

            <div>
              <span className="text-xs text-gray-500">
                Specialization
              </span>

              <p className="font-semibold text-gray-800">
                {currentDoctor.specialization ||
                  "General Medicine"}
              </p>
            </div>

            <div>
              <span className="text-xs text-gray-500">
                Email
              </span>

              <p className="font-semibold text-gray-800">
                {currentDoctor.email || "—"}
              </p>
            </div>

          </div>
        )}

      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
          {error}
        </div>
      )}

      {/* ============================================================
          STAT CARDS
      ============================================================ */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

        {/* TOTAL PATIENTS */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">

          <div className="flex justify-between items-start">

            <div>
              <p className="text-sm text-gray-500">
                Total Patients
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-2">
                {uniquePatientIds.size}
              </p>

              <p className="text-xs text-lime-600 font-semibold mt-2">
                Patients assigned to you
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-lime-100 flex items-center justify-center">
              <Users
                className="text-lime-600"
                size={22}
              />
            </div>

          </div>

        </div>

        {/* TOTAL APPOINTMENTS */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">

          <div className="flex justify-between items-start">

            <div>
              <p className="text-sm text-gray-500">
                Total Appointments
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-2">
                {appointments.length}
              </p>

              <p className="text-xs text-lime-600 font-semibold mt-2">
                All assigned appointments
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-lime-100 flex items-center justify-center">
              <CalendarDays
                className="text-lime-600"
                size={22}
              />
            </div>

          </div>

        </div>

        {/* CONFIRMED */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">

          <div className="flex justify-between items-start">

            <div>
              <p className="text-sm text-gray-500">
                Confirmed
              </p>

              <p className="text-3xl font-bold text-lime-600 mt-2">
                {statusCounts.confirmed}
              </p>

              <p className="text-xs text-lime-600 font-semibold mt-2">
                Confirmed appointments
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-lime-100 flex items-center justify-center">
              <CheckCircle2
                className="text-lime-600"
                size={22}
              />
            </div>

          </div>

        </div>

        {/* COMPLETED */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">

          <div className="flex justify-between items-start">

            <div>
              <p className="text-sm text-gray-500">
                Completed
              </p>

              <p className="text-3xl font-bold text-purple-600 mt-2">
                {statusCounts.completed}
              </p>

              <p className="text-xs text-purple-600 font-semibold mt-2">
                Completed appointments
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
              <HeartPulse
                className="text-purple-600"
                size={22}
              />
            </div>

          </div>

        </div>

      </div>

      {/* ============================================================
          APPOINTMENT STATUS SUMMARY
      ============================================================ */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

        {/* ============================================================
            STATUS OVERVIEW WIDGET
        ============================================================ */}

        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Appointment Status Overview
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Current appointment distribution
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center">
              <BarChart3
                className="text-lime-600"
                size={20}
              />
            </div>

          </div>

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
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor(
                          item.status
                        )} text-white`}
                      >
                        {getStatusIcon(
                          item.status
                        )}
                      </span>

                      <span className="font-semibold text-gray-700">
                        {item.status}
                      </span>

                    </div>

                    <div className="flex items-center gap-2">

                      <span className="font-bold text-gray-800">
                        {item.count}
                      </span>

                      <span
                        className={`text-xs font-semibold ${getStatusTextColor(
                          item.status
                        )}`}
                      >
                        {percentage}%
                      </span>

                    </div>

                  </div>

                  {/* HORIZONTAL PROGRESS BAR */}

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getStatusColor(
                        item.status
                      )}`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                </div>
              );
            })}

          </div>

        </div>

        {/* ============================================================
            CLINICAL ACTIVITY PIE CHART
        ============================================================ */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">

          <div className="flex items-center justify-between mb-3">

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Clinical Activity
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Distribution of clinical records
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center">
              <FileText
                className="text-lime-600"
                size={20}
              />
            </div>

          </div>

          <div className="h-64">

            {clinicalPieData.some(
              (item) => item.value > 0
            ) ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={clinicalPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={88}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >

                    {clinicalPieData.map(
                      (entry, index) => (
                        <Cell
                          key={`clinical-cell-${index}`}
                          fill={
                            clinicalPieColors[
                              index %
                                clinicalPieColors.length
                            ]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            ) : (

              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                No clinical activity available.
              </div>

            )}

          </div>

          <div className="space-y-2 mt-2">

            {clinicalPieData.map(
              (item, index) => (

                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >

                  <div className="flex items-center gap-2">

                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          clinicalPieColors[
                            index %
                              clinicalPieColors.length
                          ],
                      }}
                    />

                    <span className="text-sm text-gray-600">
                      {item.name}
                    </span>

                  </div>

                  <span className="text-sm font-bold text-gray-800">
                    {item.value}
                  </span>

                </div>

              )
            )}

          </div>

        </div>

      </div>

      {/* ============================================================
          PROFESSIONAL BAR GRAPHS
      ============================================================ */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* ============================================================
            PRESCRIPTION STATUS BAR GRAPH
        ============================================================ */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Prescription Status Analytics
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Prescription count by status
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center">
              <FileText
                className="text-lime-600"
                size={20}
              />
            </div>

          </div>

          <div className="h-72">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={prescriptionStatusBarData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -10,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="status"
                  tick={{
                    fontSize: 12,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 12,
                  }}
                />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="prescriptions"
                  name="Prescriptions"
                  fill="#84cc16"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                  barSize={42}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* ============================================================
            PATIENT APPOINTMENT LOAD BAR GRAPH
        ============================================================ */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Patient Appointment Load
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Patient distribution by appointment count
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center">
              <Users
                className="text-lime-600"
                size={20}
              />
            </div>

          </div>

          <div className="h-72">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={patientAppointmentLoadData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -10,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="category"
                  tick={{
                    fontSize: 12,
                  }}
                  interval={0}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 12,
                  }}
                />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="patients"
                  name="Patients"
                  fill="#a855f7"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                  barSize={42}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Reports;