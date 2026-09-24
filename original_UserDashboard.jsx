import React, { useState } from 'react';
import UserSidebar from '../../sidebar/UserSidebar';

const UserDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');

  // Sample data
  const upcomingAppointments = [
    {
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      date: '2025-11-28',
      time: '10:00 AM',
      room: 'Room 20, Building A'
    },
    {
      doctor: 'Dr. Michael Chen',
      specialty: 'General Director',
      date: '2025-10-05',
      time: '2:50 PM',
      room: 'Room 205, Building B'
    },
    {
      doctor: 'Dr. Emily Rodriguez',
      specialty: 'Dermatology',
      date: '2025-10-12',
      time: '1:00 AM',
      room: 'Room 105, Building C'
    }
  ];

  const prescriptions = [
    {
      name: 'Lisitor',
      doctor: 'Dr. Sarah Johnson',
      dosage: '10mg',
      frequency: 'Once daily',
      validUntil: '2026-11-01'
    },
    {
      name: 'Metformin',
      doctor: 'Dr. Michael Chen',
      dosage: '500mg',
      frequency: 'Once daily',
      validUntil: '2026-10-15'
    },
    {
      name: 'Atorvastatin',
      doctor: 'Dr. Sarah Johnson',
      dosage: '20mg',
      frequency: 'Once daily',
      validUntil: '2026-09-20'
    }
  ];

  const labResults = [
    {
      testName: 'Complete Blood Count (CBC)',
      date: '2025-11-15',
      parameters: [
        { parameter: 'WBC', result: '7.2 K/uL', normalRange: '4.5-10', status: 'Ôåô' },
        { parameter: 'RBC', result: '4.8 M/uL', normalRange: '4.5-5.5', status: 'Ôåô' },
        { parameter: 'Hemoglobin', result: '14.5 g/dL', normalRange: '13.5-17.3', status: 'Ôåô' }
      ]
    },
    {
      testName: 'Comprehensive Metabolic Panel',
      date: '2025-11-10',
      parameters: [
        { parameter: 'Glucose', result: '105 mg/dL', normalRange: '70-100', status: 'Ôåæ' },
        { parameter: 'Creatinine', result: '0.9 mg/dL', normalRange: '0.7-1.3', status: 'Ôåô' },
        { parameter: 'BUN', result: '18 mg/dL', normalRange: '7-20', status: 'Ôåô' }
      ]
    }
  ];

  const visitHistory = [
    {
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      date: '2025-11-20 at 10:30 AM',
      diagnosis: 'Hypertension - Stable',
      notes: 'Blood pressure was controlled. Continue current medication. Follow-up in 3 months.',
      prescription: 'Lisitor 10mg'
    },
    {
      doctor: 'Dr. Michael Chen',
      specialty: 'General Physician',
      date: '2025-10-15 at 2:00 PM',
      diagnosis: 'Type 2 Diabetes - Controlled',
      notes: 'Glucose levels within acceptable range. Patient advised on diet and exercise. Continue monitoring.',
      prescription: 'Metformin 500mg'
    }
  ];

  const billingData = {
    totalPaid: 700.00,
    pending: 180.00,
    questioned: 65.00,
    invoices: [
      { id: 'INV-2025-1001', description: 'General Checking' },
      { id: 'INV-2025-1002', description: 'Cardiology Consultation' },
      { id: 'INV-2025-1003', description: 'Lab Tests' },
      { id: 'INV-2025-1004', description: 'Follow-up Consultation' }
    ]
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Your Health Portal</h1>
        <p className="text-gray-600 mb-6">Manage your appointments, view prescriptions, and track your health journey</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
              {upcomingAppointments.slice(0, 2).map((appointment, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <h3 className="font-semibold text-gray-800">{appointment.doctor}</h3>
                  <p className="text-gray-600 text-sm">{appointment.specialty}</p>
                  <p className="text-gray-500 text-sm">{appointment.date} ÔÇó {appointment.time}</p>
                </div>
              ))}
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Prescriptions</h2>
              <div className="space-y-2">
                <p className="text-gray-700">1. Lab Results</p>
                <p className="text-gray-700">2. Outstanding Balance</p>
                <p className="text-gray-700">3. $245</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-semibold text-gray-800 mb-2">My Prescription</h3>
                <p className="text-sm text-gray-600">Your active prescriptions and download</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-semibold text-gray-800 mb-2">Visit History</h3>
                <p className="text-sm text-gray-600">View your medical history and visits</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-semibold text-gray-800 mb-2">Lab Results</h3>
                <p className="text-sm text-gray-600">Check your latest test results</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-semibold text-gray-800 mb-2">My Profile</h3>
                <p className="text-sm text-gray-600">Update personal and medical info</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-lime-50 transition-colors">
                  <span className="font-medium text-gray-800">Book Appointment</span>
                  <p className="text-sm text-gray-600 mt-1">Schedule a new appointment</p>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-lime-50 transition-colors">
                  <span className="font-medium text-gray-800">Payments</span>
                  <p className="text-sm text-gray-600 mt-1">Manage bills and make payments</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Appointments</h1>
        <p className="text-gray-600 mb-6">Manage and schedule your medical appointments</p>

        <div className="space-y-6">
          {upcomingAppointments.map((appointment, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{appointment.doctor}</h2>
              <p className="text-gray-600 mb-4">{appointment.specialty}</p>
              
              <div className="space-y-2 text-gray-700 mb-4">
                <p>{appointment.date}</p>
                <p>{appointment.time}</p>
                <p>{appointment.room}</p>
              </div>

              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-lime-500 text-white rounded-lg font-medium hover:bg-lime-600 transition-colors">
                  Reschedule
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrescriptions = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Prescriptions</h1>
        
        <div className="space-y-6">
          {prescriptions.map((prescription, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{prescription.name}</h2>
              <p className="text-gray-600 mb-4">Dr: {prescription.doctor}</p>
              
              <div className="space-y-2 text-gray-700">
                <p><span className="font-medium">Dosage:</span> {prescription.dosage}</p>
                <p><span className="font-medium">Frequency:</span> {prescription.frequency}</p>
                <p><span className="font-medium">Valid until:</span> {prescription.validUntil}</p>
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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Lab Results</h1>
        
        <div className="space-y-8">
          {labResults.map((lab, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{lab.testName}</h2>
              <p className="text-gray-600 mb-4">{lab.date}</p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-semibold text-gray-700">Parameter</th>
                      <th className="text-left py-2 font-semibold text-gray-700">Result</th>
                      <th className="text-left py-2 font-semibold text-gray-700">Normal Range</th>
                      <th className="text-left py-2 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lab.parameters.map((param, paramIndex) => (
                      <tr key={paramIndex} className="border-b border-gray-100">
                        <td className="py-2 text-gray-700">{param.parameter}</td>
                        <td className="py-2 text-gray-700">{param.result}</td>
                        <td className="py-2 text-gray-600">{param.normalRange}</td>
                        <td className="py-2 text-gray-700">{param.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button className="px-4 py-2 bg-lime-500 text-white rounded-lg font-medium hover:bg-lime-600 transition-colors">
            Download Results
          </button>
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payments & Billing</h1>
        <p className="text-gray-600 mb-6">Manage your invoices and make payments</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Outstanding Balance</h2>
              <p className="text-gray-600 mb-4">Please settle your due payments</p>
              
              <div className="space-y-2">
                <p><span className="font-medium">Total Paid:</span> ${billingData.totalPaid.toFixed(2)}</p>
                <p><span className="font-medium">Pending:</span> ${billingData.pending.toFixed(2)}</p>
                <p><span className="font-medium">Question:</span> ${billingData.questioned.toFixed(2)}</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Invoices</h2>
              <div className="space-y-3">
                {billingData.invoices.map((invoice, index) => (
                  <div key={index} className="border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                    <p className="font-medium text-gray-800">{invoice.id}</p>
                    <p className="text-sm text-gray-600">{invoice.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Last Plan</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Total Paid:</span> $245.00</p>
              <p><span className="font-medium">Pending:</span> $250.00</p>
              {[...Array(8)].map((_, index) => (
                <p key={index}><span className="font-medium">Question:</span> ${(350 + index * 50).toFixed(2)}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Profile</h1>
        <p className="text-gray-600 mb-6">Manage your personal and medical information</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-gray-800">John Doe</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="text-gray-800">03/15/1985</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-800">john.doe@email.com</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-800">+1 (555) 123-4567</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-800">123 Main Street, City, State 12345</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Medical Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Blood Type</p>
                  <p className="text-gray-800 font-medium">O+</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Medical Conditions</p>
                  <p className="text-gray-800">Hypertension, Diabetes (Type 2)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Emergency Contact</p>
                  <p className="text-gray-800">Jane Doe ÔÇó +1 (555) 987-6543</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Allergies</p>
                  <p className="text-gray-800">Penicillin, Sulfa Drugs</p>
                </div>
              </div>
            </div>

            <button className="w-full px-4 py-3 bg-lime-500 text-white rounded-lg font-medium hover:bg-lime-600 transition-colors">
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVisitHistory = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Visit History</h1>
        
        <div className="space-y-6">
          {visitHistory.map((visit, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{visit.doctor}</h2>
              <p className="text-gray-600 mb-4">{visit.specialty}</p>
              
              <div className="space-y-3 mb-4">
                <p className="text-gray-700">{visit.date}</p>
                <p className="text-gray-700"><span className="font-medium">Diagnosis:</span> {visit.diagnosis}</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Clinical Notes</h3>
                <p className="text-gray-600 mb-4">{visit.notes}</p>
                
                <h3 className="font-semibold text-gray-800 mb-2">Prescriptions</h3>
                <p className="text-gray-600">{visit.prescription}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return renderDashboard();
      case 'appointments':
        return renderAppointments();
      case 'profile':
        return renderProfile();
      case 'prescriptions':
        return renderPrescriptions();
      case 'lab-results':
        return renderLabResults();
      case 'payments':
        return renderPayments();
      case 'history':
        return renderVisitHistory();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <UserSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="p-2 mt-2 mb-2">
          {renderModuleContent()}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
