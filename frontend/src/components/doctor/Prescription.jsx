import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdLocalHospital,
  MdPerson,
  MdSearch,
  MdRefresh,
  MdClose,
  MdSave,
  MdVisibility,
} from "react-icons/md";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";

const Prescription = () => {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewPrescription, setViewPrescription] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const emptyMedicine = {
    medicineName: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  };
  const emptyForm = {
    patientId: "",
    doctorId: "",
    diagnosis: "",
    instructions: "",
    prescriptionDate: new Date().toISOString().split("T")[0],
    medicines: [{ ...emptyMedicine }],
  };
  const [formData, setFormData] = useState(emptyForm);

  // =========================================================
  // GET LOGGED-IN DOCTOR
  // =========================================================

  const getLoggedInUser = useCallback(() => {
    if (user?.email) {
      return user;
    }
    try {
      const storedUser = localStorage.getItem("hams_user");
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error("Error reading hams_user:", error);
    }
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error("Error reading user:", error);
    }
    return null;
  }, [user]);

  const findCurrentDoctor = useCallback((doctorList) => {
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser?.email) {
      return null;
    }
    return (
      doctorList.find(
        (doctor) =>
          doctor.email?.toLowerCase() ===
          loggedInUser.email?.toLowerCase()
      ) || null
    );
  }, [getLoggedInUser]);

  // =========================================================
  // LOAD DOCTORS, PATIENTS AND MY PRESCRIPTIONS
  // =========================================================

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [doctorResponse, patientResponse] = await Promise.all([
        api.get("/api/doctors"),
        api.get("/api/patients"),
      ]);
      const doctorList = doctorResponse.data || [];
      setDoctors(doctorList);
      setPatients(patientResponse.data || []);
      const loggedInDoctor = findCurrentDoctor(doctorList);
      if (!loggedInDoctor) {
        setCurrentDoctor(null);
        setPrescriptions([]);
        alert("Unable to identify the logged-in doctor.");
        return;
      }
      setCurrentDoctor(loggedInDoctor);
      const prescriptionResponse = await api.get(
        `/api/prescriptions/doctor/${loggedInDoctor.id}`
      );
      setPrescriptions(
        (prescriptionResponse.data || []).filter(
          (prescription) =>
            String(prescription.doctorId) ===
            String(loggedInDoctor.id)
        )
      );
    } catch (error) {
      console.error("Error loading prescription data:", error);
      if (error.response) {
        console.error("Backend response:", error.response.data);
      }
      alert("Unable to load prescription data.");
    } finally {
      setLoading(false);
    }
  }, [findCurrentDoctor]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // =========================================================
  // FORM HANDLERS
  // =========================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    setFormData((prev) => {
      const medicines = [...prev.medicines];
      medicines[index] = {
        ...medicines[index],
        [field]: value,
      };
      return {
        ...prev,
        medicines,
      };
    });
  };

  const addMedicine = () => {
    setFormData((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          ...emptyMedicine,
        },
      ],
    }));
  };

  const removeMedicine = (index) => {
    setFormData((prev) => {
      if (prev.medicines.length === 1) {
        return prev;
      }
      return {
        ...prev,
        medicines: prev.medicines.filter((_, i) => i !== index),
      };
    });
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    if (!currentDoctor?.id) {
      alert("Unable to identify the logged-in doctor.");
      return false;
    }
    if (!formData.patientId) {
      alert("Please select a patient.");
      return false;
    }
    if (!formData.diagnosis.trim()) {
      alert("Please enter the diagnosis.");
      return false;
    }
    const invalidMedicine = formData.medicines.some(
      (medicine) =>
        !medicine.medicineName.trim() ||
        !medicine.dosage.trim() ||
        !medicine.frequency.trim() ||
        !medicine.duration.trim()
    );
    if (invalidMedicine) {
      alert(
        "Please complete Medicine Name, Dosage, Frequency and Duration for every medicine."
      );
      return false;
    }
    return true;
  };

  // =========================================================
  // SAVE / UPDATE PRESCRIPTION
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setSaving(true);
    try {
      let response;
      const prescriptionData = {
        ...formData,
        doctorId: currentDoctor.id,
      };
      if (editingId) {
        response = await api.put(
          `/api/prescriptions/${editingId}/doctor/${encodeURIComponent(
            currentDoctor.id
          )}`,
          prescriptionData
        );
      } else {
        response = await api.post(
          `/api/prescriptions/doctor/${encodeURIComponent(
            currentDoctor.id
          )}`,
          prescriptionData
        );
      }
      const savedPrescription = response.data;
      if (editingId) {
        setPrescriptions((prev) =>
          prev.map((item) =>
            item.id === editingId ? savedPrescription : item
          )
        );
        alert("Prescription updated successfully.");
      } else {
        setPrescriptions((prev) => [
          savedPrescription,
          ...prev,
        ]);
        alert("Prescription created successfully.");
      }
      resetForm();
    } catch (error) {
      console.error("Error saving prescription:", error);
      if (error.response) {
        console.error("Backend response:", error.response.data);
      }
      if (
        error.response?.status === 403 ||
        error.response?.status === 404
      ) {
        alert("You can only update prescriptions created by you.");
      } else {
        alert("Failed to save prescription.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE PRESCRIPTION
  // =========================================================

  const handleDelete = async (id) => {
    const prescription = prescriptions.find(
      (item) => item.id === id
    );
    if (
      !currentDoctor?.id ||
      !prescription ||
      String(prescription.doctorId) !==
        String(currentDoctor.id)
    ) {
      alert("You can only delete prescriptions created by you.");
      return;
    }
    const confirmed = window.confirm(
      "Are you sure you want to delete this prescription?"
    );
    if (!confirmed) {
      return;
    }
    try {
      await api.delete(
        `/api/prescriptions/${id}/doctor/${encodeURIComponent(
          currentDoctor.id
        )}`
      );
      setPrescriptions((prev) =>
        prev.filter((item) => item.id !== id)
      );
      alert("Prescription deleted successfully.");
    } catch (error) {
      console.error("Error deleting prescription:", error);
      if (
        error.response?.status === 403 ||
        error.response?.status === 404
      ) {
        alert("You can only delete prescriptions created by you.");
      } else {
        alert("Failed to delete prescription.");
      }
    }
  };

  // =========================================================
  // EDIT PRESCRIPTION
  // =========================================================

  const handleEdit = (prescription) => {
    if (
      !currentDoctor?.id ||
      String(prescription.doctorId) !==
        String(currentDoctor.id)
    ) {
      alert("You can only edit prescriptions created by you.");
      return;
    }
    setEditingId(prescription.id);
    setFormData({
      patientId: prescription.patientId || "",
      doctorId: currentDoctor.id,
      diagnosis: prescription.diagnosis || "",
      instructions: prescription.instructions || "",
      prescriptionDate:
        prescription.prescriptionDate ||
        new Date().toISOString().split("T")[0],
      medicines:
        prescription.medicines?.length > 0
          ? prescription.medicines.map((medicine) => ({
              medicineName: medicine.medicineName || "",
              dosage: medicine.dosage || "",
              frequency: medicine.frequency || "",
              duration: medicine.duration || "",
              instructions: medicine.instructions || "",
            }))
          : [{ ...emptyMedicine }],
    });
    setShowForm(true);
    setViewPrescription(null);
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData({
      ...emptyForm,
      doctorId: currentDoctor?.id || "",
      medicines: [{ ...emptyMedicine }],
    });
    setEditingId(null);
    setShowForm(false);
  };

  // =========================================================
  // PATIENT ID
  // =========================================================

  const getPatientId = (patient) => {
    return patient?.patientId || patient?.id;
  };

  // =========================================================
  // FIND DOCTOR / PATIENT
  // =========================================================

  const getDoctor = (doctorId) => {
    return doctors.find(
      (doctor) => String(doctor.id) === String(doctorId)
    );
  };

  const getPatient = (patientId) => {
    return patients.find(
      (patient) =>
        String(getPatientId(patient)) === String(patientId)
    );
  };

  // =========================================================
  // PATIENT NAME
  // =========================================================

  const getPatientName = (patientId) => {
    const patient = getPatient(patientId);
    if (!patient) {
      return `Patient ${patientId}`;
    }
    if (patient.firstName || patient.lastName) {
      return `${patient.firstName || ""} ${
        patient.lastName || ""
      }`.trim();
    }
    return (
      patient.name ||
      patient.email ||
      `Patient ${patientId}`
    );
  };

  // =========================================================
  // DOCTOR NAME
  // =========================================================

  const getDoctorName = (doctorId) => {
    const doctor = getDoctor(doctorId);
    if (!doctor) {
      return `Doctor ${doctorId}`;
    }
    return (
      doctor.name ||
      doctor.email ||
      `Doctor ${doctorId}`
    );
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredPrescriptions = prescriptions.filter(
    (prescription) => {
      if (
        currentDoctor?.id &&
        String(prescription.doctorId) !==
          String(currentDoctor.id)
      ) {
        return false;
      }
      const patientName = getPatientName(
        prescription.patientId
      ).toLowerCase();
      const doctorName = getDoctorName(
        prescription.doctorId
      ).toLowerCase();
      const diagnosis = (
        prescription.diagnosis || ""
      ).toLowerCase();
      const search = searchTerm.toLowerCase();
      return (
        patientName.includes(search) ||
        doctorName.includes(search) ||
        diagnosis.includes(search) ||
        String(prescription.id).includes(search)
      );
    }
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Prescription Management
          </h2>
          <p className="text-gray-500 mt-1">
            Create and manage prescriptions for your patients.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-700"
          >
            <MdRefresh />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                ...emptyForm,
                doctorId: currentDoctor?.id || "",
                medicines: [{ ...emptyMedicine }],
              });
              setShowForm(true);
            }}
            disabled={!currentDoctor}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-500 hover:bg-lime-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdAdd />
            Create Prescription
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-lime-500">
          <p className="text-sm text-gray-500">
            My Prescriptions
          </p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {prescriptions.length}
          </h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">
            My Patients
          </p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {patients.length}
          </h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">
            Medicines Prescribed
          </p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {prescriptions.reduce(
              (total, prescription) =>
                total +
                (prescription.medicines?.length || 0),
              0
            )}
          </h3>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="Search by patient, doctor, diagnosis or prescription ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
        </div>
      </div>

      {/* PRESCRIPTION TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-semibold text-gray-800">
            My Prescription History
          </h3>
        </div>
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading prescriptions...
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No prescriptions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500 text-sm">
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Patient</th>
                  <th className="px-5 py-4">Doctor</th>
                  <th className="px-5 py-4">Diagnosis</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Medicines</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((prescription) => (
                  <tr
                    key={prescription.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 font-medium text-gray-700">
                      #{prescription.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <MdPerson />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {getPatientName(
                              prescription.patientId
                            )}
                          </p>
                          <p className="text-xs text-gray-400">
                            {prescription.patientId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <MdLocalHospital className="text-lime-600" />
                        <div>
                          <p className="font-medium text-gray-800">
                            {getDoctorName(
                              prescription.doctorId
                            )}
                          </p>
                          <p className="text-xs text-gray-400">
                            {prescription.doctorId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">
                        {prescription.diagnosis ||
                          "Not specified"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {prescription.prescriptionDate}
                    </td>
                    <td className="px-5 py-4">
                      {prescription.medicines?.length || 0}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* VIEW */}
                        <button
                          onClick={() => {
                            if (
                              !currentDoctor?.id ||
                              String(prescription.doctorId) !==
                                String(currentDoctor.id)
                            ) {
                              alert("You can only view prescriptions created by you.");
                              return;
                            }
                            setViewPrescription(
                              prescription
                            );
                          }}
                          title="View"
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <MdVisibility />
                        </button>
                        {/* EDIT */}
                        <button
                          onClick={() =>
                            handleEdit(prescription)
                          }
                          title="Edit"
                          className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                        >
                          <MdEdit />
                        </button>
                        {/* DELETE */}
                        <button
                          onClick={() =>
                            handleDelete(
                              prescription.id
                            )
                          }
                          title="Delete"
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <MdDelete />
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

      {/* =====================================================
          CREATE / EDIT FORM
      ===================================================== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* FORM HEADER */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {editingId
                    ? "Edit Prescription"
                    : "Create Prescription"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Create a prescription for an existing patient.
                </p>
              </div>
              <button
                onClick={resetForm}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <MdClose className="text-xl" />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6"
            >
              {/* PATIENT + DOCTOR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* PATIENT */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient *
                  </label>
                  <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400"
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
                          {getPatientName(patientId)} (
                          {patientId})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* DOCTOR */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor *
                  </label>
                  <input
                    type="text"
                    value={
                      currentDoctor
                        ? `${currentDoctor.name || currentDoctor.email} (${currentDoctor.id})`
                        : "Loading doctor..."
                    }
                    disabled
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* DIAGNOSIS + DATE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis *
                  </label>
                  <input
                    type="text"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    placeholder="Enter diagnosis"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescription Date
                  </label>
                  <input
                    type="date"
                    name="prescriptionDate"
                    value={formData.prescriptionDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
              </div>

              {/* MEDICINES */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Medicines
                    </h4>
                    <p className="text-sm text-gray-500">
                      Add medicines prescribed to the patient.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addMedicine}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-lime-50 text-lime-700 hover:bg-lime-100"
                  >
                    <MdAdd />
                    Add Medicine
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.medicines.map(
                    (medicine, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="font-medium text-gray-700">
                            Medicine {index + 1}
                          </h5>
                          {formData.medicines.length >
                            1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeMedicine(index)
                              }
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <MdDelete />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* MEDICINE NAME */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Medicine Name *
                            </label>
                            <input
                              type="text"
                              value={
                                medicine.medicineName
                              }
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "medicineName",
                                  e.target.value
                                )
                              }
                              placeholder="Paracetamol"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white"
                            />
                          </div>
                          {/* DOSAGE */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Dosage *
                            </label>
                            <input
                              type="text"
                              value={medicine.dosage}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "dosage",
                                  e.target.value
                                )
                              }
                              placeholder="500 mg"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white"
                            />
                          </div>
                          {/* FREQUENCY */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Frequency *
                            </label>
                            <input
                              type="text"
                              value={
                                medicine.frequency
                              }
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "frequency",
                                  e.target.value
                                )
                              }
                              placeholder="Twice daily"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white"
                            />
                          </div>
                          {/* DURATION */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Duration *
                            </label>
                            <input
                              type="text"
                              value={medicine.duration}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "duration",
                                  e.target.value
                                )
                              }
                              placeholder="5 days"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white"
                            />
                          </div>
                        </div>
                        {/* MEDICINE INSTRUCTIONS */}
                        <div className="mt-4">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Medicine Instructions
                          </label>
                          <input
                            type="text"
                            value={
                              medicine.instructions
                            }
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "instructions",
                                e.target.value
                              )
                            }
                            placeholder="After food"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white"
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* GENERAL INSTRUCTIONS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  General Instructions
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Enter additional instructions for the patient..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-lime-500 hover:bg-lime-600 text-white font-medium disabled:opacity-60"
                >
                  <MdSave />
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Prescription"
                    : "Save Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW PRESCRIPTION
      ===================================================== */}
      {viewPrescription && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Prescription #{viewPrescription.id}
                </h3>
                <p className="text-sm text-gray-500">
                  {viewPrescription.prescriptionDate}
                </p>
              </div>
              <button
                onClick={() =>
                  setViewPrescription(null)
                }
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* DETAILS */}
            <div className="p-6 space-y-6">
              {/* PATIENT / DOCTOR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-purple-600">
                    Patient
                  </p>
                  <h4 className="font-semibold text-gray-800 mt-1">
                    {getPatientName(
                      viewPrescription.patientId
                    )}
                  </h4>
                  <p className="text-sm text-gray-500">
                    ID: {viewPrescription.patientId}
                  </p>
                </div>
                <div className="bg-lime-50 rounded-xl p-4">
                  <p className="text-sm text-lime-700">
                    Doctor
                  </p>
                  <h4 className="font-semibold text-gray-800 mt-1">
                    {getDoctorName(
                      viewPrescription.doctorId
                    )}
                  </h4>
                  <p className="text-sm text-gray-500">
                    ID: {viewPrescription.doctorId}
                  </p>
                </div>
              </div>

              {/* DIAGNOSIS */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Diagnosis
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {viewPrescription.diagnosis ||
                    "Not specified"}
                </div>
              </div>

              {/* MEDICINES */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Medicines
                </h4>
                {viewPrescription.medicines?.length >
                0 ? (
                  <div className="space-y-3">
                    {viewPrescription.medicines.map(
                      (medicine, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-xl p-4"
                        >
                          <div className="flex justify-between">
                            <h5 className="font-semibold text-gray-800">
                              {index + 1}.{" "}
                              {medicine.medicineName}
                            </h5>
                            <span className="text-sm text-lime-700 bg-lime-50 px-2 py-1 rounded">
                              {medicine.duration}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-sm">
                            <div>
                              <span className="text-gray-500">
                                Dosage:
                              </span>{" "}
                              {medicine.dosage}
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Frequency:
                              </span>{" "}
                              {medicine.frequency}
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Duration:
                              </span>{" "}
                              {medicine.duration}
                            </div>
                          </div>
                          {medicine.instructions && (
                            <p className="text-sm text-gray-600 mt-3">
                              <strong>
                                Instructions:
                              </strong>{" "}
                              {medicine.instructions}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-500">
                    No medicines listed.
                  </div>
                )}
              </div>

              {/* GENERAL INSTRUCTIONS */}
              {viewPrescription.instructions && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    General Instructions
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                    {viewPrescription.instructions}
                  </div>
                </div>
              )}

              {/* CLOSE */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() =>
                    setViewPrescription(null)
                  }
                  className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescription;