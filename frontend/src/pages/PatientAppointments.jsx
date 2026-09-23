import React, { useEffect, useState } from 'react';
import api from '../api/api';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.get('/appointments/patient') // backend should infer patient from token
      .then(res => setAppointments(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">My Appointments</h2>
      <div className="space-y-3">
        {appointments.map(a => (
          <div key={a.id} className="p-4 bg-white rounded shadow-sm flex justify-between">
            <div>
              <div className="font-semibold">{a.date} at {a.time}</div>
              <div className="text-sm text-gray-600">Doctor: {a.doctorName || a.doctor_id}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-red-500 text-white rounded">Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
