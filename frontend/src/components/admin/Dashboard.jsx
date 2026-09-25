import React, { useState } from 'react';
import { MdPeople, MdSupervisedUserCircle, MdCalendarToday, MdPayment } from 'react-icons/md';
import AdminSidebar from "../../sidebar/AdminSidebar";
// import Rolemanagement from "./Rolemanagement";
import DoctorManagement from "./DoctorManagement";
import PatientManagement from "./PatientManagement";
import AppointmentSchedulling from "./AppointmentSchedulling";
import Prescription from "./Prescription";
// import Billing from "./Billing";
// import AdminProfilePage from './AdminProfilePage';

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const statsData = [
    { title: 'Total Patients', value: '1,254', change: '+12%', icon: <MdPeople className="text-2xl" /> },
    { title: 'Total Doctors', value: '48', change: '+5%', icon: <MdSupervisedUserCircle className="text-2xl" /> },
    { title: 'Appointments Today', value: '36', change: '+8%', icon: <MdCalendarToday className="text-2xl" /> },
    { title: 'Revenue (Monthly)', value: '$24,580', change: '+15%', icon: <MdPayment className="text-2xl" /> },
  ];

  const recentAppointments = [
    { id: 1, patient: 'John Smith', doctor: 'Dr. Sarah Johnson', time: '10:00 AM', status: 'Confirmed' },
    { id: 2, patient: 'Emma Davis', doctor: 'Dr. Michael Brown', time: '10:30 AM', status: 'Pending' },
    { id: 3, patient: 'Robert Wilson', doctor: 'Dr. Lisa Anderson', time: '11:15 AM', status: 'Confirmed' },
    { id: 4, patient: 'Maria Garcia', doctor: 'Dr. James Miller', time: '11:45 AM', status: 'Cancelled' },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // -------------------------
  // SWITCH CASE MODULE RENDERING
  // -------------------------
  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsData.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-lime-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm">{stat.title}</p>
                      <h3 className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</h3>
                      <p className="text-lime-600 text-sm mt-1">{stat.change} from last month</p>
                    </div>
                    <div className="bg-lime-100 p-3 rounded-lg text-lime-600">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Recent Appointments</h3>
                <button className="text-lime-600 hover:text-lime-700 font-medium">
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-3">Patient</th>
                      <th className="pb-3">Doctor</th>
                      <th className="pb-3">Time</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAppointments.map((appointment) => (
                      <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4">{appointment.patient}</td>
                        <td className="py-4">{appointment.doctor}</td>
                        <td className="py-4">{appointment.time}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <button className="text-lime-600 hover:text-lime-700 mr-3">Edit</button>
                          <button className="text-red-500 hover:text-red-600">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      case "doctor-management":
        return <DoctorManagement />;

      case "Profile":
        return (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Profile
            </h3>
            <p className="text-gray-600">
              Admin profile module is under development.
            </p>
          </div>
        );

      case "patient-management":
        return <PatientManagement />;

      case "appointment":
        return <AppointmentSchedulling />;

      case "prescription":
        return <Prescription />;

      // case "billing":
      //   return <Billing />;

      default:
        return (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
              {activeModule.replace('-', ' ')}
            </h3>
            <p className="text-gray-600">
              This module is under development. Content for {activeModule.replace('-', ' ')} will be displayed here.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Sidebar */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto mt-2 mb-2">

        {/* Header */}
        {/* <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {activeModule.replace('-', ' ')}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-lime-50">
                <MdNotificationsActive className="text-xl text-gray-600" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-lime-500 rounded-full flex items-center justify-center text-white">
                A
              </div>
              <span className="text-gray-700">Admin User</span>
            </div>
          </div>
        </header> */}

        {/* Dynamically Rendered Content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
