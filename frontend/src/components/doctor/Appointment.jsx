// import React, { useState, useEffect, useContext } from 'react';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Building,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
//   Bell,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';

const API_BASE = '/api/appointments';
const DOCTOR_API = '/api/doctors';

const AppointmentManagement = () => {
  const { user: contextUser } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [currentDoctorId, setCurrentDoctorId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  // Get the logged-in user from AuthContext or localStorage
  const getLoggedInUser = useCallback(() => {
    if (contextUser) {
      return contextUser;
    }

    try {
      const savedUser = localStorage.getItem('hams_user');

      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (error) {
      console.error('Error reading logged-in user:', error);
    }

    return null;
  }, [contextUser]);

  const fetchDoctorData = useCallback(async () => {
    try {
      const loggedInUser = getLoggedInUser();

      if (!loggedInUser?.email) {
        console.error('Logged-in doctor email not found');
        setDoctor(null);
        setCurrentDoctorId(null);
        setLoading(false);
        return;
      }

      // Get all doctors and find the doctor belonging to the logged-in user
      const response = await api.get(DOCTOR_API);

      const doctors = Array.isArray(response.data)
        ? response.data
        : [];

      const loggedInDoctor = doctors.find(
        (doctorData) =>
          doctorData.email?.toLowerCase() === loggedInUser.email.toLowerCase()
      );

      if (loggedInDoctor) {
        setDoctor(loggedInDoctor);
        setCurrentDoctorId(loggedInDoctor.id);

        console.log(
          'Logged-in doctor found:',
          loggedInDoctor.name,
          loggedInDoctor.id
        );
      } else {
        console.error(
          'No doctor found for logged-in email:',
          loggedInUser.email
        );

        setDoctor(null);
        setCurrentDoctorId(null);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);

      setDoctor(null);
      setCurrentDoctorId(null);
      setAppointments([]);
    }
  }, [getLoggedInUser]);

  const fetchAppointments = useCallback(async () => {
    if (!currentDoctorId) {
      return;
    }

    try {
      const response = await api.get(
        `${API_BASE}/doctor/${currentDoctorId}`
      );

      if (Array.isArray(response.data)) {
        setAppointments(response.data);

        console.log(
          `Appointments loaded for doctor ${currentDoctorId}:`,
          response.data
        );
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);

      // Do not show mock appointments when the real API fails.
      // This keeps the dashboard restricted to real database appointments.
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [currentDoctorId]);

  useEffect(() => {
    fetchDoctorData();
  }, [fetchDoctorData]);

  useEffect(() => {
    if (!currentDoctorId) {
      return;
    }

    fetchAppointments();

    // Automatically refresh appointments every 5 seconds
    const interval = setInterval(() => {
      fetchAppointments();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentDoctorId, fetchAppointments]);

  const filterAppointments = useCallback(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        (apt.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (apt.appointmentId || apt.id || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, filterStatus]);

  useEffect(() => {
    filterAppointments();
  }, [filterAppointments]);

  // const getMockAppointments = () => [
  //   { 
  //     id: 'APT001', 
  //     _dbId: '1', 
  //     patientId: 'PAT001', 
  //     patientName: 'John Doe', 
  //     patientEmail: 'john.doe@email.com', 
  //     patientPhone: '+1-555-0001', 
  //     patientAddress: '123 Main St, City, State', 
  //     dateOfBirth: '1985-03-15', 
  //     gender: 'Male', 
  //     doctorId: 'DOC001', 
  //     doctorName: 'Dr. Sarah Johnson', 
  //     department: 'Cardiology', 
  //     date: '2024-03-20', 
  //     time: '10:00', 
  //     duration: 30, 
  //     type: 'Consultation', 
  //     reason: 'Heart checkup and follow-up', 
  //     status: 'pending', 
  //     bookedAt: '2024-03-15T10:30:00', 
  //     notes: 'Patient has history of hypertension', 
  //     room: '301' 
  //   }, 
  //   { 
  //     id: 'APT002', 
  //     _dbId: '2', 
  //     patientId: 'PAT002', 
  //     patientName: 'Jane Smith', 
  //     patientEmail: 'jane.smith@email.com', 
  //     patientPhone: '+1-555-0002', 
  //     patientAddress: '456 Oak Ave, City, State', 
  //     dateOfBirth: '1990-07-22', 
  //     gender: 'Female', 
  //     doctorId: 'DOC001', 
  //     doctorName: 'Dr. Sarah Johnson', 
  //     department: 'Cardiology', 
  //     date: '2024-03-20', 
  //     time: '10:30', 
  //     duration: 45, 
  //     type: 'Follow-up', 
  //     reason: 'Post-treatment follow-up', 
  //     status: 'confirmed', 
  //     bookedAt: '2024-03-16T09:15:00', 
  //     notes: 'Regular checkup after medication', 
  //     room: '305' 
  //   }, 
  //   { 
  //     id: 'APT003', 
  //     _dbId: '3', 
  //     patientId: 'PAT003', 
  //     patientName: 'Mike Wilson', 
  //     patientEmail: 'mike.wilson@email.com', 
  //     patientPhone: '+1-555-0003', 
  //     patientAddress: '789 Pine Rd, City, State', 
  //     dateOfBirth: '1978-11-30', 
  //     gender: 'Male', 
  //     doctorId: 'DOC001', 
  //     doctorName: 'Dr. Sarah Johnson', 
  //     department: 'Cardiology', 
  //     date: '2024-03-21', 
  //     time: '14:00', 
  //     duration: 60, 
  //     type: 'ECG Test', 
  //     reason: 'ECG testing and analysis', 
  //     status: 'pending', 
  //     bookedAt: '2024-03-14T16:45:00', 
  //     notes: 'Patient requested morning appointment if possible', 
  //     room: '310' 
  //   } 
  // ]; 

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const appointment = appointments.find(apt => apt.id === appointmentId);

      if (!appointment) {
        console.error('Appointment not found:', appointmentId);
        return;
      }

      const updatedAppointment = {
        ...appointment,
        status: newStatus
      };

      // Real database appointments use "id" as the UUID.
      // Mock appointments use "_dbId", so support both.
      const databaseId = appointment.id || appointment._dbId;

      const res = await api.put(
        `${API_BASE}/${databaseId}`,
        updatedAppointment
      );

      if (res.status >= 200 && res.status < 300) {
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === appointmentId
              ? { ...apt, status: newStatus }
              : apt
          )
        );

        // Show notification
        alert(`Appointment ${newStatus} successfully!`);
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Error updating appointment status');
    }
  };

  const handleReschedule = async (newDate, newTime) => {
    if (!selectedAppointment) return;

    try {
      const updatedAppointment = {
        ...selectedAppointment,
        date: newDate,
        time: newTime,
        status: 'rescheduled'
      };

      // Real database appointments use "id" as the UUID.
      // Mock appointments use "_dbId", so support both.
      const databaseId =
        selectedAppointment.id || selectedAppointment._dbId;

      const res = await api.put(
        `${API_BASE}/${databaseId}`,
        updatedAppointment
      );

      if (res.status >= 200 && res.status < 300) {
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === selectedAppointment.id
              ? updatedAppointment
              : apt
          )
        );

        setIsRescheduleModalOpen(false);
        setSelectedAppointment(null);
        alert('Appointment rescheduled successfully!');
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      alert('Error rescheduling appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-lime-100 text-lime-800 border-lime-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const isTomorrow = (dateString) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dateString === tomorrow.toISOString().split('T')[0];
  };

  const getDateDisplay = (dateString) => {
    if (isToday(dateString)) return 'Today';
    if (isTomorrow(dateString)) return 'Tomorrow';
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lime-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Appointment Management</h1>
            <p className="text-gray-600">Manage and confirm your upcoming appointments</p>
          </div>
          {doctor && (
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-800">{doctor.name}</p>
              <p className="text-lime-600">{doctor.specialization}</p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-lime-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-800">{appointments.length}</p>
              </div>
              <div className="bg-lime-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-lime-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-lime-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {appointments.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-lime-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-lime-600">
                  {appointments.filter(a => a.status === 'confirmed').length}
                </p>
              </div>
              <div className="bg-lime-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-lime-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-lime-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold text-blue-600">
                  {appointments.filter(a => isToday(a.date)).length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-lime-100">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search appointments by patient name or ID..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select 
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent" 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-lime-100 p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{appointment.patientName}</h3>
                <p className="text-lime-600 font-medium">{appointment.type}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(appointment.status)}`}>
                {getStatusIcon(appointment.status)}
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>

            {/* Appointment Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {appointment.time} • {getDateDisplay(appointment.date)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="h-4 w-4" />
                <span className="text-sm">Room {appointment.room}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Stethoscope className="h-4 w-4" />
                <span className="text-sm">{appointment.department}</span>
              </div>
            </div>

            {/* Reason */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 line-clamp-2">{appointment.reason}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {appointment.status === 'pending' && (
                <>
                  <button 
                    onClick={() => handleStatusUpdate(appointment.id, 'confirmed')} 
                    className="flex-1 bg-lime-500 hover:bg-lime-600 text-white py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-1 transition-colors"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Confirm
                  </button>
                  <button 
                    onClick={() => { 
                      setSelectedAppointment(appointment); 
                      setIsRescheduleModalOpen(true); 
                    }} 
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-1 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reschedule
                  </button>
                </>
              )}
              <button 
                onClick={() => { 
                  setSelectedAppointment(appointment); 
                  setIsDetailModalOpen(true); 
                }} 
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-1 transition-colors"
              >
                <User className="h-3 w-3" />
                Details
              </button>
            </div>

            {/* Quick Actions */}
            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
              <div className="flex gap-1 mt-3">
                {appointment.status !== 'confirmed' && (
                  <button 
                    onClick={() => handleStatusUpdate(appointment.id, 'confirmed')} 
                    className="flex-1 bg-lime-50 hover:bg-lime-100 text-lime-700 py-1 px-2 rounded text-xs font-medium transition-colors"
                  >
                    Confirm
                  </button>
                )}
                <button 
                  onClick={() => handleStatusUpdate(appointment.id, 'cancelled')} 
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-1 px-2 rounded text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
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

      {/* Appointment Detail Modal */}
      {isDetailModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Appointment Details</h2>
                <button 
                  onClick={() => setIsDetailModalOpen(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-lime-600" />
                    <div>
                      <p className="font-medium text-gray-800">{selectedAppointment.patientName}</p>
                      <p className="text-sm text-gray-600">Patient</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-lime-600" />
                    <div>
                      <p className="font-medium text-gray-800">{selectedAppointment.patientEmail}</p>
                      <p className="text-sm text-gray-600">Email</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-lime-600" />
                    <div>
                      <p className="font-medium text-gray-800">{selectedAppointment.patientPhone}</p>
                      <p className="text-sm text-gray-600">Phone</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-lime-600" />
                    <div>
                      <p className="font-medium text-gray-800">{selectedAppointment.patientAddress}</p>
                      <p className="text-sm text-gray-600">Address</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(selectedAppointment.date)} at {selectedAppointment.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-gray-800">{selectedAppointment.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium text-gray-800">{selectedAppointment.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Room</p>
                    <p className="font-medium text-gray-800">{selectedAppointment.room}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Reason</p>
                    <p className="font-medium text-gray-800">{selectedAppointment.reason}</p>
                  </div>
                  {selectedAppointment.notes && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="font-medium text-gray-800">{selectedAppointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                {selectedAppointment.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => { 
                        handleStatusUpdate(selectedAppointment.id, 'confirmed'); 
                        setIsDetailModalOpen(false); 
                      }} 
                      className="flex-1 bg-lime-500 hover:bg-lime-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Confirm Appointment
                    </button>
                    <button 
                      onClick={() => { 
                        setIsDetailModalOpen(false); 
                        setIsRescheduleModalOpen(true); 
                      }} 
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reschedule
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setIsDetailModalOpen(false)} 
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Reschedule Appointment</h2>
                <button 
                  onClick={() => setIsRescheduleModalOpen(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Date
                </label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent" 
                  onChange={(e) => setSelectedAppointment(prev => ({ ...prev, date: e.target.value }))} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Time
                </label>
                <input 
                  type="time" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 transition duration-300 focus:border-transparent" 
                  onChange={(e) => setSelectedAppointment(prev => ({ ...prev, time: e.target.value }))} 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsRescheduleModalOpen(false)} 
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleReschedule(selectedAppointment.date, selectedAppointment.time)} 
                  className="flex-1 bg-lime-500 hover:bg-lime-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AppointmentManagement;