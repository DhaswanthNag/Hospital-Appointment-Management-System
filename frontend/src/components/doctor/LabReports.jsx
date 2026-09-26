import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Search,
  FlaskConical,
  Eye,
  X,
  Calendar,
  User,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Filter,
  ChevronDown,
} from "lucide-react";
import api from "../../api/api";

const LabReports = ({ doctorId }) => {
  const [reports, setReports] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedTestType, setSelectedTestType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Get logged-in doctor
  const getLoggedInDoctor = useCallback(() => {
    const savedUser =
      sessionStorage.getItem("hams_user") ||
      localStorage.getItem("hams_user") ||
      localStorage.getItem("user");

    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Unable to read logged-in doctor:", error);
      return null;
    }
  }, []);

  // Find doctor ID from logged-in user
  const getDoctorId = useCallback(() => {
    // Use doctorId passed from DoctorDashboard first
    if (doctorId) return doctorId;

    const user = getLoggedInDoctor();
    if (!user) return null;

    /*
      Your doctor IDs are strings such as:
      DOC001
      DOC002
      DOC003
      DOC004
    */

    return user.doctorId || user.id || user.userId || user.username || null;
  }, [doctorId, getLoggedInDoctor]);

  // Load doctors
  const fetchDoctors = useCallback(async () => {
    try {
      const response = await api.get("/api/doctors");
      const doctorData = Array.isArray(response.data) ? response.data : [];
      setDoctors(doctorData);
      console.log("DOCTORS FROM API:", doctorData);
    } catch (error) {
      console.error("Error loading doctors:", error);
      setDoctors([]);
    }
  }, []);

  // Load patients
  const fetchPatients = useCallback(async () => {
    try {
      const response = await api.get("/api/patients");
      const patientData = Array.isArray(response.data) ? response.data : [];
      setPatients(patientData);
      console.log("PATIENTS FROM API:", patientData);
    } catch (error) {
      console.error("Error loading patients:", error);
      setPatients([]);
    }
  }, []);

  // Load only reports assigned to logged-in doctor
  const fetchReports = useCallback(async () => {
    const currentDoctorId = getDoctorId();

    if (!currentDoctorId) {
      console.error("Unable to determine logged-in doctor ID.");
      setReports([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(
        "Loading laboratory reports for doctor:",
        currentDoctorId
      );

      const response = await api.get(
        `/api/lab-reports/doctor/${encodeURIComponent(currentDoctorId)}`
      );

      const reportData = Array.isArray(response.data) ? response.data : [];
      setReports(reportData);
      console.log("DOCTOR LAB REPORTS:", reportData);
    } catch (error) {
      console.error("Error loading doctor laboratory reports:", error);

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Response:", error.response.data);
      }

      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [getDoctorId]);

  // Load all required data
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchDoctors(), fetchPatients(), fetchReports()]);
    };

    loadData();
  }, [fetchDoctors, fetchPatients, fetchReports]);

  // Refresh reports
  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([fetchDoctors(), fetchPatients(), fetchReports()]);
    } finally {
      setRefreshing(false);
    }
  };

  // Get doctor name
  const getDoctorName = (id) => {
    if (!id) return "Unknown Doctor";

    const doctor = doctors.find(
      (item) => String(item.id) === String(id)
    );

    if (!doctor) return String(id);

    return (
      doctor.name ||
      doctor.fullName ||
      `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() ||
      doctor.id
    );
  };

  // Get patient object
  const getPatient = useCallback(
    (patientId) => {
      if (!patientId) return null;

      return (
        patients.find(
          (item) =>
            String(item.id || item.patientId) === String(patientId)
        ) || null
      );
    },
    [patients]
  );

  // Get patient name
  const getPatientName = useCallback(
    (patientId) => {
      const patient = getPatient(patientId);

      if (!patient) {
        return String(patientId || "Unknown Patient");
      }

      return (
        patient.name ||
        patient.fullName ||
        `${patient.firstName || ""} ${patient.lastName || ""}`.trim() ||
        patient.id ||
        patient.patientId
      );
    },
    [getPatient]
  );

  // Get patient email
  const getPatientEmail = (patientId) => {
    const patient = getPatient(patientId);
    return patient?.email || patient?.emailAddress || "N/A";
  };

  // Get patient phone
  const getPatientPhone = (patientId) => {
    const patient = getPatient(patientId);
    return patient?.phone || patient?.phoneNumber || "N/A";
  };

  // Get patient gender
  const getPatientGender = (patientId) => {
    const patient = getPatient(patientId);
    return patient?.gender || "N/A";
  };

  // Get patient age
  const getPatientAge = (patientId) => {
    const patient = getPatient(patientId);

    if (!patient) return "N/A";

    if (patient.age !== undefined && patient.age !== null) {
      return patient.age;
    }

    return "N/A";
  };

  // Status badge
  const getStatusBadge = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    if (
      normalizedStatus === "normal" ||
      normalizedStatus === "completed" ||
      normalizedStatus === "complete"
    ) {
      return {
        className:
          "bg-emerald-50 text-emerald-600 border border-emerald-200",
        icon: <CheckCircle size={14} />,
        label: status || "Normal",
      };
    }

    if (
      normalizedStatus === "abnormal" ||
      normalizedStatus === "critical" ||
      normalizedStatus === "high"
    ) {
      return {
        className:
          "bg-red-50 text-red-600 border border-red-200",
        icon: <AlertCircle size={14} />,
        label: status || "Abnormal",
      };
    }

    if (
      normalizedStatus === "pending" ||
      normalizedStatus === "in progress"
    ) {
      return {
        className:
          "bg-yellow-50 text-yellow-600 border border-yellow-200",
        icon: <Clock size={14} />,
        label: status || "Pending",
      };
    }

    return {
      className:
        "bg-lime-50 text-lime-600 border border-lime-200",
      icon: <Activity size={14} />,
      label: status || "Reported",
    };
  };

  // Format date
  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    try {
      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) return dateValue;

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return dateValue;
    }
  };

  // Test type list
  const testTypes = useMemo(
    () =>
      [...new Set(reports.map((report) => report.testType).filter(Boolean))].sort(),
    [reports]
  );

  // Status list
  const statuses = useMemo(
    () =>
      [...new Set(reports.map((report) => report.status).filter(Boolean))].sort(),
    [reports]
  );

  // Filtered reports
  const filteredReports = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return reports.filter((report) => {
      const patientName = getPatientName(report.patientId).toLowerCase();
      const patientId = String(report.patientId || "").toLowerCase();
      const testName = String(report.testName || "").toLowerCase();
      const testType = String(report.testType || "").toLowerCase();
      const result = String(report.result || "").toLowerCase();

      const matchesSearch =
        !search ||
        patientName.includes(search) ||
        patientId.includes(search) ||
        testName.includes(search) ||
        testType.includes(search) ||
        result.includes(search);

      const matchesPatient =
        !selectedPatient ||
        String(report.patientId) === String(selectedPatient);

      const matchesTestType =
        !selectedTestType ||
        String(report.testType) === String(selectedTestType);

      const matchesStatus =
        !selectedStatus ||
        String(report.status) === String(selectedStatus);

      return (
        matchesSearch &&
        matchesPatient &&
        matchesTestType &&
        matchesStatus
      );
    });
  }, [
    reports,
    searchTerm,
    selectedPatient,
    selectedTestType,
    selectedStatus,
    getPatientName,
  ]);

  // Statistics
  const statistics = useMemo(() => {
    const normalStatuses = ["normal", "completed", "complete"];
    const abnormalStatuses = ["abnormal", "critical", "high"];
    const pendingStatuses = ["pending", "in progress"];

    const countByStatus = (allowedStatuses) =>
      reports.filter((report) =>
        allowedStatuses.includes(String(report.status || "").toLowerCase())
      ).length;

    return {
      total: reports.length,
      normal: countByStatus(normalStatuses),
      abnormal: countByStatus(abnormalStatuses),
      pending: countByStatus(pendingStatuses),
    };
  }, [reports]);

  // Reset filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedPatient("");
    setSelectedTestType("");
    setSelectedStatus("");
  };

  const hasFilters =
    searchTerm || selectedPatient || selectedTestType || selectedStatus;

  const statCards = [
    {
      label: "Total Reports",
      value: statistics.total,
      icon: FlaskConical,
      valueClass: "text-gray-900",
      iconClass: "text-lime-600",
      iconBg: "bg-lime-50",
    },
    {
      label: "Normal",
      value: statistics.normal,
      icon: CheckCircle,
      valueClass: "text-emerald-600",
      iconClass: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Abnormal",
      value: statistics.abnormal,
      icon: AlertCircle,
      valueClass: "text-red-600",
      iconClass: "text-red-600",
      iconBg: "bg-red-50",
    },
    {
      label: "Pending",
      value: statistics.pending,
      icon: Clock,
      valueClass: "text-yellow-600",
      iconClass: "text-yellow-600",
      iconBg: "bg-yellow-50",
    },
  ];

  const patientOptions = patients.filter((patient) =>
    reports.some(
      (report) => String(report.patientId) === String(patient.id)
    )
  );

  const Field = ({ label, value, className = "" }) => (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-medium mt-1 text-gray-800 ${className}`}>
        {value || "N/A"}
      </p>
    </div>
  );

  Field.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.node,
    className: PropTypes.string,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-lime-100 text-gray-900 p-4 md:p-6">

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white border border-lime-100 shadow-md">
              <FlaskConical size={28} className="text-lime-600" />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Laboratory Reports
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                View laboratory reports for your patients
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-lime-50 text-gray-700 border border-lime-100 shadow-md transition disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="bg-white border border-lime-100 rounded-2xl p-5 shadow-lg hover:shadow-xl hover:border-lime-200 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-2 ${stat.valueClass}`}>
                    {stat.value}
                  </p>
                </div>

                <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                  <Icon size={22} className={stat.iconClass} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-lime-100 rounded-2xl p-4 mb-6 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patient, test, result..."
              className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-800 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-300 transition"
            />
          </div>

          {/* Filter Button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-lime-50 border border-lime-200 text-lime-700 rounded-xl hover:bg-lime-100 transition"
          >
            <Filter size={18} />
            Filters
            <ChevronDown
              size={16}
              className={`transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">

            {/* Patient */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Patient
              </label>

              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-300"
              >
                <option value="">All Patients</option>

                {patientOptions.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name || patient.fullName || patient.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Type */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Test Type
              </label>

              <select
                value={selectedTestType}
                onChange={(e) => setSelectedTestType(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-300"
              >
                <option value="">All Test Types</option>

                {testTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Status
              </label>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-300"
              >
                <option value="">All Statuses</option>

                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Reports */}
      <div className="bg-white border border-lime-100 rounded-2xl overflow-hidden shadow-lg">

        {/* Table Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg text-gray-900">
              Laboratory Reports
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {filteredReports.length} report
              {filteredReports.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-lime-100 border-t-lime-500 rounded-full animate-spin" />

            <p className="text-gray-500 mt-4">
              Loading laboratory reports...
            </p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-5">
            <div className="p-5 rounded-full bg-lime-50 mb-4">
              <FlaskConical size={40} className="text-lime-500" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              No Laboratory Reports
            </h3>

            <p className="text-gray-500 text-sm mt-2 text-center max-w-md">
              There are no laboratory reports assigned to you
              matching the current filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left bg-lime-50/50">
                    {[
                      "Patient",
                      "Test",
                      "Result",
                      "Normal Range",
                      "Status",
                      "Report Date",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase"
                      >
                        {heading}
                      </th>
                    ))}

                    <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReports.map((report) => {
                    const status = getStatusBadge(report.status);

                    return (
                      <tr
                        key={report.id}
                        className="border-b border-gray-100 hover:bg-lime-50/40 transition"
                      >
                        {/* Patient */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-lime-50 flex items-center justify-center">
                              <User size={18} className="text-lime-600" />
                            </div>

                            <div>
                              <p className="font-medium text-gray-900">
                                {getPatientName(report.patientId)}
                              </p>

                              <p className="text-xs text-gray-500 mt-1">
                                ID: {report.patientId}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Test */}
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">
                            {report.testName || "N/A"}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {report.testType || "N/A"}
                          </p>
                        </td>

                        {/* Result */}
                        <td className="px-5 py-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-800">
                              {report.result || "N/A"}
                            </p>

                            {report.unit && (
                              <p className="text-xs text-gray-500 mt-1">
                                Unit: {report.unit}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Normal Range */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600">
                            {report.normalRange || "N/A"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${status.className}`}
                          >
                            {status.icon}
                            {status.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={15} className="text-lime-500" />
                            {formatDate(report.reportDate)}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedReport(report)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-lime-50 text-lime-700 hover:bg-lime-100 border border-lime-200 transition"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredReports.map((report) => {
                const status = getStatusBadge(report.status);

                return (
                  <div key={report.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-lime-50 flex items-center justify-center">
                          <FlaskConical
                            size={20}
                            className="text-lime-600"
                          />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900">
                            {report.testName || "N/A"}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {report.testType || "N/A"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${status.className}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Patient</p>
                        <p className="text-sm font-medium text-gray-800 mt-1">
                          {getPatientName(report.patientId)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-sm font-medium text-gray-800 mt-1">
                          {formatDate(report.reportDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Result</p>
                        <p className="text-sm font-medium text-gray-800 mt-1">
                          {report.result || "N/A"}
                          {report.unit ? ` ${report.unit}` : ""}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Normal Range
                        </p>
                        <p className="text-sm font-medium text-gray-800 mt-1">
                          {report.normalRange || "N/A"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedReport(report)}
                      className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-lime-50 text-lime-700 border border-lime-200 hover:bg-lime-100 transition"
                    >
                      <Eye size={17} />
                      View Full Report
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-lime-100 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-lime-50">
                  <FileText size={22} className="text-lime-600" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Laboratory Report
                  </h2>

                  <p className="text-xs text-gray-500 mt-1">
                    Report ID: {selectedReport.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-2 rounded-lg hover:bg-lime-50 text-gray-500 hover:text-gray-900 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-6">

              {/* Patient Information */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User size={18} className="text-lime-600" />
                  <h3 className="font-semibold text-gray-900">
                    Patient Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-lime-50/50 rounded-xl p-4 border border-lime-100">
                  <Field
                    label="Patient Name"
                    value={getPatientName(selectedReport.patientId)}
                  />

                  <Field
                    label="Patient ID"
                    value={selectedReport.patientId}
                  />

                  <Field
                    label="Email"
                    value={getPatientEmail(selectedReport.patientId)}
                    className="break-all"
                  />

                  <Field
                    label="Phone"
                    value={getPatientPhone(selectedReport.patientId)}
                  />

                  <Field
                    label="Gender"
                    value={getPatientGender(selectedReport.patientId)}
                  />

                  <Field
                    label="Age"
                    value={getPatientAge(selectedReport.patientId)}
                  />
                </div>
              </div>

              {/* Test Information */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical size={18} className="text-lime-600" />
                  <h3 className="font-semibold text-gray-900">
                    Test Information
                  </h3> 
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-lime-50/50 rounded-xl p-4 border border-lime-100">
                  <Field
                    label="Test Type"
                    value={selectedReport.testType}
                  />

                  <Field
                    label="Test Name"
                    value={selectedReport.testName}
                  />

                  <Field
                    label="Report Date"
                    value={formatDate(selectedReport.reportDate)}
                  />

                  <Field
                    label="Doctor"
                    value={getDoctorName(selectedReport.doctorId)}
                  />
                </div>
              </div>

              {/* Result */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={18} className="text-lime-600" />
                  <h3 className="font-semibold text-gray-900">
                    Test Result
                  </h3>
                </div>

                <div className="bg-lime-50/50 rounded-xl p-5 border border-lime-100">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <Field
                      label="Result"
                      value={selectedReport.result}
                      className="text-lg"
                    />

                    <Field
                      label="Unit"
                      value={selectedReport.unit}
                      className="text-lg"
                    />

                    <Field
                      label="Normal Range"
                      value={selectedReport.normalRange}
                      className="text-lg"
                    />
                  </div>

                  <div className="mt-5 pt-5 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">
                      Status
                    </p>

                    {(() => {
                      const status = getStatusBadge(selectedReport.status);

                      return (
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${status.className}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={18} className="text-lime-600" />

                  <h3 className="font-semibold text-gray-900">
                    Doctor / Laboratory Notes
                  </h3>
                </div>

                <div className="bg-lime-50/50 rounded-xl p-4 border border-lime-100 min-h-[100px]">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedReport.notes ||
                      "No additional notes available."}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-600 text-white border border-lime-500 transition shadow-sm"
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

LabReports.propTypes = {
  doctorId: PropTypes.string,
};

export default LabReports;
