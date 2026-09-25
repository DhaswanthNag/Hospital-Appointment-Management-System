import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  HeartPulse,
  ShieldCheck,
  Eye,
  X,
  Stethoscope,
  Users,
  UserCheck,
  UserX,
  RefreshCw
} from "lucide-react";
import api from "../../api/api";
const PatientManagement = ({ doctorId }) => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Load doctors, patients and appointments from backend
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const requests = [
        api.get("/api/patients"),
        api.get("/api/doctors")
      ];
      // If DoctorDashboard provides a doctorId,
      // also load appointments for that doctor.
      if (doctorId) {
        requests.push(
          api.get(`/api/appointments/doctor/${doctorId}`)
        );
      }
      const responses = await Promise.all(requests);
      const patientResponse = responses[0];
      const doctorResponse = responses[1];
      const appointmentResponse = responses[2];
      const patientData = Array.isArray(patientResponse.data)
        ? patientResponse.data
        : [];
      const doctorData = Array.isArray(doctorResponse.data)
        ? doctorResponse.data
        : [];
      const appointmentData = Array.isArray(appointmentResponse?.data)
        ? appointmentResponse.data
        : [];
      setPatients(patientData);
      setDoctors(doctorData);
      setAppointments(appointmentData);
      console.log(
        "Doctor PatientManagement - Patients:",
        patientData
      );
      console.log(
        "Doctor PatientManagement - Doctors:",
        doctorData
      );
      if (doctorId) {
        console.log(
          "Doctor PatientManagement - Doctor appointments:",
          appointmentData
        );
      }
    } catch (err) {
      console.error(
        "Failed to load doctor patient management data:",
        err
      );
      console.error(
        "Doctor PatientManagement API response:",
        err?.response?.data
      );
      setPatients([]);
      setDoctors([]);
      setAppointments([]);
      setError(
        err?.response?.data?.message ||
          "Could not load patient information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [doctorId]);
  useEffect(() => {
    loadData();
  }, [loadData]);
  // Find doctor using doctor ID
  const getDoctorById = useCallback(
    (id) => {
      if (!id) return null;
      return doctors.find(
        (doctor) => String(doctor.id) === String(id)
      );
    },
    [doctors]
  );
  // Get the appointments belonging to a patient
  const getPatientAppointments = useCallback(
    (patient) => {
      if (!patient) return [];
      const patientId =
        patient.patientId || patient.id;
      return appointments.filter((appointment) => {
        const appointmentPatientId =
          appointment.patientId ||
          appointment.patient?.patientId ||
          appointment.patient?.id;
        return (
          String(appointmentPatientId) ===
          String(patientId)
        );
      });
    },
    [appointments]
  );
  // Find the doctor assigned through the patient's appointment
  const getPatientDoctor = useCallback(
    (patient) => {
      const patientAppointments =
        getPatientAppointments(patient);
      if (patientAppointments.length === 0) {
        return null;
      }
      // Prefer an appointment belonging to the currently logged-in doctor
      const matchingDoctorAppointment = doctorId
        ? patientAppointments.find(
            (appointment) =>
              String(
                appointment.doctorId ||
                  appointment.doctor?.id
              ) === String(doctorId)
          )
        : null;
      const appointment =
        matchingDoctorAppointment ||
        patientAppointments[0];
      const appointmentDoctorId =
        appointment?.doctorId ||
        appointment?.doctor?.id;
      return getDoctorById(appointmentDoctorId);
    },
    [
      doctorId,
      getDoctorById,
      getPatientAppointments
    ]
  );
  // When a doctor ID is provided, only show patients
  // who have appointments with that doctor.
  const visiblePatients = useMemo(() => {
    if (!doctorId) {
      return patients;
    }
    const assignedPatientIds = new Set(
      appointments.map((appointment) =>
        String(
          appointment.patientId ||
            appointment.patient?.patientId ||
            appointment.patient?.id ||
            ""
        )
      )
    );
    return patients.filter((patient) => {
      const patientId =
        patient.patientId || patient.id;
      return assignedPatientIds.has(
        String(patientId)
      );
    });
  }, [patients, appointments, doctorId]);
  // Filter patients
  const filteredPatients = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();
    return visiblePatients.filter((patient) => {
      const fullName =
        `${patient.firstName || ""} ${
          patient.lastName || ""
        }`.trim();
      const patientId =
        patient.patientId || patient.id || "";
      const matchesSearch =
        !search ||
        fullName.toLowerCase().includes(search) ||
        String(patientId)
          .toLowerCase()
          .includes(search) ||
        (patient.email || "")
          .toLowerCase()
          .includes(search) ||
        (patient.phone || "")
          .toLowerCase()
          .includes(search);
      const patientStatus =
        (patient.status || "active").toLowerCase();
      const matchesStatus =
        statusFilter === "all" ||
        patientStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [
    visiblePatients,
    searchTerm,
    statusFilter
  ]);
  // Statistics
  const totalPatients = visiblePatients.length;
  const activePatients = visiblePatients.filter(
    (patient) =>
      (patient.status || "active").toLowerCase() ===
      "active"
  ).length;
  const inactivePatients = visiblePatients.filter(
    (patient) =>
      (patient.status || "").toLowerCase() ===
      "inactive"
  ).length;
  const patientsWithAppointments =
    visiblePatients.filter(
      (patient) =>
        getPatientAppointments(patient).length > 0
    ).length;
  const getFullName = (patient) => {
    if (!patient) return "Unknown Patient";
    const fullName =
      `${patient.firstName || ""} ${
        patient.lastName || ""
      }`.trim();
    return fullName || "Unknown Patient";
  };
  const getPatientId = (patient) => {
    return patient?.patientId || patient?.id || "N/A";
  };
  const getPatientStatusClass = (status) => {
    switch ((status || "active").toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      case "discharged":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  const formatDate = (date) => {
    if (!date) return "N/A";
    const parsedDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }
    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
  };
  const handleClosePatient = () => {
    setSelectedPatient(null);
  };
  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Patient Management
          </h1>
          <p className="text-gray-500 mt-1">
            View and manage patient information.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-lime-600 text-white font-medium hover:bg-lime-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      </div>
      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <p className="font-medium">
            {error}
          </p>
        </div>
      )}
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Patients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Patients
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? "..." : totalPatients}
              </p>
            </div>
            <div className="bg-lime-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-lime-600" />
            </div>
          </div>
        </div>
        {/* Active Patients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Active Patients
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? "..." : activePatients}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        {/* Inactive Patients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Inactive Patients
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? "..." : inactivePatients}
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <UserX className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
        {/* Appointed Patients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Assigned Patients
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loading
                  ? "..."
                  : patientsWithAppointments}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search by patient name, ID, email or phone..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            />
          </div>
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="lg:w-48 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
          >
            <option value="all">
              All Status
            </option>
            <option value="active">
              Active
            </option>
            <option value="inactive">
              Inactive
            </option>
            <option value="discharged">
              Discharged
            </option>
          </select>
        </div>
      </div>
      {/* Patient Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Patients
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredPatients.length} patient
              {filteredPatients.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>
        </div>
        {loading ? (
          <div className="p-10 text-center">
            <RefreshCw className="h-7 w-7 text-lime-600 animate-spin mx-auto" />
            <p className="text-gray-500 mt-3">
              Loading patients...
            </p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="h-10 w-10 text-gray-300 mx-auto" />
            <h3 className="font-semibold text-gray-700 mt-3">
              No patients found
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm || statusFilter !== "all"
                ? "Try changing your search or filter."
                : doctorId
                ? "No patients are currently assigned to you."
                : "No patient records are available."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Patient ID
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Blood Group
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((patient) => {
                  const patientDoctor =
                    getPatientDoctor(patient);
                  return (
                    <tr
                      key={
                        patient.patientId ||
                        patient.id
                      }
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Patient */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-lime-100 flex items-center justify-center shrink-0">
                            <User className="h-5 w-5 text-lime-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate">
                              {getFullName(patient)}
                            </p>
                            {patientDoctor && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Stethoscope className="h-3 w-3" />
                                {patientDoctor.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Patient ID */}
                      <td className="px-6 py-5">
                        <span className="font-medium text-gray-700">
                          {getPatientId(patient)}
                        </span>
                      </td>
                      {/* Contact */}
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          {patient.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-3.5 w-3.5 text-gray-400" />
                              <span className="max-w-[220px] truncate">
                                {patient.email}
                              </span>
                            </div>
                          )}
                          {patient.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-3.5 w-3.5 text-gray-400" />
                              <span>
                                {patient.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Gender */}
                      <td className="px-6 py-5 text-sm text-gray-600">
                        {patient.gender || "N/A"}
                      </td>
                      {/* Blood Group */}
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <HeartPulse className="h-4 w-4 text-red-500" />
                          {patient.bloodGroup || "N/A"}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${getPatientStatusClass(
                            patient.status
                          )}`}
                        >
                          {patient.status ||
                            "active"}
                        </span>
                      </td>
                      {/* Action */}
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            handleViewPatient(
                              patient
                            )
                          }
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-lime-700 bg-lime-50 hover:bg-lime-100 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close patient details"
            onClick={handleClosePatient}
            className="absolute inset-0 bg-black/40 cursor-default"
          />
          {/* Modal */}
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-lime-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-lime-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {getFullName(
                      selectedPatient
                    )}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Patient ID:{" "}
                    {getPatientId(
                      selectedPatient
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClosePatient}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Patient Status
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getPatientStatusClass(
                    selectedPatient.status
                  )}`}
                >
                  {selectedPatient.status ||
                    "active"}
                </span>
              </div>
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      First Name
                    </p>
                    <p className="font-medium text-gray-800 mt-1">
                      {selectedPatient.firstName ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Last Name
                    </p>
                    <p className="font-medium text-gray-800 mt-1">
                      {selectedPatient.lastName ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Date of Birth
                    </p>
                    <p className="font-medium text-gray-800 mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-lime-600" />
                      {formatDate(
                        selectedPatient.dateOfBirth
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Gender
                    </p>
                    <p className="font-medium text-gray-800 mt-1">
                      {selectedPatient.gender ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Email
                    </p>
                    <p className="font-medium text-gray-800 mt-1 flex items-center gap-2 break-all">
                      <Mail className="h-4 w-4 text-lime-600 shrink-0" />
                      {selectedPatient.email ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Phone
                    </p>
                    <p className="font-medium text-gray-800 mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-lime-600 shrink-0" />
                      {selectedPatient.phone ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Address
                    </p>
                    <p className="font-medium text-gray-800 mt-1 flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-lime-600 mt-0.5 shrink-0" />
                      {selectedPatient.address ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Medical Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-red-50 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <HeartPulse className="h-5 w-5 text-red-500" />
                      <p className="text-sm text-gray-500">
                        Blood Group
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-800 mt-2">
                      {selectedPatient.bloodGroup ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-blue-500" />
                      <p className="text-sm text-gray-500">
                        Insurance Provider
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-800 mt-2">
                      {selectedPatient.insuranceProvider ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Insurance ID
                    </p>
                    <p className="font-medium text-gray-800 mt-1">
                      {selectedPatient.insuranceId ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Emergency Contact
                    </p>
                    <p className="font-medium text-gray-800 mt-1">
                      {selectedPatient.emergencyContact ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              {/* Assigned Doctor */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Assigned Doctor
                </h3>
                {(() => {
                  const patientDoctor =
                    getPatientDoctor(
                      selectedPatient
                    );
                  const patientAppointments =
                    getPatientAppointments(
                      selectedPatient
                    );
                  if (!patientDoctor) {
                    return (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-200 p-2 rounded-full">
                            <Stethoscope className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">
                              No assigned doctor
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              No appointment assignment is available for this patient.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="bg-lime-50 border border-lime-100 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-lime-100 p-3 rounded-full">
                          <Stethoscope className="h-5 w-5 text-lime-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {patientDoctor.name}
                          </p>
                          <p className="text-sm text-lime-700">
                            {patientDoctor.specialization ||
                              "Medical Doctor"}
                          </p>
                          {patientDoctor.email && (
                            <p className="text-sm text-gray-500 mt-1">
                              {patientDoctor.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-lime-100">
                        <p className="text-sm text-gray-600">
                          Appointments with this doctor:{" "}
                          <span className="font-semibold">
                            {patientAppointments.length}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            {/* Modal Footer */}
            <div className="border-t border-gray-100 p-5 flex justify-end">
              <button
                type="button"
                onClick={handleClosePatient}
                className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
PatientManagement.propTypes = {
  doctorId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ])
};
export default PatientManagement;