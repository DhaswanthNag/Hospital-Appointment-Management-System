import React from 'react';
import { PanelLeft } from "lucide-react";
import { 
  MdDashboard,
  MdCalendarToday, 
  MdPeople, 
  MdMedicalServices, 
  MdScience, 
  MdAnalytics,
} from 'react-icons/md';

const DoctorSidebar = ({ sidebarOpen, setSidebarOpen, activeModule, setActiveModule }) => {

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: MdDashboard, description: 'View & confirm appointments' },
    { id: 'appointments', name: 'Appointments', icon: MdCalendarToday, description: 'View & confirm appointments' },
    { id: 'my-patients', name: 'My Patients', icon: MdPeople, description: 'View assigned patients' },
    { id: 'prescriptions', name: 'Prescriptions', icon: MdMedicalServices, description: 'Create/Edit prescriptions' },
    { id: 'lab-results', name: 'Lab Results', icon: MdScience, description: 'Request/View lab results' },
    { id: 'reports', name: 'Reports', icon: MdAnalytics, description: 'View doctor reports' },
  ];

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-md transition-all duration-300 h-full`}>
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {sidebarOpen && (
          <h1 className="text-xl font-bold text-gray-800">Doctor Portal</h1>
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
                <div className="ml-3 flex-1">
                  <div className="font-medium text-sm">{module.name}</div>
                  <div className="text-xs opacity-75 mt-0.5">{module.description}</div>
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default DoctorSidebar;
