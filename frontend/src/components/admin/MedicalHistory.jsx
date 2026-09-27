import React, { useCallback, useEffect, useMemo, useState } from "react";
// import PropTypes from "prop-types";
import {
  Activity,
  Calendar,
  ClipboardList,
  Edit,
  FileText,
  HeartPulse,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  User,
  X,
} from "lucide-react";
import api from "../../api/api";

const MedicalHistory = () => {
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterPatient, setFilterPatient] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    recordDate: new Date().toISOString().split("T")[0],
    diagnosis: "",
    symptoms: "",
    treatment: "",
    medications: "",
    allergies: "",
    notes: "",
  });

  const fetchDoctors = useCallback(async () => {
    try {
      const response = await api.get("/api/doctors");
      setDoctors(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load doctors:", err);
      setDoctors([]);
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
      const response = await api.get("/api/patients");
      setPatients(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load patients:", err);
      setPatients([]);
    }
  }, []);

  const fetchMedicalRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/medical-records");

      setRecords(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load medical records:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load medical records."
      );

      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicalRecords();
    fetchDoctors();
    fetchPatients();
  }, [fetchMedicalRecords, fetchDoctors, fetchPatients]);

  const getDoctorId = (doctor) => {
    if (!doctor) return "";

    return (
      doctor.doctorId ||
      doctor.id ||
      doctor.userId ||
      doctor.username ||
      ""
    );
  };

  const getPatientId = (patient) => {
    if (!patient) return "";

    return (
      patient.patientId ||
      patient.id ||
      patient.userId ||
      patient.username ||
      ""
    );
  };

  const getDoctorName = useCallback(
    (doctorId) => {
      const doctor = doctors.find(
        (item) => String(getDoctorId(item)) === String(doctorId)
      );

      if (!doctor) return doctorId || "Unknown Doctor";

      return (
        doctor.name ||
        doctor.fullName ||
        doctor.doctorName ||
        `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() ||
        doctor.email ||
        doctorId
      );
    },
    [doctors]
  );

  const getPatientName = useCallback(
    (patientId) => {
      const patient = patients.find(
        (item) => String(getPatientId(item)) === String(patientId)
      );

      if (!patient) return patientId || "Unknown Patient";

      return (
        patient.name ||
        patient.fullName ||
        patient.patientName ||
        `${patient.firstName || ""} ${patient.lastName || ""}`.trim() ||
        patient.email ||
        patientId
      );
    },
    [patients]
  );

  const openAddModal = () => {
    setEditingRecord(null);

    setFormData({
      patientId: "",
      doctorId: "",
      recordDate: new Date().toISOString().split("T")[0],
      diagnosis: "",
      symptoms: "",
      treatment: "",
      medications: "",
      allergies: "",
      notes: "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);

    setFormData({
      patientId: record.patientId || "",
      doctorId: record.doctorId || "",
      recordDate:
        record.recordDate ||
        new Date().toISOString().split("T")[0],
      diagnosis: record.diagnosis || "",
      symptoms: record.symptoms || "",
      treatment: record.treatment || "",
      medications: record.medications || "",
      allergies: record.allergies || "",
      notes: record.notes || "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (formLoading) return;

    setShowModal(false);
    setEditingRecord(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.patientId) {
      setError("Please select a patient.");
      return;
    }

    if (!formData.doctorId) {
      setError("Please select a doctor.");
      return;
    }

    if (!formData.recordDate) {
      setError("Please select a record date.");
      return;
    }

    if (!formData.diagnosis.trim()) {
      setError("Please enter the diagnosis.");
      return;
    }

    setFormLoading(true);

    try {
      const payload = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        recordDate: formData.recordDate,
        diagnosis: formData.diagnosis.trim(),
        symptoms: formData.symptoms.trim(),
        treatment: formData.treatment.trim(),
        medications: formData.medications.trim(),
        allergies: formData.allergies.trim(),
        notes: formData.notes.trim(),
      };

      if (editingRecord) {
        await api.put(
          `/api/medical-records/${editingRecord.id}`,
          payload
        );

        setSuccess("Medical record updated successfully.");
      } else {
        await api.post("/api/medical-records", payload);

        setSuccess("Medical record added successfully.");
      }

      await fetchMedicalRecords();

      setTimeout(() => {
        setShowModal(false);
        setEditingRecord(null);
        setSuccess("");
      }, 700);
    } catch (err) {
      console.error("Failed to save medical record:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to save medical record."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this medical record?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/api/medical-records/${id}`);

      setRecords((previous) =>
        previous.filter((record) => record.id !== id)
      );

      setSuccess("Medical record deleted successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Failed to delete medical record:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to delete medical record."
      );
    }
  };

  const filteredRecords = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return records.filter((record) => {
      const doctorName = getDoctorName(record.doctorId);
      const patientName = getPatientName(record.patientId);

      const matchesSearch =
        !search ||
        String(record.patientId || "")
          .toLowerCase()
          .includes(search) ||
        String(record.doctorId || "")
          .toLowerCase()
          .includes(search) ||
        String(patientName || "")
          .toLowerCase()
          .includes(search) ||
        String(doctorName || "")
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
          .includes(search);

      const matchesDoctor =
        !filterDoctor ||
        String(record.doctorId) === String(filterDoctor);

      const matchesPatient =
        !filterPatient ||
        String(record.patientId) === String(filterPatient);

      return matchesSearch && matchesDoctor && matchesPatient;
    });
  }, [
    records,
    searchTerm,
    filterDoctor,
    filterPatient,
    getDoctorName,
    getPatientName,
  ]);

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-lime-100 flex items-center justify-center">
                <HeartPulse className="w-6 h-6 text-lime-600" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Medical Records
                </h1>

                <p className="text-gray-500 text-sm mt-1">
                  Manage patient medical history and clinical records
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-lime-500 hover:bg-lime-600 text-white font-semibold shadow-sm transition"
          >
            <Plus className="w-5 h-5" />
            Add Medical Record
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-700">
            {success}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Records
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {records.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-lime-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-lime-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Patients
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {new Set(
                    records.map((record) => record.patientId)
                  ).size}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Doctors
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {new Set(
                    records.map((record) => record.doctorId)
                  ).size}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Showing
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {filteredRecords.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search patient, doctor, diagnosis..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
              />
            </div>

            <select
              value={filterDoctor}
              onChange={(event) =>
                setFilterDoctor(event.target.value)
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
            >
              <option value="">All Doctors</option>

              {doctors.map((doctor) => {
                const doctorId = getDoctorId(doctor);

                return (
                  <option key={doctorId} value={doctorId}>
                    {doctorId} - {getDoctorName(doctorId)}
                  </option>
                );
              })}
            </select>

            <select
              value={filterPatient}
              onChange={(event) =>
                setFilterPatient(event.target.value)
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
            >
              <option value="">All Patients</option>

              {patients.map((patient) => {
                const patientId = getPatientId(patient);

                return (
                  <option key={patientId} value={patientId}>
                    {patientId} - {getPatientName(patientId)}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Records */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800">
                Medical Records
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Patient clinical history
              </p>
            </div>

            <ClipboardList className="w-5 h-5 text-lime-600" />
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block w-8 h-8 border-4 border-lime-200 border-t-lime-500 rounded-full animate-spin" />

              <p className="text-gray-500 mt-3">
                Loading medical records...
              </p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-16 text-center px-4">
              <HeartPulse className="w-12 h-12 text-gray-300 mx-auto mb-3" />

              <h3 className="font-semibold text-gray-700">
                No medical records found
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Add a medical record or change your search filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Patient
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Doctor
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Date
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Diagnosis
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Treatment
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Medications
                    </th>

                    <th className="text-right px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-lime-50/40 transition"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-lime-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-lime-600" />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {getPatientName(record.patientId)}
                            </p>

                            <p className="text-xs text-gray-500">
                              {record.patientId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">
                          {getDoctorName(record.doctorId)}
                        </p>

                        <p className="text-xs text-gray-500">
                          {record.doctorId}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-lime-600" />

                          <span>
                            {record.recordDate || "-"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800 max-w-[220px] truncate">
                          {record.diagnosis || "-"}
                        </p>

                        {record.symptoms && (
                          <p className="text-xs text-gray-500 max-w-[220px] truncate mt-1">
                            {record.symptoms}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700 max-w-[200px] truncate">
                          {record.treatment || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700 max-w-[200px] truncate">
                          {record.medications || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(record)
                            }
                            className="p-2 rounded-lg bg-lime-50 text-lime-700 hover:bg-lime-100 transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(record.id)
                            }
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">

            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingRecord
                    ? "Edit Medical Record"
                    : "Add Medical Record"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Enter patient clinical information
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Patient / Doctor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label
                    htmlFor="patientId"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Patient ID
                  </label>

                  <select
                    id="patientId"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                    required
                  >
                    <option value="">
                      Select Patient
                    </option>

                    {patients.map((patient) => {
                      const patientId =
                        getPatientId(patient);

                      return (
                        <option
                          key={patientId}
                          value={patientId}
                        >
                          {patientId} -{" "}
                          {getPatientName(patientId)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="doctorId"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Doctor ID
                  </label>

                  <select
                    id="doctorId"
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                    required
                  >
                    <option value="">
                      Select Doctor
                    </option>

                    {doctors.map((doctor) => {
                      const doctorId =
                        getDoctorId(doctor);

                      return (
                        <option
                          key={doctorId}
                          value={doctorId}
                        >
                          {doctorId} -{" "}
                          {getDoctorName(doctorId)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="recordDate"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Record Date
                </label>

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lime-600" />

                  <input
                    id="recordDate"
                    type="date"
                    name="recordDate"
                    value={formData.recordDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                    required
                  />
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <label
                  htmlFor="diagnosis"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Diagnosis
                </label>

                <textarea
                  id="diagnosis"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter diagnosis..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                  required
                />
              </div>

              {/* Symptoms */}
              <div>
                <label
                  htmlFor="symptoms"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Symptoms
                </label>

                <textarea
                  id="symptoms"
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter patient symptoms..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                />
              </div>

              {/* Treatment */}
              <div>
                <label
                  htmlFor="treatment"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Treatment
                </label>

                <textarea
                  id="treatment"
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter treatment details..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                />
              </div>

              {/* Medications / Allergies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label
                    htmlFor="medications"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Medications
                  </label>

                  <textarea
                    id="medications"
                    name="medications"
                    value={formData.medications}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Enter prescribed medications..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="allergies"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Allergies
                  </label>

                  <textarea
                    id="allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Enter known allergies..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Notes
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Additional medical notes..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formLoading}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-3 rounded-xl bg-lime-500 hover:bg-lime-600 text-white font-semibold transition disabled:opacity-50"
                >
                  {formLoading
                    ? "Saving..."
                    : editingRecord
                    ? "Update Record"
                    : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// MedicalHistory.propTypes = {};
export default MedicalHistory;