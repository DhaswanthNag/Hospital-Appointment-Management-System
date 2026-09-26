import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MdPeople, MdSupervisedUserCircle, MdCalendarToday, MdPayment } from 'react-icons/md';
import AdminSidebar from "../../sidebar/AdminSidebar";
// import Rolemanagement from "./Rolemanagement";
import DoctorManagement from "./DoctorManagement";
import PatientManagement from "./PatientManagement";
import AppointmentSchedulling from "./AppointmentSchedulling";
import Prescription from "./Prescription";
import Billingandpayment from "./Billingandpayment";
// import AdminProfilePage from './AdminProfilePage';
import api from "../../api/api";

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

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
        prescriptionsResponse
      ] = await Promise.all([
        api.get("/api/patients"),
        api.get("/api/doctors"),
        api.get("/api/appointments"),
        api.get("/api/prescriptions")
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

      setPatients(patientData);
      setDoctors(doctorData);
      setAppointments(appointmentData);
      setPrescriptions(prescriptionData);

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

  const getStatusClass = (status) => {
    switch (
      String(status || "")
        .toLowerCase()
    ) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';

      case 'pending':
        return 'bg-yellow-100 text-yellow-800';

      case 'cancelled':
        return 'bg-red-100 text-red-800';

      case 'completed':
        return 'bg-blue-100 text-blue-800';

      case 'rescheduled':
        return 'bg-purple-100 text-purple-800';

      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  // SWITCH CASE MODULE RENDERING
  
  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

              {/* Total Patients */}
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-lime-500">
                <div className="flex justify-between items-start">

                  <div>
                    <p className="text-gray-500 text-sm">
                      Total Patients
                    </p>

                    <h3 className="text-2xl font-bold text-gray-800 mt-2">
                      {loading
                        ? "..."
                        : patients.length}
                    </h3>

                    <p className="text-lime-600 text-sm mt-1">
                      Current database count
                    </p>
                  </div>

                  <div className="bg-lime-100 p-3 rounded-lg text-lime-600">
                    <MdPeople className="text-2xl" />
                  </div>

                </div>
              </div>

              {/* Total Doctors */}
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-lime-500">
                <div className="flex justify-between items-start">

                  <div>
                    <p className="text-gray-500 text-sm">
                      Total Doctors
                    </p>

                    <h3 className="text-2xl font-bold text-gray-800 mt-2">
                      {loading
                        ? "..."
                        : doctors.length}
                    </h3>

                    <p className="text-lime-600 text-sm mt-1">
                      Current database count
                    </p>
                  </div>

                  <div className="bg-lime-100 p-3 rounded-lg text-lime-600">
                    <MdSupervisedUserCircle className="text-2xl" />
                  </div>

                </div>
              </div>

              {/* Appointments Today */}
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-lime-500">
                <div className="flex justify-between items-start">

                  <div>
                    <p className="text-gray-500 text-sm">
                      Appointments Today
                    </p>

                    <h3 className="text-2xl font-bold text-gray-800 mt-2">
                      {loading
                        ? "..."
                        : appointmentStats.today}
                    </h3>

                    <p className="text-lime-600 text-sm mt-1">
                      Real appointment count
                    </p>
                  </div>

                  <div className="bg-lime-100 p-3 rounded-lg text-lime-600">
                    <MdCalendarToday className="text-2xl" />
                  </div>

                </div>
              </div>

              {/* Total Prescriptions */}
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-lime-500">
                <div className="flex justify-between items-start">

                  <div>
                    <p className="text-gray-500 text-sm">
                      Total Prescriptions
                    </p>

                    <h3 className="text-2xl font-bold text-gray-800 mt-2">
                      {loading
                        ? "..."
                        : prescriptions.length}
                    </h3>

                    <p className="text-lime-600 text-sm mt-1">
                      Current database count
                    </p>
                  </div>

                  <div className="bg-lime-100 p-3 rounded-lg text-lime-600">
                    <MdPayment className="text-2xl" />
                  </div>

                </div>
              </div>

            </div>

            {/* Dashboard Appointment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500">
                  Total Appointments
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {loading
                    ? "..."
                    : appointmentStats.total}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500">
                  Pending
                </p>

                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {loading
                    ? "..."
                    : appointmentStats.pending}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500">
                  Confirmed
                </p>

                <p className="text-2xl font-bold text-green-600 mt-1">
                  {loading
                    ? "..."
                    : appointmentStats.confirmed}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500">
                  Completed
                </p>

                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {loading
                    ? "..."
                    : appointmentStats.completed}
                </p>
              </div>

            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-8">
                {error}
              </div>
            )}

            {/* Recent Appointments */}
            <div className="bg-white rounded-xl shadow-sm p-6">

              <div className="flex justify-between items-center mb-6">

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
                  onClick={loadDashboardData}
                  disabled={loading}
                  className="text-lime-600 hover:text-lime-700 font-medium disabled:opacity-50"
                >
                  {loading
                    ? "Refreshing..."
                    : "Refresh"}
                </button>

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
                      <tr className="text-left text-gray-500 border-b">

                        <th className="pb-3">
                          Patient
                        </th>

                        <th className="pb-3">
                          Doctor
                        </th>

                        <th className="pb-3">
                          Date
                        </th>

                        <th className="pb-3">
                          Time
                        </th>

                        <th className="pb-3">
                          Status
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {recentAppointments.map(
                        (appointment) => (

                          <tr
                            key={appointment.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >

                            <td className="py-4">
                              {getPatientName(
                                appointment
                              )}
                            </td>

                            <td className="py-4">
                              {getDoctorName(
                                appointment
                              )}
                            </td>

                            <td className="py-4">
                              {appointment.date ||
                                "N/A"}
                            </td>

                            <td className="py-4">
                              {formatAppointmentTime(
                                appointment.time
                              )}
                            </td>

                            <td className="py-4">

                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getStatusClass(
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
          </>
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