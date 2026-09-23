import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Calendar, 
  Clock, 
  User, 
  Filter,
  Save,
  X
} from 'lucide-react';

import { 
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor
} from "../../api/doctorApi";

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [viewSchedule, setViewSchedule] = useState(null);

  // Sample initial data (NOT USED NOW - BACKEND DATA USED)
  // const initialDoctors = [];

  // ---------------------- BACKEND: FETCH DOCTORS ----------------------
  const loadDoctors = async () => {
    try {
      const response = await getDoctors();
      setDoctors(response.data);
      setFilteredDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  // ------------------ FRONTEND FILTERING ------------------
  const filterDoctors = useCallback(() => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialization === selectedSpecialization);
    }

    setFilteredDoctors(filtered);
  }, [doctors, searchTerm, selectedSpecialization]);

  useEffect(() => {
    filterDoctors();
  }, [filterDoctors]);

  const specializations = [
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'Psychiatry',
    'General Medicine'
  ];

  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    email: '',
    phone: '',
    availability: [],
    consultationHours: '',
    status: 'active'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvailabilityChange = (day) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  };

  // ---------------------- NEW: AUTO-GENERATE DOCTOR ID ----------------------
  const generateDoctorId = (doctors) => {
    if (!doctors || doctors.length === 0) return "DOC001";

    const numbers = doctors
      .map(doc => parseInt(doc.id.replace("DOC", ""), 10))
      .filter(num => !isNaN(num));

    const next = Math.max(...numbers) + 1;
    return `DOC${String(next).padStart(3, "0")}`;
  };

  // ---------------------- NEW: HANDLE ADD ----------------------
  const handleAdd = () => {
    const newId = generateDoctorId(doctors);

    setFormData({
      id: newId,
      name: "",
      specialization: "",
      email: "",
      phone: "",
      availability: [],
      consultationHours: "",
      status: "active"
    });

    setEditingDoctor(null);
    setIsModalOpen(true);
  };

  // AUTO-ID NOT NEEDED IF BACKEND GENERATES
  // const generateDoctorId_OLD = () => {
  //   const lastId = doctors.length > 0 ? parseInt(doctors[doctors.length - 1].id.slice(3)) : 0;
  //   return `DOC${(lastId + 1).toString().padStart(3, '0')}`;
  // };

  // ---------------------- SUBMIT (ADD + EDIT) ----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingDoctor) {
        // ----- UPDATE BACKEND -----
        await updateDoctor(editingDoctor.id, formData);

      } else {
        // ----- CREATE BACKEND -----
        await createDoctor(formData);
      }

      await loadDoctors();
      handleCloseModal();

    } catch (error) {
      console.error("Error saving doctor:", error);
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData(doctor);
    setIsModalOpen(true);
  };

  // ------------------------------ DELETE ------------------------------
  const handleDelete = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await deleteDoctor(doctorId);
        loadDoctors();
      } catch (error) {
        console.error("Error deleting doctor:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
    setFormData({
      name: '',
      specialization: '',
      email: '',
      phone: '',
      availability: [],
      consultationHours: '',
      status: 'active'
    });
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="min-h-screen bg-gray-50 p-0">
      {/* Header */}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search doctors by name, specialization, or ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter by Specialization */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 h-4 w-4" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
              >
                <option value="all">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Doctor Button */}
          <button
            onClick={handleAdd}
            className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Doctor
          </button>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">

            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{doctor.name}</h3>
                <p className="text-lime-600 font-medium">{doctor.specialization}</p>
              </div>
              <span className="bg-lime-100 text-lime-800 text-xs px-2 py-1 rounded-full font-medium">
                {doctor.id}
              </span>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span className="text-sm">{doctor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{doctor.phone}</span>
              </div>
            </div>

            {/* Availability */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Availability</h4>
              <div className="flex flex-wrap gap-1">
                {doctor.availability.map(day => (
                  <span
                    key={day}
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>

            {/* Consultation Hours */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Consultation Hours</h4>
              <p className="text-sm text-gray-600">{doctor.consultationHours}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(doctor)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>

              <button
                onClick={() => setViewSchedule(doctor)}
                className="flex-1 bg-lime-500 hover:bg-lime-600 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                Schedule
              </button>

              <button
                onClick={() => handleDelete(doctor.id)}
                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <User className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No doctors found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Add/Edit Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-height-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    //rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                    placeholder="Dr. John Smith"
                  />
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization *
                  </label>
                  <select
                    name="specialization"
                    required
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                {/* Email */}
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
                    placeholder="doctor@hospital.com"
                  />
                </div>

                {/* Phone */}
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

                {/* Consultation Hours */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Hours *
                  </label>
                  <input
                    type="text"
                    name="consultationHours"
                    required
                    value={formData.consultationHours}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                    placeholder="9:00 AM - 5:00 PM"
                  />
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Availability *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {daysOfWeek.map(day => (
                    <label key={day} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.availability.includes(day)}
                        onChange={() => handleAvailabilityChange(day)}
                        className="rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                      />
                      <span className="text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
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

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-lime-500 hover:bg-lime-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Schedule View Modal */}
      {viewSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {`${viewSchedule.name}'s Schedule`}
                </h2>
                  <p className="text-lime-600 font-medium">{viewSchedule.specialization}</p>
                </div>
                <button
                  onClick={() => setViewSchedule(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Availability</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewSchedule.availability.map(day => (
                      <span
                        key={day}
                        className="bg-lime-100 text-lime-800 px-3 py-2 rounded-lg font-medium"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Consultation Hours</h3>
                  <p className="text-gray-600 text-lg">{viewSchedule.consultationHours}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Upcoming Appointments</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-500">Appointment scheduling feature coming soon...</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewSchedule(null)}
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

export default DoctorManagement;
