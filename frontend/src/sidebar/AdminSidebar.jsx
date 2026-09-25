import React from 'react';
import PropTypes from "prop-types";
import { PanelLeft } from "lucide-react";
import { 
  MdDashboard, 
  MdSupervisedUserCircle, 
  MdPeople, 
  MdCalendarToday, 
  MdMedicalServices, 
  MdPayment, 
  MdScience, 
  MdBusiness, 
  MdAnalytics, 
  MdNotificationsActive, 
  MdPerson, 
  MdLock, 
  MdSettings, 
  MdHistory,
} from 'react-icons/md';

const AdminSidebar = ({ sidebarOpen, setSidebarOpen, activeModule, setActiveModule }) => {

  // Module data based on the provided images
  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: MdDashboard, admin: true, doctor: true, patient: true },
    { id: 'doctor-management', name: 'Doctor Management', icon: MdSupervisedUserCircle, admin: true, doctor: false, patient: false },
    { id: 'patient-management', name: 'Patient Management', icon: MdPeople, admin: true, doctor: true, patient: true },
    { id: 'appointment', name: 'Appointment', icon: MdCalendarToday, admin: true, doctor: true, patient: true },
    { id: 'prescription', name: 'Prescription', icon: MdMedicalServices, admin: true, doctor: true, patient: true },
    { id: 'billing', name: 'Billing & Payment', icon: MdPayment, admin: true, doctor: false, patient: true },
    { id: 'laboratory', name: 'Laboratory Management', icon: MdScience, admin: true, doctor: true, patient: true },
    { id: 'reception', name: 'Reception / Front Desk', icon: MdBusiness, admin: true, doctor: false, patient: false },
    { id: 'reports', name: 'Reports & Analytics', icon: MdAnalytics, admin: true, doctor: true, patient: true },
    { id: 'notifications', name: 'Notifications / Alerts', icon: MdNotificationsActive, admin: true, doctor: true, patient: true },
    { id: 'user-management', name: 'User Management', icon: MdPerson, admin: true, doctor: false, patient: false },
    { id: 'role-management', name: 'Role Management', icon: MdLock, admin: true, doctor: false, patient: false },
    { id: 'system-config', name: 'System Configuration', icon: MdSettings, admin: true, doctor: false, patient: false },
    { id: 'audit-logs', name: 'Audit Logs', icon: MdHistory, admin: true, doctor: false, patient: false },
  ];

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-md transition-all duration-300`}>
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {sidebarOpen && (
          <h1 className="text-xl font-bold text-gray-800">Hospital Admin</h1>
        )}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-gray-700 hover:text-lime-600 transition-colors"
        >
          {/* Using Lucide PanelLeft */}
          {/* The 'rotate-180' class visually flips the icon when the sidebar is closed. */}
          <PanelLeft 
            className={`w-6 h-6 transform transition-transform duration-300 ${
                !sidebarOpen ? 'rotate-0' : ''
            }`} 
          />
        </button>
      </div>

      <nav className="mt-6">
        {modules.map(module => {
          const IconComponent = module.icon;
          return (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                activeModule === module.id 
                  ? 'bg-lime-500 text-white' 
                  : 'text-gray-700 hover:bg-lime-50'
              }`}
            >
              <IconComponent className="text-xl" />
              {sidebarOpen && (
                <span className="ml-3 font-medium">{module.name}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

AdminSidebar.propTypes = {
  sidebarOpen: PropTypes.bool,
  setSidebarOpen: PropTypes.func,
  activeModule: PropTypes.string,
  setActiveModule: PropTypes.func,
};

export default AdminSidebar;
