import React from 'react';
import { PanelLeft } from "lucide-react";
import { 
  MdDashboard,
  MdCalendarToday,
  MdPerson,
  MdMedicalServices,
  MdScience,
  MdPayment,
  MdHistory,
} from 'react-icons/md';

const UserSidebar = ({ sidebarOpen, setSidebarOpen, activeModule, setActiveModule }) => {

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: MdDashboard },
    { id: 'appointments', name: 'My Appointments', icon: MdCalendarToday },
    { id: 'profile', name: 'My Profile', icon: MdPerson },
    { id: 'prescriptions', name: 'Prescriptions', icon: MdMedicalServices },
    { id: 'lab-results', name: 'Lab Results', icon: MdScience },
    { id: 'payments', name: 'Payments', icon: MdPayment },
    { id: 'history', name: 'Visit History', icon: MdHistory },
  ];

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-md transition-all duration-300 h-full`}>
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {sidebarOpen && (
          <h1 className="text-xl font-bold text-gray-800">Health Portal</h1>
        )}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-gray-700 hover:text-lime-600 transition-colors"
        >
          <PanelLeft className="w-6 h-6" />
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
              <IconComponent className="text-xl flex-shrink-0" />
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

export default UserSidebar;