import React, { useState } from 'react';
import DoctorSidebar from "../../sidebar/DoctorSidebar";  
import { Download, Eye, Pencil } from "lucide-react";
import AppointmentManagement from './Appointment';


const DoctorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState('appointments');

  // MUST BE ADDED (Your DoctorSidebar uses this)
  // const modules = [
  //   { id: 'appointments', description: 'View & confirm appointments' },
  //   { id: 'my-patients', description: 'View assigned patients' },
  //   { id: 'prescriptions', description: 'Create/Edit prescriptions' },
  //   { id: 'lab-results', description: 'Request/View lab results' },
  //   { id: 'reports', description: 'View doctor reports' },
  // ];

  // Sample data
  const appointments = [
    { id: 1, patient: 'John Doe', procedure: 'Heart Checkup', time: '09:00 AM - Today', room: 'Room 301', status: 'pending' },
    { id: 2, patient: 'Jane Smith', procedure: 'Follow-up', time: '10:30 AM - Today', room: 'Room 305', status: 'pending' },
    { id: 3, patient: 'Mike Wilson', procedure: 'ECG Test', time: '02:00 PM - Tomorrow', room: 'Room 310', status: 'pending' }
  ];

  const patients = [
    { id: 1, name: 'John Doe', age: 45, condition: 'Hypertension', lastVisit: '2 days ago', nextAppointment: '2025-11-28' },
    { id: 2, name: 'Jane Smith', age: 52, condition: 'Arrhythmia', lastVisit: '1 week ago', nextAppointment: '2025-11-30' },
    { id: 3, name: 'Mike Wilson', age: 38, condition: 'Chest Pain', lastVisit: '3 days ago', nextAppointment: '2025-11-25' }
  ];

  const prescriptions = [
    { id: 1, patient: 'John Doe', medicine: 'Lisinopril 10mg', dosage: '1 tablet daily', duration: '30 days', date: '2025-11-20' },
    { id: 2, patient: 'Jane Smith', medicine: 'Amiodarone 200mg', dosage: '1 tablet twice daily', duration: '60 days', date: '2025-11-19' },
    { id: 3, patient: 'Mike Wilson', medicine: 'Aspirin 100mg', dosage: '1 tablet daily', duration: '90 days', date: '2025-11-18' }
  ];

  const labResults = [
    { id: 1, patient: 'John Doe', test: 'Blood Test', date: '2025-11-20', results: 'Hemoglobin: 14.5 g/dL', status: 'completed' },
    { id: 2, patient: 'Jane Smith', test: 'ECG', date: '2025-11-19', results: 'Awaiting results', status: 'pending' },
    { id: 3, patient: 'Mike Wilson', test: 'Cholesterol Panel', date: '2025-11-21', results: 'Total: 195 mg/dL', status: 'completed' }
  ];

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage and confirm your upcoming appointments</h2>
        <div className="space-y-4">
          {appointments.map(appointment => (
            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{appointment.patient}</h3>
                  <p className="text-gray-600">{appointment.procedure}</p>
                  <p className="text-sm text-gray-500">{appointment.time}</p>
                  <p className="text-sm text-gray-500">{appointment.room}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-lime-500 text-white rounded-lg text-sm font-medium hover:bg-lime-600 transition-colors">
                    Confirm
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMyPatients = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">View assigned patients</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map(patient => (
            <div key={patient.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-800 text-lg mb-2">{patient.name}</h3>
              <p className="text-gray-600 mb-4">{patient.age} years old</p>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">CONDITION</p>
                  <p className="text-gray-800">{patient.condition}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">LAST VISIT</p>
                  <p className="text-gray-800">{patient.lastVisit}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">NEXT APPOINTMENT</p>
                  <p className="text-gray-800">{patient.nextAppointment}</p>
                </div>
              </div>

              <button className="w-full mt-4 px-4 py-2 bg-lime-500 text-white rounded-lg font-medium hover:bg-lime-600 transition-colors">
                View Full Profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

const renderPrescriptions = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm p-6">

      {/* Title + Create Button Row */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Create and manage patient prescriptions
        </h2>

        <button className="px-4 py-2 bg-lime-500 text-white rounded-lg text-sm font-medium hover:bg-lime-600 transition">
          + New Prescription
        </button>
      </div>

      <div className="space-y-6">
        {prescriptions.map((prescription) => (
          <div
            key={prescription.id}
            className="border border-lime-400 rounded-xl p-6 shadow-sm bg-white hover:shadow-md transition"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">
                {prescription.patient}
              </h3>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {prescription.date}
                </span>

                {/* View Button */}
                <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 text-lime-600 hover:bg-gray-100">
                  <Eye size={18} />
                </button>

                {/* Edit Button */}
                <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-lime-500 text-white hover:bg-lime-600">
                  <Pencil size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-1 text-gray-700">
              <p>
                <span className="font-medium">Medicine:</span>{" "}
                {prescription.medicine}
              </p>
              <p>
                <span className="font-medium">Dosage:</span>{" "}
                {prescription.dosage}
              </p>
              <p>
                <span className="font-medium">Duration:</span>{" "}
                {prescription.duration}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);



const renderLabResults = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Request and view laboratory test results
      </h2>

      <div className="space-y-6">
        {labResults.map((lab) => (
          <div
            key={lab.id}
            className="border border-lime-400 rounded-xl p-6 shadow-sm bg-white hover:shadow-md transition"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {lab.patient}
                </h3>
                <p className="text-gray-600">{lab.test}</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Download Button */}
                <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 text-lime-600 hover:bg-gray-100">
                  <Download size={18} />
                </button>

                {/* View Details Button */}
                <button className="px-4 py-2 bg-lime-500 text-white rounded-lg text-sm font-medium hover:bg-lime-600">
                  View Details
                </button>
              </div>
            </div>

            <p className="text-gray-600 mb-1">Date: {lab.date}</p>
            <p className="text-gray-600">
              Results: {lab.results}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          View your medical practice analytics and reports
        </h2>

        {/* ======== Stats Section (White Cards) ======== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Total Patients */}
          <div className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition">
            <p className="text-sm text-lime-600 font-medium mb-2">This Month</p>
            <p className="text-sm text-gray-500">Total Patients</p>
            <p className="text-3xl font-bold mt-2">245</p>
          </div>

          {/* Appointments This Month */}
          <div className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition">
            <p className="text-sm text-lime-600 font-medium mb-2">This Month</p>
            <p className="text-sm text-gray-500">Appointments This Month</p>
            <p className="text-3xl font-bold mt-2">48</p>
          </div>

          {/* Avg Rating */}
          <div className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition">
            <p className="text-sm text-lime-600 font-medium mb-2">This Month</p>
            <p className="text-sm text-gray-500">Avg. Patient Rating</p>
            <p className="text-3xl font-bold mt-2">4.8/5</p>
          </div>

        </div>

        {/* ======== Charts Section ======== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* -------- Monthly Appointments Chart (Horizontal Bars) -------- */}
          <div className="border bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Monthly Appointments</h3>
              <button
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                title="Download Report"
              >
                <Download size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { month: "Jan", value: 32, width: "65%" },
                { month: "Feb", value: 28, width: "55%" },
                { month: "Mar", value: 35, width: "72%" },
                { month: "Apr", value: 42, width: "85%" },
                { month: "May", value: 48, width: "95%" },
                { month: "Jun", value: 45, width: "88%" }
              ].map(item => (
                <div key={item.month} className="flex items-center justify-between">
                  
                  {/* Month name on left */}
                  <div className="w-12">
                    <p className="text-sm font-medium text-gray-700">{item.month}</p>
                  </div>

                  {/* Bar in middle */}
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-lime-100 h-5 rounded-full">
                      <div
                        className="h-5 rounded-full bg-lime-500"
                        style={{ width: item.width }}
                      ></div>
                    </div>
                  </div>

                  {/* Appointment number on right */}
                  <div className="w-12 text-right">
                    <p className="text-sm font-medium text-gray-700">{item.value}</p>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* -------- Patient Visit Distribution -------- */}
          <div className="border bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Patient Visit Distribution</h3>
              <button
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                title="Download Report"
              >
                <Download size={18} />
              </button>
            </div>

            <div className="space-y-6">
              {[
                { type: "Consultation", percentage: 40, count: 98 },
                { type: "Follow-up", percentage: 35, count: 85 },
                { type: "Testing", percentage: 15, count: 37 },
                { type: "Surgery", percentage: 10, count: 25 }
              ].map(item => (
                <div key={item.type}>
                  <div className="flex justify-between mb-1 text-sm text-gray-700">
                    <span>{item.type}</span>
                    <span>{item.percentage}% ({item.count})</span>
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div
                      className="h-2 rounded-full bg-lime-500"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );


  const renderModuleContent = () => {
    switch (activeModule) {
      case 'appointments':
        return <AppointmentManagement />;

      case 'my-patients':
        return renderMyPatients();
      case 'prescriptions':
        return renderPrescriptions();
      case 'lab-results':
        return renderLabResults();
      case 'reports':
        return renderReports();
      default:
        return renderAppointments();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <DoctorSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="p-2 mt-2 mb-2">
          {/* Header */}
          {/* <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 capitalize">
              {activeModule.replace('-', ' ')}
            </h1>
            <p className="text-gray-600 mt-1">
              {modules.find(m => m.id === activeModule)?.description}
            </p>
          </div> */}

          {/* Module Content */}
          {renderModuleContent()}
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
