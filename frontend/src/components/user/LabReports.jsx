import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Activity,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FlaskConical,
  HeartPulse,
  Search,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import api from "../../api/api";

const LabReports = ({ patientId: passedPatientId }) => {
  const [reports, setReports] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  const [resolvedPatientId, setResolvedPatientId] = useState(
    passedPatientId || null
  );

  const getLoggedInUser = () => {
    const sources = [
      sessionStorage.getItem("hams_user"),
      localStorage.getItem("hams_user"),
      localStorage.getItem("user"),
    ];

    for (const source of sources) {
      if (source) {
        try {
          const parsedUser = JSON.parse(source);

          if (parsedUser) {
            return parsedUser;
          }
        } catch (error) {
          console.error("Unable to read logged-in user:", error);
        }
      }
    }

    return null;
  };

  /*
   * Resolve the actual patientId from the patients table.
   *
   * The logged-in user may have a user/account ID which is different
   * from the patient ID such as PAT001, PAT002, PAT005, etc.
   */
  const resolvePatientId = useCallback(async () => {
    try {
      /*
       * Always load the patients table first.
       *
       * This allows us to verify whether the ID passed from
       * UserDashboard is actually a patient ID.
       */
      const response = await api.get("/api/patients");

      const patientList = Array.isArray(response.data)
        ? response.data
        : [];

      console.log(
        "LabReports - Patients received:",
        patientList
      );

      /*
       * First try the patientId passed from UserDashboard.
       *
       * We verify that it actually exists in the patients table.
       * This prevents a user/account ID from being used as patientId.
       */
      if (passedPatientId) {
        const matchedPassedPatient = patientList.find(
          (patient) =>
            String(
              patient.patientId ||
                patient.patientID ||
                patient.id ||
                patient.userId ||
                patient.username
            ) === String(passedPatientId)
        );

        if (matchedPassedPatient) {
          const actualPatientId =
            matchedPassedPatient.patientId ||
            matchedPassedPatient.patientID ||
            matchedPassedPatient.id;

          console.log(
            "LabReports - Valid patient ID from dashboard:",
            actualPatientId
          );

          setResolvedPatientId(actualPatientId || null);

          return actualPatientId || null;
        }

        console.log(
          "LabReports - Passed ID is not a patient ID:",
          passedPatientId
        );
      }

      /*
       * If the passed ID was not a valid patient ID,
       * identify the patient using the logged-in user's email.
       */
      const user = getLoggedInUser();

      if (!user?.email) {
        console.log(
          "LabReports - No logged-in user email found."
        );

        return null;
      }

      const loggedInEmail = user.email.trim().toLowerCase();

      console.log(
        "LabReports - Finding patient using email:",
        loggedInEmail
      );

      const matchedPatient = patientList.find(
        (patient) =>
          patient.email &&
          patient.email.trim().toLowerCase() === loggedInEmail
      );

      console.log(
        "LabReports - Matched patient:",
        matchedPatient
      );

      if (!matchedPatient) {
        console.log(
          "LabReports - No patient matched email:",
          loggedInEmail
        );

        return null;
      }

      const actualPatientId =
        matchedPatient.patientId ||
        matchedPatient.patientID ||
        matchedPatient.id;

      console.log(
        "LabReports - Actual patient ID:",
        actualPatientId
      );

      setResolvedPatientId(actualPatientId || null);

      return actualPatientId || null;
    } catch (error) {
      console.error(
        "LabReports - Failed to resolve patient:",
        error
      );

      return null;
    }
  }, [passedPatientId]);

  const getDoctorId = (doctor) => {
    if (!doctor) {
      return null;
    }

    return (
      doctor.doctorId ||
      doctor.doctorID ||
      doctor.id ||
      doctor.userId ||
      doctor.username
    );
  };

  const getDoctorName = useCallback(
    (doctorId) => {
      const doctor = doctors.find(
        (item) =>
          String(getDoctorId(item)) === String(doctorId)
      );

      if (!doctor) {
        return doctorId || "Doctor";
      }

      return (
        doctor.name ||
        doctor.fullName ||
        doctor.doctorName ||
        `Dr. ${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() ||
        doctor.username ||
        doctor.email ||
        doctorId
      );
    },
    [doctors]
  );

  const getPatientName = useCallback(
    (patientId) => {
      const patient = patients.find(
        (item) =>
          String(
            item.patientId ||
              item.patientID ||
              item.id ||
              item.userId ||
              item.username
          ) === String(patientId)
      );

      if (!patient) {
        return patientId || "Patient";
      }

      return (
        patient.name ||
        patient.fullName ||
        patient.patientName ||
        `${patient.firstName || ""} ${patient.lastName || ""}`.trim() ||
        patient.username ||
        patient.email ||
        patientId
      );
    },
    [patients]
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const patientId = await resolvePatientId();

      console.log(
        "LabReports - Patient ID used for reports:",
        patientId
      );

      if (!patientId) {
        setReports([]);
        setError(
          "Unable to identify the logged-in patient."
        );
        setLoading(false);
        return;
      }

      /*
       * Fetch the patient's laboratory reports.
       *
       * Important:
       * patientId is a String such as PAT005.
       */
      const reportsResponse = await api.get(
        `/api/lab-reports/patient/${encodeURIComponent(patientId)}`
      );

      console.log(
        "LabReports - Reports received:",
        reportsResponse.data
      );

      setReports(
        Array.isArray(reportsResponse.data)
          ? reportsResponse.data
          : []
      );

      /*
       * Load doctors and patients separately.
       *
       * These are only used to display names in the UI.
       */
      try {
        const doctorsResponse = await api.get(
          "/api/doctors"
        );

        setDoctors(
          Array.isArray(doctorsResponse.data)
            ? doctorsResponse.data
            : []
        );
      } catch (doctorError) {
        console.error(
          "LabReports - Unable to load doctors:",
          doctorError
        );

        setDoctors([]);
      }

      try {
        const patientsResponse = await api.get(
          "/api/patients"
        );

        setPatients(
          Array.isArray(patientsResponse.data)
            ? patientsResponse.data
            : []
        );
      } catch (patientError) {
        console.error(
          "LabReports - Unable to load patients:",
          patientError
        );

        setPatients([]);
      }
    } catch (err) {
      console.error(
        "Unable to fetch laboratory reports:",
        err
      );

      console.error(
        "LabReports - API response:",
        err.response?.data
      );

      if (err.response?.status === 404) {
        setReports([]);
        setError("No laboratory reports found.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load laboratory reports. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [resolvePatientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredReports = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return reports;
    }

    return reports.filter((report) => {
      const testName = report.testName || "";
      const testType = report.testType || "";
      const doctorName = getDoctorName(report.doctorId);
      const status = report.status || "";
      const reportDate = report.reportDate || "";

      return (
        testName.toLowerCase().includes(search) ||
        testType.toLowerCase().includes(search) ||
        doctorName.toLowerCase().includes(search) ||
        status.toLowerCase().includes(search) ||
        reportDate.toLowerCase().includes(search)
      );
    });
  }, [reports, searchTerm, getDoctorName]);

  const getStatusStyle = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    if (
      normalizedStatus.includes("normal") ||
      normalizedStatus.includes("completed") ||
      normalizedStatus.includes("complete")
    ) {
      return "bg-emerald-50 text-emerald-600 border-emerald-200";
    }

    if (
      normalizedStatus.includes("high") ||
      normalizedStatus.includes("critical") ||
      normalizedStatus.includes("abnormal")
    ) {
      return "bg-red-50 text-red-600 border-red-200";
    }

    if (
      normalizedStatus.includes("pending") ||
      normalizedStatus.includes("processing")
    ) {
      return "bg-amber-50 text-amber-600 border-amber-200";
    }

    return "bg-blue-50 text-blue-600 border-blue-200";
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const patientId = resolvedPatientId;
  const patientName = getPatientName(patientId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-lime-100 text-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white border border-lime-100 rounded-2xl shadow-xl p-5 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-400 to-lime-500 flex items-center justify-center shadow-lg">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Laboratory Reports
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  View your laboratory test results and medical reports
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-lime-50 border border-lime-100 rounded-xl px-4 py-3">
              <User className="w-5 h-5 text-lime-600" />

              <div>
                <p className="text-xs text-gray-500">
                  Patient
                </p>

                <p className="font-semibold text-gray-800">
                  {patientName}
                </p>

                <p className="text-xs text-lime-600">
                  ID: {patientId || "N/A"}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-white border border-lime-100 rounded-2xl shadow-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Reports
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {reports.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-lime-50 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-lime-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-lime-100 rounded-2xl shadow-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Completed
                </p>

                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {
                    reports.filter((report) =>
                      ["completed", "complete", "normal"].includes(
                        String(report.status || "").toLowerCase()
                      )
                    ).length
                  }
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-lime-100 rounded-2xl shadow-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Doctors
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {new Set(reports.map((report) => report.doctorId)).size}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-lime-50 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-lime-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-lime-100 rounded-2xl shadow-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Latest Report
                </p>

                <p className="text-lg font-bold text-gray-900 mt-2">
                  {reports.length > 0
                    ? formatDate(
                        [...reports]
                          .sort(
                            (a, b) =>
                              new Date(b.reportDate) -
                              new Date(a.reportDate)
                          )[0]?.reportDate
                      )
                    : "N/A"}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-lime-50 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-lime-600" />
              </div>
            </div>
          </div>

        </div>

        {/* Reports Section */}
        <div className="bg-white border border-lime-100 rounded-2xl shadow-xl overflow-hidden">

          <div className="p-5 md:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  My Laboratory Reports
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Laboratory reports assigned to your patient account
                </p>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search reports..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-400"
                />
              </div>

            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-lime-200 border-t-lime-600 rounded-full animate-spin"></div>

              <p className="mt-4 text-sm text-gray-500">
                Loading laboratory reports...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="p-6">
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-600">
                {error}
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredReports.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6">

              <div className="w-16 h-16 rounded-2xl bg-lime-50 flex items-center justify-center">
                <FlaskConical className="w-8 h-8 text-lime-500" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-800">
                No Laboratory Reports
              </h3>

              <p className="text-sm text-gray-500 text-center mt-1 max-w-md">
                No laboratory reports are currently available for your account.
              </p>

            </div>
          )}

          {/* Desktop Table */}
          {!loading && !error && filteredReports.length > 0 && (
            <div className="hidden md:block overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Test
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Test Type
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Report Date
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>

                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-gray-100 hover:bg-lime-50 transition-colors"
                    >

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-lime-600" />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {report.testName || "N/A"}
                            </p>

                            <p className="text-xs text-gray-400">
                              Report #{report.id}
                            </p>
                          </div>

                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {report.testType || "N/A"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">

                          <div className="w-8 h-8 rounded-lg bg-lime-50 flex items-center justify-center">
                            <Stethoscope className="w-4 h-4 text-lime-600" />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {getDoctorName(report.doctorId)}
                            </p>

                            <p className="text-xs text-gray-400">
                              {report.doctorId || "N/A"}
                            </p>
                          </div>

                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CalendarDays className="w-4 h-4 text-lime-600" />
                          {formatDate(report.reportDate)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(
                            report.status
                          )}`}
                        >
                          {report.status || "Pending"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedReport(report)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-lime-600 text-white text-sm font-medium hover:bg-lime-700 transition shadow-sm"
                        >
                          View Report
                          <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

          {/* Mobile Cards */}
          {!loading && !error && filteredReports.length > 0 && (
            <div className="md:hidden p-4 space-y-4">

              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="border border-gray-200 rounded-2xl p-4 hover:border-lime-200 hover:bg-lime-50/50 transition"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <div className="w-11 h-11 rounded-xl bg-lime-50 flex items-center justify-center">
                        <FlaskConical className="w-5 h-5 text-lime-600" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {report.testName || "N/A"}
                        </h3>

                        <p className="text-xs text-gray-400">
                          Report #{report.id}
                        </p>
                      </div>

                    </div>

                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(
                        report.status
                      )}`}
                    >
                      {report.status || "Pending"}
                    </span>

                  </div>

                  <div className="mt-4 space-y-3">

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Test Type
                      </span>

                      <span className="text-sm font-medium text-gray-800">
                        {report.testType || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Doctor
                      </span>

                      <span className="text-sm font-medium text-gray-800">
                        {getDoctorName(report.doctorId)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Date
                      </span>

                      <span className="text-sm font-medium text-gray-800">
                        {formatDate(report.reportDate)}
                      </span>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedReport(report)}
                    className="w-full mt-4 px-4 py-2.5 rounded-xl bg-lime-600 text-white text-sm font-medium hover:bg-lime-700 transition"
                  >
                    View Full Report
                  </button>

                </div>
              ))}

            </div>
          )}

        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedReport(null)}
        >

          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-lime-100"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 md:px-6 py-4 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-lime-600" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Laboratory Report
                  </h2>

                  <p className="text-xs text-gray-500">
                    Report #{selectedReport.id}
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* Modal Content */}
            <div className="p-5 md:p-6 space-y-6">

              {/* Patient / Doctor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="bg-lime-50/60 border border-lime-100 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Patient
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <User className="w-4 h-4 text-lime-600" />

                    <div>
                      <p className="font-semibold text-gray-800">
                        {getPatientName(selectedReport.patientId)}
                      </p>

                      <p className="text-xs text-gray-500">
                        {selectedReport.patientId || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-lime-50/60 border border-lime-100 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Doctor
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <Stethoscope className="w-4 h-4 text-lime-600" />

                    <div>
                      <p className="font-semibold text-gray-800">
                        {getDoctorName(selectedReport.doctorId)}
                      </p>

                      <p className="text-xs text-gray-500">
                        {selectedReport.doctorId || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Test Information */}
              <div>

                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  Test Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500">
                      Test Name
                    </p>

                    <p className="font-semibold text-gray-800 mt-1">
                      {selectedReport.testName || "N/A"}
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500">
                      Test Type
                    </p>

                    <p className="font-semibold text-gray-800 mt-1">
                      {selectedReport.testType || "N/A"}
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500">
                      Report Date
                    </p>

                    <p className="font-semibold text-gray-800 mt-1">
                      {formatDate(selectedReport.reportDate)}
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500">
                      Status
                    </p>

                    <span
                      className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(
                        selectedReport.status
                      )}`}
                    >
                      {selectedReport.status || "Pending"}
                    </span>
                  </div>

                </div>

              </div>

              {/* Result */}
              <div>

                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  Test Result
                </h3>

                <div className="bg-lime-50/50 border border-lime-100 rounded-xl p-4">

                  <p className="text-gray-800 whitespace-pre-wrap">
                    {selectedReport.result || "No result available."}
                  </p>

                </div>

              </div>

              {/* Normal Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Normal Range
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {selectedReport.normalRange || "N/A"}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Unit
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {selectedReport.unit || "N/A"}
                  </p>
                </div>

              </div>

              {/* Notes */}
              <div>

                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  Doctor / Laboratory Notes
                </h3>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedReport.notes || "No notes available."}
                  </p>

                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-5 md:px-6 py-4 flex justify-end">

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 font-medium hover:bg-lime-50 hover:border-lime-300 hover:text-lime-700 transition"
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
  patientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  patientName: PropTypes.string,
};

export default LabReports;