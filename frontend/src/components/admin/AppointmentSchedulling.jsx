import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  // User, 
  Calendar, 
  Clock, 
  // Mail,
  // Phone,
  Stethoscope,
  // Filter,
  Save,
  X,
  // CheckCircle,
  // XCircle,
  Send,
  Building,
  Clock as ClockIcon,
  UserCheck
} from 'lucide-react';

const API_BASE = 'http://localhost:8080/api/appointments'; // change to full URL if not proxied
const DOCTORS_API = 'http://localhost:8080/api/doctors'; // Backend API for doctors
const PATIENTS_API = 'http://localhost:8080/api/patients'; // Backend API for patients

const AppointmentScheduling = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]); // Will be fetched from backend
  const [patients, setPatients] = useState([]); // Will be fetched from backend
  const [departments, setDepartments] = useState([]); // Will be derived from doctors
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // initial appointments -- kept as fallback
  const initialAppointments = [
    {
      id: 'APT001',
      _dbId: null,
      patientId: 'PAT001',
      patientName: 'John Doe',
      doctorId: 'DOC001',
      doctorName: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      date: '2024-03-20',
      time: '10:00',
      duration: 30,
      type: 'Consultation',
      reason: 'Heart checkup and follow-up',
      status: 'pending', // Changed to pending by default, requires doctor confirmation
      statusHistory: ['pending'],
      bookedAt: '2024-03-15T10:30:00',
      notes: 'Patient has history of hypertension',
      requiresDoctorConfirmation: true // New field to track if doctor confirmation is needed
    },
    {
      id: 'APT002',
      _dbId: null,
      patientId: 'PAT002',
      patientName: 'Maria Garcia',
      doctorId: 'DOC003',
      doctorName: 'Dr. Emily Wilson',
      department: 'Pediatrics',
      date: '2024-03-21',
      time: '14:30',
      duration: 45,
      type: 'Checkup',
      reason: 'Child annual checkup',
      status: 'pending', // Changed to pending by default, requires doctor confirmation
      statusHistory: ['pending'],
      bookedAt: '2024-03-16T09:15:00',
      notes: '',
      requiresDoctorConfirmation: true // New field to track if doctor confirmation is needed
    },
    {
      id: 'APT003',
      _dbId: null,
      patientId: 'PAT003',
      patientName: 'Robert Smith',
      doctorId: 'DOC002',
      doctorName: 'Dr. Michael Chen',
      department: 'Neurology',
      date: '2024-03-22',
      time: '11:15',
      duration: 60,
      type: 'Consultation',
      reason: 'Migraine treatment follow-up',
      status: 'pending', // Changed to pending by default, requires doctor confirmation
      statusHistory: ['pending'],
      bookedAt: '2024-03-14T16:45:00',
      notes: 'Patient requested morning appointment',
      requiresDoctorConfirmation: true // New field to track if doctor confirmation is needed
    }
  ];

  const appointmentTypes = ['Consultation', 'Checkup', 'Follow-up', 'Emergency', 'Surgery', 'Test'];
  const statusOptions = ['pending', 'confirmed', 'cancelled', 'completed'];

  useEffect(() => {
    // Fetch all necessary data
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchAppointmentsFromBackend(),
          fetchDoctorsFromBackend(),
          fetchPatientsFromBackend()
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, filterDoctor, filterDepartment, appointments]);

  // Fetch doctors from backend (similar to DoctorManagement)
  const fetchDoctorsFromBackend = async () => {
    try {
      const res = await fetch(DOCTORS_API);
      if (!res.ok) throw new Error('Failed to fetch doctors');
      const data = await res.json();
      
      console.log('Fetched doctors from backend:', data); // Debug log
      
      // Map backend doctor data to match expected format
      const mappedDoctors = data.map(doctor => ({
        id: doctor.id, // Doctor ID is used directly from backend
        name: doctor.name,
        specialization: doctor.specialization,
        department: doctor.specialization, // Using specialization as department
        email: doctor.email,
        phone: doctor.phone,
        availability: doctor.availability || [],
        consultationHours: doctor.consultationHours || '',
        status: doctor.status || 'active'
      }));
      
      setDoctors(mappedDoctors);
      
      // Extract unique departments from doctors
      const uniqueDepartments = [...new Set(mappedDoctors.map(doc => doc.specialization))];
      setDepartments(uniqueDepartments);
      
    } catch (err) {
      console.warn('Could not fetch doctors from backend, using empty array.', err);
      setDoctors([]);
      setDepartments([]);
    }
  };

  // Fetch patients from backend (similar to PatientManagement)
  const fetchPatientsFromBackend = async () => {
    try {
      const res = await fetch(PATIENTS_API);
      if (!res.ok) throw new Error('Failed to fetch patients');
      const data = await res.json();
      
      console.log('Fetched patients from backend:', data); // Debug log
      
      // Map backend patient data to match expected format
      const mappedPatients = data.map(patient => ({
        id: patient.patientId, // Use patientId as id for frontend compatibility
        _dbId: patient.id, // Store the database ID separately
        name: `${patient.firstName} ${patient.lastName}`,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        address: patient.address,
        emergencyContact: patient.emergencyContact,
        bloodGroup: patient.bloodGroup,
        insuranceProvider: patient.insuranceProvider,
        insuranceId: patient.insuranceId,
        status: patient.status || 'active'
      }));
      
      setPatients(mappedPatients);
      
    } catch (err) {
      console.warn('Could not fetch patients from backend, using empty array.', err);
      setPatients([]);
    }
  };

  const mapBackendToUI = (backendObj) => {
    // backend: { id: dbUuid, appointmentId: 'APT001', ... }
    return {
      id: backendObj.appointmentId || backendObj.id, // UI expects APT001 as id
      _dbId: backendObj.id || null, // store DB id for update/delete
      patientId: backendObj.patientId || '',
      patientName: backendObj.patientName || '',
      doctorId: backendObj.doctorId || '',
      doctorName: backendObj.doctorName || '',
      department: backendObj.department || '',
      date: backendObj.date || '',
      time: backendObj.time || '',
      duration: backendObj.duration || 30,
      type: backendObj.type || 'Consultation',
      reason: backendObj.reason || '',
      status: backendObj.status || 'pending', // Default to pending for new appointments
      statusHistory: backendObj.statusHistory || ['pending'],
      bookedAt: backendObj.bookedAt || '',
      notes: backendObj.notes || '',
      requiresDoctorConfirmation: backendObj.requiresDoctorConfirmation !== undefined ? backendObj.requiresDoctorConfirmation : true
    };
  };

  const fetchAppointmentsFromBackend = async () => {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      // map response to UI shape
      const mapped = data.map(mapBackendToUI);
      setAppointments(mapped);
      setFilteredAppointments(mapped);
    } catch (err) {
      // fallback to local sample data if backend not reachable
      console.warn('Could not fetch appointments from backend, using local sample data.', err);
      setAppointments(initialAppointments);
      setFilteredAppointments(initialAppointments);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        (apt.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (apt.doctorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (apt.id || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    if (filterDoctor !== 'all') {
      filtered = filtered.filter(apt => apt.doctorId === filterDoctor);
    }

    if (filterDepartment !== 'all') {
      filtered = filtered.filter(apt => apt.department === filterDepartment);
    }

    setFilteredAppointments(filtered);
  };

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    department: '',
    date: '',
    time: '',
    duration: 30,
    type: 'Consultation',
    reason: '',
    notes: '',
    status: 'pending' // New appointments are always pending, requires doctor confirmation
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update department when doctor is selected
    if (name === 'doctorId') {
      const selectedDoctor = doctors.find(doc => doc.id === value);
      if (selectedDoctor) {
        setFormData(prev => ({
          ...prev,
          doctorId: value,
          department: selectedDoctor.specialization // Using specialization as department
        }));
      }
    }
  };

  const generateAppointmentId = () => {
    const lastId = appointments.length > 0 ? parseInt(appointments[appointments.length - 1]?.id?.slice(3) || '0') : 0;
    return `APT${(lastId + 1).toString().padStart(3, '0')}`;
  };

  const buildRequestBodyFromForm = (fd) => {
    // backend expects date/time strings (yyyy-mm-dd, HH:mm)
    const selectedPatient = patients.find(p => p.id === fd.patientId);
    const selectedDoctor = doctors.find(d => d.id === fd.doctorId);
    
    return {
      patientId: fd.patientId,
      patientName: selectedPatient?.name || fd.patientName || '',
      doctorId: fd.doctorId,
      doctorName: selectedDoctor?.name || fd.doctorName || '',
      department: fd.department,
      date: fd.date,
      time: fd.time,
      duration: fd.duration,
      type: fd.type,
      reason: fd.reason,
      status: fd.status, // This will be 'pending' for new appointments
      statusHistory: ['pending'],
      requiresDoctorConfirmation: true, // Always true for admin-created appointments
      notes: fd.notes
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare a body compatible with backend DTO
    const body = buildRequestBodyFromForm(formData);

    try {
      if (editingAppointment && editingAppointment._dbId) {
        // Update existing appointment via backend
        const res = await fetch(`${API_BASE}/${editingAppointment._dbId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('Update failed');
        const updated = await res.json();
        const mapped = mapBackendToUI(updated);

        setAppointments(prev => prev.map(apt => (apt._dbId === mapped._dbId ? mapped : apt)));
      } else if (editingAppointment && !editingAppointment._dbId) {
        // local-only appointment (no db id) - update locally
        const selectedPatient = patients.find(p => p.id === formData.patientId);
        const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
        
        setAppointments(appointments.map(apt =>
          apt.id === editingAppointment.id
            ? { ...formData, id: apt.id, _dbId: apt._dbId, patientName: selectedPatient?.name || apt.patientName, doctorName: selectedDoctor?.name || apt.doctorName, bookedAt: apt.bookedAt, requiresDoctorConfirmation: apt.requiresDoctorConfirmation }
            : apt
        ));
      } else {
        // Create new appointment via backend
        try {
          const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (!res.ok) throw new Error('Create failed');
          const created = await res.json();
          const mapped = mapBackendToUI(created);
          setAppointments(prev => [...prev, mapped]);
        } catch (createErr) {
          // If backend create fails, fallback to local-only creation (keeps UI working offline)
          console.warn('Backend create failed, adding appointment locally.', createErr);
          const selectedPatient = patients.find(p => p.id === formData.patientId);
          const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
          
          const newAppointment = {
            ...formData,
            id: generateAppointmentId(),
            _dbId: null,
            patientName: selectedPatient?.name || '',
            doctorName: selectedDoctor?.name || '',
            status: 'pending', // Always pending for new appointments
            statusHistory: ['pending'],
            bookedAt: new Date().toISOString(),
            requiresDoctorConfirmation: true // Admin-created appointments need doctor confirmation
          };
          setAppointments(prev => [...prev, newAppointment]);
        }
      }

      handleCloseModal();
    } catch (err) {
      console.error('Submit error:', err);
      alert('There was an error saving the appointment. See console for details.');
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    // copy data for form - ensure we don't mutate appointment object directly
    setFormData({
      patientId: appointment.patientId || '',
      doctorId: appointment.doctorId || '',
      department: appointment.department || '',
      date: appointment.date || '',
      time: appointment.time || '',
      duration: appointment.duration || 30,
      type: appointment.type || 'Consultation',
      reason: appointment.reason || '',
      notes: appointment.notes || '',
      status: appointment.status || 'pending' // Keep existing status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return; 

    const apt = appointments.find(a => a.id === appointmentId);
    try {
      if (apt && apt._dbId) {
        const res = await fetch(`${API_BASE}/${apt._dbId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        setAppointments(prev => prev.filter(a => a.id !== appointmentId));
      } else {
        // local-only appointment
        setAppointments(prev => prev.filter(a => a.id !== appointmentId));
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete appointment. See console for details.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
    setFormData({
      patientId: '',
      doctorId: '',
      department: '',
      date: '',
      time: '',
      duration: 30,
      type: 'Consultation',
      reason: '',
      notes: '',
      status: 'pending' // Reset to pending for new appointments
    });
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return;

    // Admin can only set status to cancelled or pending
    // Only doctor can confirm appointments and mark them as completed
    if (newStatus === 'confirmed' || newStatus === 'completed') {
      alert('Only the assigned doctor can confirm or complete appointments.');
      return;
    }

    const updatedBody = buildRequestBodyFromForm({
      ...apt,
      patientName: apt.patientName,
      doctorName: apt.doctorName,
      status: newStatus,
      statusHistory: [...(apt.statusHistory || []), newStatus]
    });

    try {
      if (apt._dbId) {
        const res = await fetch(`${API_BASE}/${apt._dbId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedBody)
        });
        if (!res.ok) throw new Error('Status update failed');
        const updated = await res.json();
        const mapped = mapBackendToUI(updated);
        setAppointments(prev => prev.map(a => a.id === appointmentId ? mapped : a));
      } else {
        // local-only update
        setAppointments(prev => prev.map(a => a.id === appointmentId ? { 
          ...a, 
          status: newStatus,
          statusHistory: [...(a.statusHistory || []), newStatus]
        } : a));
      }
    } catch (err) {
      console.error('Status change error:', err);
      alert('Failed to update status. See console for details.');
    }
  };

  const handleViewTimeSlots = (doctorId, date) => {
    setFormData(prev => ({ ...prev, doctorId, date }));
    setSelectedDate(date);
    generateAvailableSlots(doctorId, date);
    setIsTimeSlotModalOpen(true);
  };

  const generateAvailableSlots = (doctorId, date) => {
    // Generate sample time slots (in real app, this would come from API)
    const slots = [];
    const startTime = 9; // 9 AM
    const endTime = 17; // 5 PM
    
    for (let hour = startTime; hour < endTime; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if slot is already booked
        const isBooked = appointments.some(apt => 
          apt.doctorId === doctorId && 
          apt.date === date && 
          apt.time === timeString &&
          apt.status !== 'cancelled'
        );

        if (!isBooked) {
          slots.push(timeString);
        }
      }
    }
    
    setAvailableSlots(slots);
  };

  const handleTimeSlotSelect = (time) => {
    setFormData(prev => ({ ...prev, time }));
    setIsTimeSlotModalOpen(false);
  };

  const sendConfirmation = async (appointment) => {
    // In real app, this would integrate with email/SMS service
    alert(`Confirmation request sent to ${appointment.doctorName} for appointment ${appointment.id}`);
    
    // Note: Admin can only send confirmation request, doctor must confirm
    // Status remains pending until doctor confirms
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-lime-100 text-lime-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <ClockIcon className="h-3 w-3" />;
      case 'pending': return <UserCheck className="h-3 w-3" />;
      default: return null;
    }
  };

  const formatDateTime = (date, time) => {
    // local display formatting - safe fallback if invalid date/time
    try {
      return new Date(`${date}T${time}`).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return `${date} ${time}`;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-0">
      {/* Header */}
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search appointments by patient, doctor, or ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
              >
                <option value="all">All Doctors</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* New Appointment Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Appointment
          </button>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{appointment.patientName}</h3>
                <p className="text-lime-600 font-medium">{appointment.id}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                {getStatusIcon(appointment.status)}
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                {appointment.status === 'pending' && appointment.requiresDoctorConfirmation && (
                  <span className="text-xs text-yellow-600 ml-1">(Awaiting Doctor)</span>
                )}
              </span>
            </div>

            {/* Appointment Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Stethoscope className="h-4 w-4" />
                <span className="text-sm">{appointment.doctorName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="h-4 w-4" />
                <span className="text-sm">{appointment.department}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{formatDateTime(appointment.date, appointment.time)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{appointment.duration} minutes • {appointment.type}</span>
              </div>
            </div>

            {/* Reason */}
            {appointment.reason && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 line-clamp-2">{appointment.reason}</p>
              </div>
            )}

            {/* Status Note */}
            {appointment.status === 'pending' && appointment.requiresDoctorConfirmation && (
              <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-700">
                  <strong>Awaiting Doctor Confirmation:</strong> Dr. {appointment.doctorName} needs to confirm this appointment.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => sendConfirmation(appointment)}
                className="flex-1 bg-lime-500 hover:bg-lime-600 text-white py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-1 transition-colors"
                disabled={appointment.status === 'cancelled'}
              >
                <Send className="h-3 w-3" />
                Send Reminder
              </button>
              <button
                onClick={() => handleEdit(appointment)}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(appointment.id)}
                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Status Actions */}
            <div className="flex gap-1 mt-3">
              {appointment.status !== 'confirmed' && appointment.status !== 'completed' && (
                <button
                  onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                  className="flex-1 bg-lime-50 hover:bg-lime-100 text-lime-700 py-1 px-2 rounded text-xs font-medium transition-colors opacity-50 cursor-not-allowed"
                  disabled
                  title="Only doctor can confirm appointments"
                >
                  Confirm (Doctor Only)
                </button>
              )}
              {appointment.status !== 'cancelled' && (
                <button
                  onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-1 px-2 rounded text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
              {appointment.status !== 'completed' && appointment.status === 'confirmed' && (
                <button
                  onClick={() => handleStatusChange(appointment.id, 'completed')}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-1 px-2 rounded text-xs font-medium transition-colors opacity-50 cursor-not-allowed"
                  disabled
                  title="Only doctor can complete appointments"
                >
                  Complete (Doctor Only)
                </button>
              )}
              {appointment.status === 'pending' && (
                <button
                  onClick={() => handleStatusChange(appointment.id, 'pending')}
                  className="flex-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 py-1 px-2 rounded text-xs font-medium transition-colors"
                >
                  Mark as Pending
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No appointments found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Add/Edit Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingAppointment ? 'Edit Appointment' : 'Book New Appointment'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              {!editingAppointment && (
                <p className="text-sm text-yellow-600 mt-2">
                  <strong>Note:</strong> New appointments will be in &quot;Pending&quot; status and require confirmation from the assigned doctor.
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient *
                  </label>
                  <select
                    name="patientId"
                    required
                    value={formData.patientId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                  >
                    <option value="">Select Patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} ({patient.id})
                      </option>
                    ))}
                  </select>
                  {patients.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">No patients found. Please add patients first.</p>
                  )}
                </div>

                {/* Doctor Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor *
                  </label>
                  <select
                    name="doctorId"
                    required
                    value={formData.doctorId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                  {doctors.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">No doctors found. Please add doctors first.</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Appointment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Type *
                  </label>
                  <select
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                  >
                    {appointmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      name="time"
                      required
                      value={formData.time}
                      onChange={handleInputChange}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => formData.doctorId && formData.date && handleViewTimeSlots(formData.doctorId, formData.date)}
                      className="bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                      disabled={!formData.doctorId || !formData.date}
                    >
                      View Slots
                    </button>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <select
                    name="duration"
                    required
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                  </select>
                </div>

                {/* Status - Admin can only set to pending or cancelled */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                    disabled={!editingAppointment} // Can't change status when creating new appointment
                  >
                    <option value="pending">Pending (Requires Doctor Confirmation)</option>
                    <option value="cancelled">Cancelled</option>
                    {editingAppointment?.status === 'confirmed' && (
                      <option value="confirmed">Confirmed (Doctor Approved)</option>
                    )}
                    {editingAppointment?.status === 'completed' && (
                      <option value="completed">Completed (Doctor Marked)</option>
                    )}
                  </select>
                  {!editingAppointment && (
                    <p className="text-xs text-gray-500 mt-1">New appointments are always &quot;Pending&quot; until doctor confirms</p>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit *
                </label>
                <textarea
                  name="reason"
                  required
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                  placeholder="Describe the reason for this appointment..."
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent"
                  placeholder="Any additional notes or special requirements..."
                />
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
                  {editingAppointment ? 'Update Appointment' : 'Book Appointment (Pending Doctor Confirmation)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Available Time Slots Modal */}
      {isTimeSlotModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Available Time Slots</h2>
                <button
                  onClick={() => setIsTimeSlotModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-1">
                {doctors.find(d => d.id === formData.doctorId)?.name} - {selectedDate}
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {availableSlots.length > 0 ? (
                  availableSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => handleTimeSlotSelect(slot)}
                      className="bg-lime-500 hover:bg-lime-600 text-white py-2 px-3 rounded-lg font-medium text-sm transition-colors"
                    >
                      {slot}
                    </button>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No available slots for this date</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsTimeSlotModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-medium transition-colors"
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

export default AppointmentScheduling;