import React, { useEffect, useState } from "react";
import {
  FlaskConical,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  RefreshCw,
  UserRound,
  Stethoscope,
  CalendarDays,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import api from "../../api/api";

const LabReports = () => {
  const [reports, setReports] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [patientFilter, setPatientFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    testName: "",
    testType: "",
    result: "",
    normalRange: "",
    unit: "",
    status: "Pending",
    reportDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const testOptions = {
    "Blood Tests": [
      "Complete Blood Count (CBC)",
      "Blood Glucose",
      "HbA1c",
      "Lipid Profile",
      "Liver Function Test (LFT)",
      "Kidney Function Test (KFT)",
      "Thyroid Profile",
      "Blood Group",
      "Hemoglobin",
      "ESR",
      "CRP",
      "Iron Profile",
      "Vitamin B12",
      "Vitamin D",
    ],
    "Urine Tests": [
      "Urinalysis",
      "Urine Culture",
      "Urine Routine Examination",
      "Urine Pregnancy Test",
      "Urine Protein",
      "Urine Glucose",
    ],
    Imaging: [
      "X-Ray",
      "Ultrasound",
      "CT Scan",
      "MRI Scan",
      "Mammography",
      "Echocardiogram",
    ],
    Microbiology: [
      "Blood Culture",
      "Urine Culture",
      "Sputum Culture",
      "Throat Swab Culture",
      "Stool Culture",
      "Wound Culture",
    ],
    Pathology: [
      "Biopsy",
      "Histopathology",
      "Cytology",
      "Pap Smear",
      "Fine Needle Aspiration (FNA)",
    ],
    Cardiology: [
      "ECG",
      "Echocardiogram",
      "Cardiac Enzymes",
      "Troponin Test",
      "Holter Monitoring",
    ],
    "Hormone Tests": [
      "TSH",
      "T3",
      "T4",
      "Cortisol",
      "Insulin",
      "Testosterone",
      "Estrogen",
      "Progesterone",
    ],
    "Other Tests": [
      "Pregnancy Test",
      "Allergy Test",
      "COVID-19 Test",
      "Dengue Test",
      "Malaria Test",
      "Typhoid Test",
      "HIV Test",
      "Hepatitis B Test",
      "Hepatitis C Test",
    ],
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [reportsResponse, doctorsResponse, patientsResponse] =
        await Promise.all([
          api.get("/api/lab-reports"),
          api.get("/api/doctors"),
          api.get("/api/patients"),
        ]);

      setReports(
        Array.isArray(reportsResponse.data) ? reportsResponse.data : []
      );

      setDoctors(
        Array.isArray(doctorsResponse.data) ? doctorsResponse.data : []
      );

      setPatients(
        Array.isArray(patientsResponse.data) ? patientsResponse.data : []
      );
    } catch (error) {
      console.error("Error loading laboratory data:", error);
      alert("Unable to load laboratory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(
      (item) =>
        String(item.id) === String(doctorId) ||
        String(item.doctorId) === String(doctorId)
    );

    if (!doctor) return "Unknown Doctor";

    return (
      doctor.name ||
      doctor.fullName ||
      `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() ||
      doctor.email ||
      "Unknown Doctor"
    );
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(
      (item) =>
        String(item.patientId) === String(patientId) ||
        String(item.patientID) === String(patientId) ||
        String(item.id) === String(patientId)
    );

    if (!patient) return "Unknown Patient";

    return (
      patient.name ||
      patient.fullName ||
      `${patient.firstName || ""} ${patient.lastName || ""}`.trim() ||
      patient.email ||
      "Unknown Patient"
    );
  };

  const openAddModal = () => {
    setEditingReport(null);

    setFormData({
      patientId: "",
      doctorId: "",
      testName: "",
      testType: "",
      result: "",
      normalRange: "",
      unit: "",
      status: "Pending",
      reportDate: new Date().toISOString().split("T")[0],
      notes: "",
    });

    setShowModal(true);
  };

  const openEditModal = (report) => {
    setEditingReport(report);

    setFormData({
      patientId: report.patientId || "",
      doctorId: report.doctorId || "",
      testName: report.testName || "",
      testType: report.testType || "",
      result: report.result || "",
      normalRange: report.normalRange || "",
      unit: report.unit || "",
      status: report.status || "Pending",
      reportDate: report.reportDate || "",
      notes: report.notes || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingReport(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "testType" ? { testName: "" } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.patientId) {
      alert("Please select a patient.");
      return;
    }

    if (!formData.doctorId) {
      alert("Please select a doctor.");
      return;
    }

    if (!formData.testName.trim()) {
      alert("Please select the test name.");
      return;
    }

    if (!formData.testType) {
      alert("Please select the test type.");
      return;
    }

    /*
     * The backend LabReport model uses String for patientId and doctorId.
     * HTML select values are strings, so send both IDs directly
     * to Spring Boot without converting them to numbers.
     *
     * The patient dropdown now stores the actual patientId
     * such as PAT001, PAT002, PAT005 instead of the database
     * numeric ID such as 6.
     */
    const payload = {
      ...formData,
      patientId: String(formData.patientId),
      doctorId: String(formData.doctorId),
    };

    try {
      setSaving(true);

      if (editingReport) {
        const response = await api.put(
          `/api/lab-reports/${editingReport.id}`,
          payload
        );

        setReports((previous) =>
          previous.map((report) =>
            report.id === editingReport.id ? response.data : report
          )
        );

        alert("Laboratory report updated successfully.");
      } else {
        const response = await api.post(
          "/api/lab-reports",
          payload
        );

        setReports((previous) => [response.data, ...previous]);

        alert("Laboratory report added successfully.");
      }

      closeModal();
    } catch (error) {
      console.error("Error saving laboratory report:", error);

      if (error.response?.data) {
        console.error("Backend response:", error.response.data);
      }

      alert("Unable to save laboratory report.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this laboratory report?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/lab-reports/${id}`);

      setReports((previous) =>
        previous.filter((report) => report.id !== id)
      );

      alert("Laboratory report deleted successfully.");
    } catch (error) {
      console.error("Error deleting laboratory report:", error);
      alert("Unable to delete laboratory report.");
    }
  };

  const filteredReports = reports.filter((report) => {
    const patientName = getPatientName(report.patientId).toLowerCase();
    const doctorName = getDoctorName(report.doctorId).toLowerCase();

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      patientName.includes(search) ||
      doctorName.includes(search) ||
      (report.testName || "").toLowerCase().includes(search) ||
      (report.testType || "").toLowerCase().includes(search) ||
      (report.result || "").toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "all" ||
      (report.status || "").toLowerCase() === statusFilter.toLowerCase();

    const matchesDoctor =
      doctorFilter === "all" ||
      String(report.doctorId) === String(doctorFilter);

    const matchesPatient =
      patientFilter === "all" ||
      String(report.patientId) === String(patientFilter);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDoctor &&
      matchesPatient
    );
  });

  const totalReports = reports.length;

  const completedReports = reports.filter(
    (report) =>
      (report.status || "").toLowerCase() === "completed"
  ).length;

  const pendingReports = reports.filter(
    (report) =>
      (report.status || "").toLowerCase() === "pending"
  ).length;

  const abnormalReports = reports.filter(
    (report) =>
      (report.status || "").toLowerCase() === "abnormal"
  ).length;

  const getStatusClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return "bg-lime-100 text-lime-700";

      case "abnormal":
        return "bg-red-100 text-red-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "cancelled":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-lime-100 text-lime-700";
    }
  };

  const getStatusIcon = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return <CheckCircle size={14} />;

      case "abnormal":
        return <AlertCircle size={14} />;

      case "pending":
        return <Clock size={14} />;

      default:
        return <FileText size={14} />;
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-lime-100 rounded-xl">
              <FlaskConical className="text-lime-600" size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Laboratory Management
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                Manage laboratory reports, test results, doctors and patients
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">

          <button
            onClick={fetchData}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-lime-50 hover:border-lime-300 hover:text-lime-700 transition"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-lime-500 text-white rounded-xl hover:bg-lime-600 transition shadow-sm"
          >
            <Plus size={18} />
            Add Lab Report
          </button>

        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Reports
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {totalReports}
              </h2>
            </div>

            <div className="p-3 bg-lime-100 rounded-xl">
              <FileText className="text-lime-600" size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Completed
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {completedReports}
              </h2>
            </div>

            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="text-green-600" size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Pending
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {pendingReports}
              </h2>
            </div>

            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock className="text-yellow-600" size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Abnormal
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {abnormalReports}
              </h2>
            </div>

            <div className="p-3 bg-red-100 rounded-xl">
              <AlertCircle className="text-red-600" size={22} />
            </div>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">

          <div className="relative xl:col-span-2">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search patient, doctor, test..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
            />

          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Abnormal">Abnormal</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={doctorFilter}
            onChange={(event) => setDoctorFilter(event.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
          >
            <option value="all">All Doctors</option>

            {doctors.map((doctor) => (
              <option
                key={doctor.id}
                value={doctor.doctorId || doctor.id}
              >
                {getDoctorName(doctor.doctorId || doctor.id)}
              </option>
            ))}

          </select>

          <select
            value={patientFilter}
            onChange={(event) => setPatientFilter(event.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
          >
            <option value="all">All Patients</option>

            {patients.map((patient) => (
              <option
                key={patient.id}
                value={patient.patientId || patient.id}
              >
                {getPatientName(patient.patientId || patient.id)}
              </option>
            ))}

          </select>

        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            Laboratory Reports
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {filteredReports.length} report
            {filteredReports.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw
              size={28}
              className="animate-spin text-lime-600"
            />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-16">

            <FlaskConical
              size={45}
              className="mx-auto text-gray-300"
            />

            <h3 className="text-lg font-semibold text-gray-700 mt-4">
              No laboratory reports found
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              Add a new laboratory report to get started.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-lime-50">

                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Patient
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Doctor
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Test
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Result
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Date
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>

                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredReports.map((report) => (

                  <tr
                    key={report.id}
                    className="hover:bg-lime-50/40 transition"
                  >

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="p-2 bg-lime-100 rounded-lg">
                          <UserRound
                            size={17}
                            className="text-lime-600"
                          />
                        </div>

                        <div>
                          <p className="font-medium text-gray-800">
                            {getPatientName(report.patientId)}
                          </p>

                          <p className="text-xs text-gray-400">
                            Patient #{report.patientId}
                          </p>

                        </div>

                      </div>

                    </td>

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-2">

                        <Stethoscope
                          size={17}
                          className="text-lime-600"
                        />

                        <span className="text-gray-700">
                          {getDoctorName(report.doctorId)}
                        </span>

                      </div>

                    </td>

                    <td className="px-6 py-4">

                      <p className="font-medium text-gray-800">
                        {report.testName}
                      </p>

                      <p className="text-xs text-gray-400">
                        {report.testType || "Laboratory Test"}
                      </p>

                    </td>

                    <td className="px-6 py-4">

                      <p className="font-medium text-gray-700">
                        {report.result || "-"}
                      </p>

                      {report.unit && (
                        <p className="text-xs text-gray-400">
                          {report.unit}
                        </p>
                      )}

                    </td>

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-2 text-gray-600">

                        <CalendarDays size={16} />

                        {report.reportDate || "-"}

                      </div>

                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusClass(
                          report.status
                        )}`}
                      >
                        {getStatusIcon(report.status)}
                        {report.status || "Pending"}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() => openEditModal(report)}
                          className="p-2 rounded-lg text-lime-600 hover:bg-lime-50 transition"
                          title="Edit"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(report.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 size={17} />
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

      {/* Add/Edit Modal */}
      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingReport
                    ? "Edit Laboratory Report"
                    : "Add Laboratory Report"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Enter laboratory test and result details
                </p>
              </div>

              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-lime-50 text-gray-500 hover:text-lime-600"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient *
                  </label>

                  <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                  >
                    <option value="">
                      Select Patient
                    </option>

                    {patients.map((patient) => (
                      <option
                        key={patient.id}
                        value={patient.patientId || patient.id}
                      >
                        {getPatientName(patient.patientId || patient.id)}
                      </option>
                    ))}

                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor *
                  </label>

                  <select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                  >
                    <option value="">
                      Select Doctor
                    </option>

                    {doctors.map((doctor) => (
                      <option
                        key={doctor.id}
                        value={doctor.doctorId || doctor.id}
                      >
                        {getDoctorName(doctor.doctorId || doctor.id)}
                      </option>
                    ))}

                  </select>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Type *
                  </label>

                  <select
                    name="testType"
                    value={formData.testType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                  >
                    <option value="">
                      Select Test Type
                    </option>

                    {Object.keys(testOptions).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}

                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Name *
                  </label>

                  <select
                    name="testName"
                    value={formData.testName}
                    onChange={handleChange}
                    required
                    disabled={!formData.testType}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">
                      {formData.testType
                        ? "Select Test Name"
                        : "Select Test Type First"}
                    </option>

                    {(testOptions[formData.testType] || []).map(
                      (test) => (
                        <option key={test} value={test}>
                          {test}
                        </option>
                      )
                    )}

                  </select>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Result
                  </label>

                  <input
                    type="text"
                    name="result"
                    value={formData.result}
                    onChange={handleChange}
                    placeholder="e.g. 13.5"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Normal Range
                  </label>

                  <input
                    type="text"
                    name="normalRange"
                    value={formData.normalRange}
                    onChange={handleChange}
                    placeholder="e.g. 12-16"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>

                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    placeholder="e.g. g/dL"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Abnormal">Abnormal</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Date
                  </label>

                  <input
                    type="date"
                    name="reportDate"
                    value={formData.reportDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                  />
                </div>

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Additional laboratory notes..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 resize-none"
                />

              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-lime-500 text-white rounded-xl hover:bg-lime-600 transition disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingReport
                    ? "Update Report"
                    : "Add Report"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default LabReports;