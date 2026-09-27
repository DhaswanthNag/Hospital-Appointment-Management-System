import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  Calendar,
  ClipboardList,
  FileText,
  RefreshCw,
  Search,
  User,
  X
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";

const MedicalHistory = () => {
  const { user } = useContext(AuthContext);

  const [patient, setPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Get the currently logged-in user
  const getLoggedInUser = useCallback(() => {
    // First use AuthContext user if available
    if (user?.email || user?.patientId || user?.id) {
      return user;
    }

    // Fallback to the user stored by Login.jsx
    try {
      const savedHamsUser =
        sessionStorage.getItem("hams_user") ||
        localStorage.getItem("hams_user");

      if (savedHamsUser) {
        return JSON.parse(savedHamsUser);
      }
    } catch (storageError) {
      console.error(
        "MedicalHistory - Failed to read hams_user:",
        storageError
      );
    }

    // Fallback to the old "user" storage key
    try {
      const savedUser =
        sessionStorage.getItem("user") ||
        localStorage.getItem("user");

      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (storageError) {
      console.error(
        "MedicalHistory - Failed to read user:",
        storageError
      );
    }

    return null;
  }, [user]);

  // Find the real patient record belonging to the logged-in account
  const resolvePatient = useCallback(async () => {
    const loggedInUser = getLoggedInUser();

    console.log(
      "MedicalHistory - Logged in user:",
      loggedInUser
    );

    if (!loggedInUser) {
      throw new Error(
        "Could not identify the logged-in patient."
      );
    }

    // If login data already contains the patient ID,
    // use it directly.
    const directPatientId =
      loggedInUser.patientId ||
      loggedInUser.patientID;

    if (directPatientId) {
      const patientResponse = await api.get(
        "/api/patients"
      );

      const patients = Array.isArray(
        patientResponse.data
      )
        ? patientResponse.data
        : [];

      const matchedPatient = patients.find(
        (patientRecord) => {
          const patientId =
            patientRecord.patientId ||
            patientRecord.id;

          return (
            String(patientId) ===
            String(directPatientId)
          );
        }
      );

      if (matchedPatient) {
        setPatient(matchedPatient);

        return matchedPatient;
      }
    }

    if (!loggedInUser.email) {
      throw new Error(
        "Patient email is not available. Please log in again."
      );
    }

    const response = await api.get(
      "/api/patients"
    );

    const patients = Array.isArray(
      response.data
    )
      ? response.data
      : [];

    const loggedInEmail =
      loggedInUser.email.trim().toLowerCase();

    const matchedPatient = patients.find(
      (patientRecord) =>
        patientRecord.email &&
        patientRecord.email
          .trim()
          .toLowerCase() === loggedInEmail
    );

    console.log(
      "MedicalHistory - Matched patient:",
      matchedPatient
    );

    if (!matchedPatient) {
      throw new Error(
        "No patient record found for this account."
      );
    }

    setPatient(matchedPatient);

    return matchedPatient;
  }, [getLoggedInUser]);

  // Find doctor name using doctor ID
  const getDoctorName = useCallback(
    (doctorId) => {
      if (!doctorId) {
        return "Hospital Administration";
      }

      const doctor = doctors.find(
        (doctorRecord) =>
          String(
            doctorRecord.id ||
              doctorRecord.doctorId
          ) === String(doctorId)
      );

      if (!doctor) {
        return `Doctor ID: ${doctorId}`;
      }

      if (doctor.name) {
        return `Dr. ${doctor.name}`;
      }

      const fullName =
        `${doctor.firstName || ""} ${
          doctor.lastName || ""
        }`.trim();

      return fullName
        ? `Dr. ${fullName}`
        : `Doctor ID: ${doctorId}`;
    },
    [doctors]
  );

  // Load patient, doctors and medical records
  const loadMedicalHistory = useCallback(
    async (showRefreshLoader = false) => {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const matchedPatient =
          await resolvePatient();

        const patientId =
          matchedPatient?.patientId ||
          matchedPatient?.id;

        if (!patientId) {
          throw new Error(
            "Patient ID is not available."
          );
        }

        const [
          doctorResponse,
          recordsResponse
        ] = await Promise.all([
          api.get("/api/doctors"),
          api.get(
            `/api/medical-records/patient/${patientId}`
          )
        ]);

        const doctorsData = Array.isArray(
          doctorResponse.data
        )
          ? doctorResponse.data
          : [];

        const recordsData = Array.isArray(
          recordsResponse.data
        )
          ? recordsResponse.data
          : [];

        setDoctors(doctorsData);
        setRecords(recordsData);

        console.log(
          "MedicalHistory - Patient ID:",
          patientId
        );

        console.log(
          "MedicalHistory - Medical records:",
          recordsData
        );
      } catch (err) {
        console.error(
          "MedicalHistory - Failed to load medical history:",
          err
        );

        console.error(
          "MedicalHistory - API response:",
          err?.response?.data
        );

        setRecords([]);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load medical history."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [resolvePatient]
  );

  useEffect(() => {
    loadMedicalHistory();
  }, [loadMedicalHistory]);

  // Filter medical records
  const filteredRecords = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return records;
    }

    return records.filter((record) => {
      const doctorName = getDoctorName(
        record.doctorId
      );

      return (
        String(record.id || "")
          .toLowerCase()
          .includes(search) ||
        String(record.patientId || "")
          .toLowerCase()
          .includes(search) ||
        String(record.doctorId || "")
          .toLowerCase()
          .includes(search) ||
        doctorName
          .toLowerCase()
          .includes(search) ||
        String(record.diagnosis || "")
          .toLowerCase()
          .includes(search) ||
        String(record.symptoms || "")
          .toLowerCase()
          .includes(search) ||
        String(record.treatment || "")
          .toLowerCase()
          .includes(search) ||
        String(record.medications || "")
          .toLowerCase()
          .includes(search) ||
        String(record.allergies || "")
          .toLowerCase()
          .includes(search) ||
        String(record.notes || "")
          .toLowerCase()
          .includes(search)
      );
    });
  }, [
    records,
    searchTerm,
    getDoctorName
  ]);

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(
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

  const patientName = patient
    ? `${patient.firstName || ""} ${
        patient.lastName || ""
      }`.trim()
    : "Patient";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-lime-100 p-3 rounded-xl">
                <FileText
                  size={24}
                  className="text-lime-600"
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Medical History
                </h2>

                <p className="text-gray-500 mt-1">
                  View medical reports provided by the hospital administration.
                </p>
              </div>
            </div>

            {patient && (
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <span className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
                  <User size={15} />
                  {patientName}
                </span>

                <span className="px-3 py-2 bg-lime-50 text-lime-700 rounded-lg text-sm font-medium">
                  Patient ID:{" "}
                  {patient.patientId ||
                    patient.id}
                </span>

                <span className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                  View Only
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              loadMedicalHistory(true)
            }
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        {/* Total Medical Records */}
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                My Medical Records
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-2">
                {loading
                  ? "..."
                  : records.length}
              </p>
            </div>

            <div className="bg-lime-100 p-3 rounded-lg">
              <FileText
                size={22}
                className="text-lime-600"
              />
            </div>
          </div>
        </div>

        {/* Doctors */}
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Doctors In Records
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-2">
                {loading
                  ? "..."
                  : new Set(
                      records
                        .map(
                          (record) =>
                            record.doctorId
                        )
                        .filter(Boolean)
                    ).size}
              </p>
            </div>

            <div className="bg-blue-100 p-3 rounded-lg">
              <User
                size={22}
                className="text-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Filtered Records */}
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Showing Records
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-2">
                {loading
                  ? "..."
                  : filteredRecords.length}
              </p>
            </div>

            <div className="bg-purple-100 p-3 rounded-lg">
              <ClipboardList
                size={22}
                className="text-purple-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Medical Records */}
      <div className="bg-white rounded-lg shadow-sm">

        {/* Section Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                My Medical Reports
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Medical reports provided by the hospital administration are shown here.
              </p>
            </div>

            <div className="relative w-full lg:w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search diagnosis, treatment, doctor..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="p-10 text-center">
            <RefreshCw
              size={30}
              className="mx-auto text-lime-600 animate-spin"
            />

            <p className="text-gray-500 mt-3">
              Loading medical history...
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-10 text-center">
            <FileText
              size={45}
              className="mx-auto text-gray-300"
            />

            <h3 className="font-semibold text-gray-700 mt-4">
              No medical reports found
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Medical reports provided by the hospital administration will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Record ID
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Doctor
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Date
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Diagnosis
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Treatment
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Medications
                  </th>

                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map(
                  (record) => (
                    <tr
                      key={record.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <span className="font-semibold text-gray-800">
                          #{record.id}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <User
                              size={16}
                              className="text-blue-600"
                            />
                          </div>

                          <div>
                            <p className="font-medium text-gray-800">
                              {getDoctorName(
                                record.doctorId
                              )}
                            </p>

                            <p className="text-xs text-gray-500">
                              ID:{" "}
                              {record.doctorId ||
                                "Hospital Admin"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar
                            size={16}
                            className="text-gray-400"
                          />

                          {formatDate(
                            record.recordDate
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <p className="max-w-xs truncate text-gray-800">
                          {record.diagnosis ||
                            "-"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="max-w-xs truncate text-gray-700">
                          {record.treatment ||
                            "-"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="max-w-xs truncate text-gray-700">
                          {record.medications ||
                            "-"}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRecord(
                              record
                            )
                          }
                          className="inline-flex items-center gap-2 px-3 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors font-medium text-sm"
                        >
                          <FileText
                            size={16}
                          />
                          View Report
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Medical Report Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() =>
            setSelectedRecord(null)
          }
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Medical Report
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Record #{selectedRecord.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRecord(null)
                }
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                aria-label="Close medical report"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">

              {/* Patient and Doctor Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Patient */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-lime-100 p-3 rounded-lg">
                      <User
                        size={20}
                        className="text-lime-600"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">
                        Patient
                      </p>

                      <p className="text-base font-semibold text-gray-800 mt-1">
                        {patientName}
                      </p>

                      <p className="text-sm text-lime-700 font-medium mt-1">
                        Patient ID:{" "}
                        {selectedRecord.patientId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Doctor */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <User
                        size={20}
                        className="text-blue-600"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">
                        Doctor
                      </p>

                      <p className="text-base font-semibold text-gray-800 mt-1">
                        {getDoctorName(
                          selectedRecord.doctorId
                        )}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Doctor ID:{" "}
                        {selectedRecord.doctorId ||
                          "Hospital Administration"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Record Date */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Record Date
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <Calendar
                      size={18}
                      className="text-gray-400"
                    />

                    <p className="text-base font-medium text-gray-800">
                      {formatDate(
                        selectedRecord.recordDate
                      )}
                    </p>
                  </div>
                </div>

                {/* Record ID */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Record ID
                  </p>

                  <p className="text-base font-medium text-gray-800 mt-2">
                    #{selectedRecord.id}
                  </p>
                </div>
              </div>

              {/* Clinical Information */}
              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Clinical Information
                </h3>

                <div className="space-y-4">

                  {/* Diagnosis */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Diagnosis
                    </p>

                    <div className="mt-1 bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                      {selectedRecord.diagnosis ||
                        "-"}
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Symptoms
                    </p>

                    <div className="mt-1 bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                      {selectedRecord.symptoms ||
                        "-"}
                    </div>
                  </div>

                  {/* Treatment */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Treatment
                    </p>

                    <div className="mt-1 bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                      {selectedRecord.treatment ||
                        "-"}
                    </div>
                  </div>

                  {/* Medications */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Medications
                    </p>

                    <div className="mt-1 bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                      {selectedRecord.medications ||
                        "-"}
                    </div>
                  </div>

                  {/* Allergies */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Allergies
                    </p>

                    <div className="mt-1 bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                      {selectedRecord.allergies ||
                        "-"}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Notes
                    </p>

                    <div className="mt-1 bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                      {selectedRecord.notes ||
                        "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Read Only Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  This medical report is provided by the hospital administration and is available for viewing only.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setSelectedRecord(null)
                }
                className="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
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

export default MedicalHistory;
