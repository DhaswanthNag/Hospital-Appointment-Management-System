// PatientManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  // Phone,
  // Mail,
  Calendar,
  FileText,
  Filter,
  Save,
  X,
  // Clock,
  Stethoscope
} from 'lucide-react';

const API_URL = 'http://localhost:8080/api/patients';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMedicalHistoryOpen, setIsMedicalHistoryOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // New: medical form state inside modal for add/edit record
  const [medicalForm, setMedicalForm] = useState({
    date: '',
    doctor: '',
    diagnosis: '',
    treatment: '',
    notes: ''
  });
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch patients from backend
  useEffect(() => {
    fetchPatients();
  }, []);

  const filterPatients = () => {
    let filtered = patients;
    if (searchTerm) {
      filtered = filtered.filter(patient => {
        const searchLower = searchTerm.toLowerCase();
        switch (searchType) {
          case 'name':
            return `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower);
          case 'id':
            return (patient.id || '').toLowerCase().includes(searchLower);
          case 'phone':
            return (patient.phone || '').toLowerCase().includes(searchLower);
          case 'all':
          default:
            return (
              (`${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower)) ||
              ((patient.id || '').toLowerCase().includes(searchLower)) ||
              ((patient.phone || '').toLowerCase().includes(searchLower)) ||
              ((patient.email || '').toLowerCase().includes(searchLower))
            );
        }
      });
    }
    setFilteredPatients(filtered);
  };

  useEffect(() => {
    filterPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, searchType, patients]);

  const fetchPatients = async () => {
    try {
      const res = await axios.get(API_URL);
      setPatients(res.data || []);
      setFilteredPatients(res.data || []);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    insuranceProvider: '',
    insuranceId: '',
    status: 'active'
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // const generatePatientId = () => {
  //   // Handle case where patients array is empty or invalid
  //   if (!patients || patients.length === 0) return `PAT001`;
    
  //   // Find the highest PAT number
  //   const patNumbers = patients
  //     .map(p => p.id)
  //     .filter(id => id && id.startsWith('PAT'))
  //     .map(id => {
  //       const numStr = id.substring(3);
  //       return parseInt(numStr, 10) || 0;
  //     });
    
  //   const maxNumber = patNumbers.length > 0 ? Math.max(...patNumbers) : 0;
  //   return `PAT${(maxNumber + 1).toString().padStart(3, '0')}`;
  // };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '—';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate)) return '—';
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        // Update existing patient - use patientId (string) not JPA ID (Long)
        await axios.put(`${API_URL}/${editingPatient.id}`, {
          ...formData,
          patientId: editingPatient.id, // Use patientId for updates
          registrationDate: editingPatient.registrationDate,
          medicalHistory: editingPatient.medicalHistory || []
        });
      } else {
        // Add new patient - backend will generate the patientId
        await axios.post(API_URL, {
          ...formData,
          // Remove id generation - let backend handle it
          registrationDate: new Date().toISOString().split('T')[0],
          medicalHistory: []
        });
      }
      await fetchPatients();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Error saving patient. See console for details.');
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData(patient);
    setIsModalOpen(true);
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      try {
        await axios.delete(`${API_URL}/${patientId}`);
        await fetchPatients();
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Error deleting patient. See console for details.');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      emergencyContact: '',
      bloodGroup: '',
      insuranceProvider: '',
      insuranceId: '',
      status: 'active'
    });
  };

  // -------------------------
  // Medical history functions
  // -------------------------

  // Fetch medical history for patient and open modal
  const handleViewMedicalHistory = async (patient) => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${API_URL}/${patient.id}/medical-history`);
      // API returns a list of records (may be empty)
      setSelectedPatient({ ...patient, medicalHistory: res.data || [] });
      setIsMedicalHistoryOpen(true);
    } catch (error) {
      console.error('Error fetching medical history:', error);
      // Fallback: fetch the patient fully (GET /api/patients/{id}) and read .medicalHistory
      try {
        const pRes = await axios.get(`${API_URL}/${patient.id}`);
        setSelectedPatient({ ...pRes.data, medicalHistory: pRes.data.medicalHistory || [] });
        setIsMedicalHistoryOpen(true);
      } catch (err2) {
        console.error('Fallback fetch patient failed:', err2);
        setSelectedPatient({ ...patient, medicalHistory: [] });
        setIsMedicalHistoryOpen(true);
      }
    } finally {
      setLoadingHistory(false);
    }
    // reset any medical form edits
    setMedicalForm({ date: '', doctor: '', diagnosis: '', treatment: '', notes: '' });
    setEditingRecordId(null);
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Add new medical history record
  const addMedicalHistoryRecord = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const payload = { ...medicalForm };

    // ensure date is set
    if (!payload.date) payload.date = new Date().toISOString().split('T')[0];

    try {
      // Preferred API (controller provides): POST /api/patients/{id}/medical-history
      // const res = await axios.post(`${API_URL}/${selectedPatient.id}/medical-history`, payload);
      // If successful, reload medical history
      await handleViewMedicalHistory(selectedPatient);
    } catch (error) {
      console.warn('POST /medical-history failed, trying fallback merge via patient PUT', error);
      // Fallback: fetch full patient object, push record into medicalHistory array, then PUT the patient (cascade)
      try {
        const pRes = await axios.get(`${API_URL}/${selectedPatient.id}`);
        const patientObject = pRes.data;
        const mh = patientObject.medicalHistory ? [...patientObject.medicalHistory] : [];
        // ensure new record has no id (JPA will create a new one) or temporary negative id
        mh.push(payload);
        patientObject.medicalHistory = mh;
        await axios.put(`${API_URL}/${selectedPatient.id}`, patientObject);
        await fetchPatients();
        await handleViewMedicalHistory(patientObject);
      } catch (err2) {
        console.error('Fallback merge failed:', err2);
        alert('Failed to add medical history. See console for details.');
      }
    } finally {
      setMedicalForm({ date: '', doctor: '', diagnosis: '', treatment: '', notes: '' });
      setEditingRecordId(null);
    }
  };

  // Start editing an existing record (populates medical form)
  const startEditRecord = (record) => {
    setEditingRecordId(record.id || null); // might be undefined if not persisted yet
    setMedicalForm({
      date: record.date || '',
      doctor: record.doctor || '',
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      notes: record.notes || ''
    });
    // scroll to form (if needed) — the modal contains the form at bottom; the UI will show it
  };

  // Update an existing medical history record
  const updateMedicalHistoryRecord = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const payload = { ...medicalForm };

    // If backend exposes PUT endpoint for single record, attempt it first
    if (editingRecordId) {
      try {
        await axios.put(`${API_URL}/${selectedPatient.id}/medical-history/${editingRecordId}`, payload);
        await handleViewMedicalHistory(selectedPatient);
        setMedicalForm({ date: '', doctor: '', diagnosis: '', treatment: '', notes: '' });
        setEditingRecordId(null);
        return;
      } catch (err) {
        console.warn('PUT /medical-history/{id} failed — trying fallback patient PUT', err);
      }
    }

    // Fallback: fetch patient, find record by id (or match by date+doctor if id missing), update and PUT patient
    try {
      const pRes = await axios.get(`${API_URL}/${selectedPatient.id}`);
      const patientObject = pRes.data;
      const mh = (patientObject.medicalHistory || []).map(r => {
        if (editingRecordId && r.id === editingRecordId) {
          return { ...r, ...payload };
        }
        // if editingRecordId missing (record created client-side), try to find by unique combination
        if (!editingRecordId && r.date === payload.date && r.doctor === payload.doctor) {
          return { ...r, ...payload };
        }
        return r;
      });
      patientObject.medicalHistory = mh;
      await axios.put(`${API_URL}/${selectedPatient.id}`, patientObject);
      await fetchPatients();
      await handleViewMedicalHistory(patientObject);
      setMedicalForm({ date: '', doctor: '', diagnosis: '', treatment: '', notes: '' });
      setEditingRecordId(null);
    } catch (err2) {
      console.error('Failed to update medical history record via fallback:', err2);
      alert('Failed to update medical history. See console for details.');
    }
  };

  // Delete a medical history record
  const deleteMedicalHistoryRecord = async (recordId) => {
    if (!selectedPatient) return;
    if (!window.confirm('Delete this visit record?')) return;

    // Try DELETE endpoint first
    if (recordId) {
      try {
        await axios.delete(`${API_URL}/${selectedPatient.id}/medical-history/${recordId}`);
        await handleViewMedicalHistory(selectedPatient);
        return;
      } catch (err) {
        console.warn('DELETE /medical-history/{id} failed — trying fallback patient PUT', err);
      }
    }

    // Fallback: fetch patient, remove record from array, PUT patient
    try {
      const pRes = await axios.get(`${API_URL}/${selectedPatient.id}`);
      const patientObject = pRes.data;
      const filtered = (patientObject.medicalHistory || []).filter(r => {
        // if recordId available compare; otherwise use date+doctor as a fallback unique key
        if (recordId && r.id) return r.id !== recordId;
        return !(r.date === medicalForm.date && r.doctor === medicalForm.doctor);
      });
      patientObject.medicalHistory = filtered;
      await axios.put(`${API_URL}/${selectedPatient.id}`, patientObject);
      await fetchPatients();
      await handleViewMedicalHistory(patientObject);
    } catch (err2) {
      console.error('Failed to delete medical history record via fallback:', err2);
      alert('Failed to delete record. See console for details.');
    }
  };

  // -------------------------
  // UI Rendering
  // -------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
            {/* Search Type */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 h-5 w-5" />
              <select
                aria-label="Search type"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent text-sm"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="all">All Fields</option>
                <option value="name">Name</option>
                <option value="id">Patient ID</option>
                <option value="phone">Phone</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={`Search patients by ${searchType === 'all' ? 'name, ID, or phone' : searchType}...`}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Add Patient Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 lg:mt-0 bg-lime-500 hover:bg-lime-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm"
            aria-haspopup="dialog"
          >
            <Plus className="h-4 w-4" />
            Add Patient
          </button>
        </div>
      </div>

      {/* Patients Table / Cards */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Desktop / Tablet Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Personal Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Insurance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap align-middle">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-lime-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-lime-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{patient.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-middle">
                    <div className="text-sm text-gray-900">{patient.phone}</div>
                    <div className="text-sm text-gray-500">{patient.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-middle">
                    <div className="text-sm text-gray-900">
                      {calculateAge(patient.dateOfBirth)} years, {patient.gender}
                    </div>
                    <div className="text-sm text-gray-500">{patient.bloodGroup}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-middle">
                    <div className="text-sm text-gray-900 truncate max-w-[160px]">{patient.insuranceProvider}</div>
                    <div className="text-sm text-gray-500">{patient.insuranceId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-middle">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      patient.status === 'active'
                        ? 'bg-lime-100 text-lime-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium align-middle">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewMedicalHistory(patient)}
                        className="text-lime-600 hover:text-lime-900 flex items-center gap-1 text-sm"
                      >
                        <FileText className="h-4 w-4" />
                        History
                      </button>
                      <button
                        onClick={() => handleEdit(patient)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-sm"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(patient.patientId)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile / Small screens: card list */}
        <div className="md:hidden">
          <div className="divide-y divide-gray-200">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-12 w-12 bg-lime-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-lime-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{patient.firstName} {patient.lastName}</div>
                    <div className="text-xs text-gray-500">{patient.id} • {patient.phone}</div>
                    <div className="text-xs text-gray-500">{patient.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    patient.status === 'active'
                      ? 'bg-lime-100 text-lime-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {patient.status}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleViewMedicalHistory(patient)}
                      className="text-lime-600 hover:text-lime-900 flex items-center gap-1 text-sm"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(patient)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-sm"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(patient.patientId)}
                      className="text-red-600 hover:text-red-900 flex items-center gap-1 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No Results */}
        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <User className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No patients found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or add a new patient</p>
          </div>
        )}
      </div>

      {/* Add/Edit Patient Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4 md:m-0">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingPatient ? 'Edit Patient' : 'Register New Patient'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    {genders.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                {/* Contact Information */}
                <div className="md:col-span-2 mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                    placeholder="patient@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                    placeholder="+1-555-0123"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                    placeholder="123 Main St, City, State, ZIP"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                    placeholder="Name (Relationship) Phone"
                  />
                </div>

                {/* Insurance Information */}
                <div className="md:col-span-2 mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Insurance Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                    placeholder="Insurance Company Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance ID
                  </label>
                  <input
                    type="text"
                    name="insuranceId"
                    value={formData.insuranceId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                    placeholder="Policy Number"
                  />
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full sm:w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-1/2 bg-lime-500 hover:bg-lime-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {editingPatient ? 'Update Patient' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medical History Modal */}
      {isMedicalHistoryOpen && selectedPatient && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => { setIsMedicalHistoryOpen(false); setSelectedPatient(null); }} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4 md:m-0">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Medical History - {selectedPatient.firstName} {selectedPatient.lastName}
                  </h2>
                  <p className="text-lime-600 font-medium">{selectedPatient.id}</p>
                </div>
                <button
                  onClick={() => { setIsMedicalHistoryOpen(false); setSelectedPatient(null); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close medical history"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6">
              {/* Patient Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Age:</span>
                    <p className="text-gray-900">{calculateAge(selectedPatient.dateOfBirth)} years</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Gender:</span>
                    <p className="text-gray-900">{selectedPatient.gender}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Blood Group:</span>
                    <p className="text-gray-900">{selectedPatient.bloodGroup || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Registered:</span>
                    <p className="text-gray-900">{formatDate(selectedPatient.registrationDate)}</p>
                  </div>
                </div>
              </div>

              {/* Medical History Records */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Visit Records</h3>

                {/* Loading indicator */}
                {loadingHistory && <p className="text-sm text-gray-500">Loading...</p>}

                {(!selectedPatient.medicalHistory || selectedPatient.medicalHistory.length === 0) ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No medical history records found</p>
                  </div>
                ) : (
                  selectedPatient.medicalHistory.map((record, index) => (
                    <div key={record.id || index} className="border border-gray-200 rounded-lg p-4 hover:border-lime-300 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-lime-600" />
                          <span className="font-medium text-gray-900">{formatDate(record.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Stethoscope className="h-4 w-4" />
                          <span>{record.doctor}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Diagnosis:</span>
                          <p className="text-gray-900 mt-1">{record.diagnosis}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Treatment:</span>
                          <p className="text-gray-900 mt-1">{record.treatment}</p>
                        </div>
                      </div>

                      {record.notes && (
                        <div className="mt-3">
                          <span className="font-medium text-gray-700 text-sm">Notes:</span>
                          <p className="text-gray-900 text-sm mt-1">{record.notes}</p>
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => startEditRecord(record)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-sm"
                        >
                          <Edit2 className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={() => deleteMedicalHistoryRecord(record.id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1 text-sm"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add / Edit Form for Medical History */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{editingRecordId ? 'Edit Visit' : 'Add New Visit'}</h3>
                <form onSubmit={editingRecordId ? updateMedicalHistoryRecord : addMedicalHistoryRecord} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={medicalForm.date}
                      onChange={(e) => setMedicalForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                    <input
                      type="text"
                      value={medicalForm.doctor}
                      onChange={(e) => setMedicalForm(prev => ({ ...prev, doctor: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      placeholder="Dr. Smith"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                    <input
                      type="text"
                      value={medicalForm.diagnosis}
                      onChange={(e) => setMedicalForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      placeholder="Diagnosis details"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Treatment</label>
                    <input
                      type="text"
                      value={medicalForm.treatment}
                      onChange={(e) => setMedicalForm(prev => ({ ...prev, treatment: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      placeholder="Treatment provided"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={medicalForm.notes}
                      onChange={(e) => setMedicalForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      placeholder="Optional notes"
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2 flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => { setMedicalForm({ date: '', doctor: '', diagnosis: '', treatment: '', notes: '' }); setEditingRecordId(null); }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-lime-500 hover:bg-lime-600 text-white py-2 px-6 rounded-lg flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {editingRecordId ? 'Update Visit' : 'Add Visit'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => { setIsMedicalHistoryOpen(false); setSelectedPatient(null); }}
                  className="bg-lime-500 hover:bg-lime-600 text-white py-2 px-6 rounded-lg font-medium transition-colors"
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

export default PatientManagement;