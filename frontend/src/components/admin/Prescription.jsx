import React, { useEffect, useState } from "react";
import {
  MdDelete,
  MdLocalHospital,
  MdPerson,
  MdSearch,
  MdRefresh,
  MdClose,
  MdVisibility,
} from "react-icons/md";
import api from "../../api/api";

const Prescription = () => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewPrescription, setViewPrescription] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // =========================================================
  // LOAD DOCTORS, PATIENTS AND PRESCRIPTIONS
  // =========================================================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      const [
        doctorResponse,
        patientResponse,
        prescriptionResponse,
      ] = await Promise.all([
        api.get("/api/doctors"),
        api.get("/api/patients"),
        api.get("/api/prescriptions"),
      ]);

      setDoctors(doctorResponse.data || []);
      setPatients(patientResponse.data || []);
      setPrescriptions(prescriptionResponse.data || []);
    } catch (error) {
      console.error("Error loading prescription data:", error);
      alert("Unable to load prescription data.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DELETE PRESCRIPTION
  // =========================================================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this prescription?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/api/prescriptions/${id}`);

      setPrescriptions((prev) =>
        prev.filter((item) => item.id !== id)
      );

      alert("Prescription deleted successfully.");
    } catch (error) {
      console.error("Error deleting prescription:", error);
      alert("Failed to delete prescription.");
    }
  };

  // =========================================================
  // FIND DOCTOR / PATIENT DETAILS
  // =========================================================
  const getDoctor = (doctorId) => {
    return doctors.find(
      (doctor) => String(doctor.id) === String(doctorId)
    );
  };

  const doctorSafePatientId = (patient) => {
    return patient?.patientId || patient?.id;
  };

  const getPatient = (patientId) => {
    return patients.find(
      (patient) =>
        String(doctorSafePatientId(patient)) ===
        String(patientId)
    );
  };

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
            View and manage prescriptions created by doctors.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-700"
        >
          <MdRefresh />
          Refresh
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-lime-500">
          <p className="text-sm text-gray-500">
            Total Prescriptions
          </p>

          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {prescriptions.length}
          </h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">
            Doctors
          </p>

          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {doctors.length}
          </h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">
            Patients
          </p>

          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {patients.length}
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
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
        </div>
      </div>

      {/* PRESCRIPTION TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-semibold text-gray-800">
            Prescription History
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Prescriptions created by doctors for patients.
          </p>
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
                  <th className="px-5 py-4">
                    ID
                  </th>

                  <th className="px-5 py-4">
                    Patient
                  </th>

                  <th className="px-5 py-4">
                    Doctor
                  </th>

                  <th className="px-5 py-4">
                    Diagnosis
                  </th>

                  <th className="px-5 py-4">
                    Date
                  </th>

                  <th className="px-5 py-4">
                    Medicines
                  </th>

                  <th className="px-5 py-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPrescriptions.map(
                  (prescription) => (
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
                            onClick={() =>
                              setViewPrescription(
                                prescription
                              )
                            }
                            title="View"
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                          >
                            <MdVisibility />
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
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

                {viewPrescription.medicines?.length > 0 ? (
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