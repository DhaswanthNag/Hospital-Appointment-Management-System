import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FileText, Search, Eye, X } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";

const MedicalHistory = () => {
  const { user } = useContext(AuthContext);

  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("all");

  const [selectedRecord, setSelectedRecord] = useState(null);

  // Get logged-in doctor ID
  const getLoggedInDoctorId = useCallback(
    (doctorsList = doctors) => {
      const possibleDoctorId =
        user?.doctorId ||
        user?.doctorID;

      if (possibleDoctorId) {
        const doctorById = doctorsList.find(
          (doctor) =>
            String(doctor.id).toLowerCase() ===
            String(possibleDoctorId).toLowerCase()
        );

        if (doctorById) {
          return String(doctorById.id);
        }

        return String(possibleDoctorId);
      }

      const doctorByUserId = doctorsList.find(
        (doctor) =>
          String(doctor.id).toLowerCase() ===
          String(user?.id || "").toLowerCase()
      );

      if (doctorByUserId) {
        return String(doctorByUserId.id);
      }

      const doctorByEmail = doctorsList.find(
        (doctor) =>
          user?.email &&
          doctor?.email &&
          String(doctor.email).toLowerCase() ===
            String(user.email).toLowerCase()
      );

      if (doctorByEmail) {
        return String(doctorByEmail.id);
      }

      return "";
    },
    [user, doctors]
  );

  // Load doctors, patients and medical records
  const loadData = useCallback(async () => {
    try {
      setError("");

      const [patientsResponse, doctorsResponse] =
        await Promise.all([
          api.get("/api/patients"),
          api.get("/api/doctors"),
        ]);

      const patientsData = Array.isArray(patientsResponse.data)
        ? patientsResponse.data
        : [];

      const doctorsData = Array.isArray(doctorsResponse.data)
        ? doctorsResponse.data
        : [];

      setPatients(patientsData);
      setDoctors(doctorsData);

      const doctorId = getLoggedInDoctorId(doctorsData);

      if (!doctorId) {
        setRecords([]);
        setError(
          "Unable to identify the logged-in doctor. Please log in again."
        );
        setLoading(false);
        return;
      }

      const recordsResponse = await api.get(
        `/api/medical-records/doctor/${doctorId}`
      );

      const recordsData = Array.isArray(recordsResponse.data)
        ? recordsResponse.data
        : [];

      setRecords(recordsData);
      setLoading(false);
    } catch (err) {
      console.error("Unable to load medical records:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load medical records. Please check the backend."
      );

      setLoading(false);
    }
  }, [getLoggedInDoctorId]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadData();
  }, [user, loadData]);

  // Find patient name using patient ID
  const getPatientName = useCallback(
    (patientId) => {
      const patient = patients.find(
        (item) => String(item.id) === String(patientId)
      );

      if (!patient) {
        return "Unknown Patient";
      }

      return (
        patient.name ||
        patient.fullName ||
        `${patient.firstName || ""} ${patient.lastName || ""}`.trim() ||
        patient.email ||
        "Unknown Patient"
      );
    },
    [patients]
  );

  // Find doctor name using doctor ID
  const getDoctorName = useCallback(
    (doctorId) => {
      const doctor = doctors.find(
        (item) => String(item.id) === String(doctorId)
      );

      if (!doctor) {
        return "Unknown Doctor";
      }

      return (
        doctor.name ||
        doctor.fullName ||
        `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() ||
        doctor.email ||
        "Unknown Doctor"
      );
    },
    [doctors]
  );

  // Get the actual doctor record
  const loggedInDoctor = useMemo(() => {
    const doctorId = getLoggedInDoctorId();

    return doctors.find(
      (doctor) => String(doctor.id) === String(doctorId)
    );
  }, [doctors, getLoggedInDoctorId]);

  // Filter records
  const filteredRecords = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return records.filter((record) => {
      const matchesPatient =
        selectedPatient === "all" ||
        String(record.patientId) === String(selectedPatient);

      const patientName = getPatientName(record.patientId).toLowerCase();

      const matchesSearch =
        !search ||
        String(record.patientId || "")
          .toLowerCase()
          .includes(search) ||
        patientName.includes(search) ||
        String(record.diagnosis || "")
          .toLowerCase()
          .includes(search) ||
        String(record.symptoms || "")
          .toLowerCase()
          .includes(search) ||
        String(record.treatment || "")
          .toLowerCase()
          .includes(search);

      return matchesPatient && matchesSearch;
    });
  }, [
    records,
    selectedPatient,
    searchTerm,
    getPatientName,
  ]);

  // Patients who have medical records with this doctor
  const doctorPatients = useMemo(() => {
    const patientIds = [
      ...new Set(
        records
          .map((record) => record.patientId)
          .filter(Boolean)
      ),
    ];

    return patients.filter((patient) =>
      patientIds.some(
        (patientId) => String(patient.id) === String(patientId)
      )
    );
  }, [records, patients]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Medical Records
          </h1>

          <p className="text-gray-500 mt-1">
            View medical records provided by the hospital administration.
          </p>

          {loggedInDoctor && (
            <p className="text-sm text-lime-700 mt-2 font-medium">
              Doctor ID: {loggedInDoctor.id} •{" "}
              {getDoctorName(loggedInDoctor.id)}
            </p>
          )}
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-lime-50 text-lime-700 border border-lime-200 rounded-lg font-medium">
          <FileText size={18} />
          View Only
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                My Medical Records
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {records.length}
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-lime-100 text-lime-600 flex items-center justify-center">
              <FileText size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Patients With Records
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {doctorPatients.length}
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-lime-100 text-lime-600 flex items-center justify-center">
              <FileText size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Filtered Records
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {filteredRecords.length}
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-lime-100 text-lime-600 flex items-center justify-center">
              <Search size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search patient ID, patient name, diagnosis..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
            />
          </div>

          <select
            value={selectedPatient}
            onChange={(event) =>
              setSelectedPatient(event.target.value)
            }
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
          >
            <option value="all">All Patients</option>

            {doctorPatients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.id} - {getPatientName(patient.id)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Medical Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Patient Medical Records
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Medical records created by the hospital administration for this doctor are shown here.
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading medical records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-10 text-center">
            <FileText
              size={40}
              className="mx-auto text-gray-300 mb-3"
            />

            <p className="text-gray-600 font-medium">
              No medical records found.
            </p>

            <p className="text-sm text-gray-400 mt-1">
              Medical records assigned to you by the administration will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1320px]">
              <thead className="bg-lime-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-lime-800 uppercase">
                    Record ID
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-lime-800 uppercase">
                    Patient
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-lime-800 uppercase">
                    Doctor
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-lime-800 uppercase">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-lime-800 uppercase">
                    Diagnosis
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-lime-800 uppercase">
                    Symptoms
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-lime-800 uppercase">
                    Treatment
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-lime-800 uppercase">
                    Medications
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-lime-800 uppercase">
                    Allergies
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-lime-800 uppercase">
                    Notes
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-lime-800 uppercase">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-lime-50/40 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <span className="font-medium text-gray-800">
                        #{record.id}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-800">
                        {getPatientName(record.patientId)}
                      </p>

                      <p className="text-xs text-lime-700 font-medium mt-1">
                        Patient ID: {record.patientId}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-800">
                        {getDoctorName(record.doctorId)}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Doctor ID: {record.doctorId}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {record.recordDate || "-"}
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-800 max-w-[180px]">
                        {record.diagnosis || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600 max-w-[180px]">
                        {record.symptoms || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600 max-w-[180px]">
                        {record.treatment || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600 max-w-[180px]">
                        {record.medications || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600 max-w-[180px]">
                        {record.allergies || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600 max-w-[180px]">
                        {record.notes || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(record)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors font-medium text-sm"
                      >
                        <Eye size={16} />
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Medical Report Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
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
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                aria-label="Close medical report"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Patient
                  </p>

                  <p className="text-base font-semibold text-gray-800 mt-1">
                    {getPatientName(selectedRecord.patientId)}
                  </p>

                  <p className="text-sm text-lime-700 font-medium mt-1">
                    Patient ID: {selectedRecord.patientId}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Doctor
                  </p>

                  <p className="text-base font-semibold text-gray-800 mt-1">
                    {getDoctorName(selectedRecord.doctorId)}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Doctor ID: {selectedRecord.doctorId}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Record Date
                  </p>

                  <p className="text-base font-medium text-gray-800 mt-1">
                    {selectedRecord.recordDate || "-"}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Record ID
                  </p>

                  <p className="text-base font-medium text-gray-800 mt-1">
                    #{selectedRecord.id}
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Clinical Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Diagnosis
                    </p>

                    <div className="mt-1 bg-gray-50 rounded-lg p-3 text-gray-800">
                      {selectedRecord.diagnosis || "-"}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Symptoms
                    </p>

                    <div className="mt-1 bg-gray-50 rounded-lg p-3 text-gray-800">
                      {selectedRecord.symptoms || "-"}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Treatment
                    </p>

                    <div className="mt-1 bg-gray-50 rounded-lg p-3 text-gray-800">
                      {selectedRecord.treatment || "-"}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Medications
                    </p>

                    <div className="mt-1 bg-gray-50 rounded-lg p-3 text-gray-800">
                      {selectedRecord.medications || "-"}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Allergies
                    </p>

                    <div className="mt-1 bg-gray-50 rounded-lg p-3 text-gray-800">
                      {selectedRecord.allergies || "-"}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Notes
                    </p>

                    <div className="mt-1 bg-gray-50 rounded-lg p-3 text-gray-800">
                      {selectedRecord.notes || "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
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
