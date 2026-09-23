import React from 'react';
import { Link } from 'react-router-dom';

export default function DoctorCard({ doctor }) {
  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <h3 className="text-lg font-semibold">{doctor.name}</h3>
      <p className="text-sm text-gray-600">{doctor.specialization}</p>
      <p className="text-sm mt-2">Available: {doctor.available_days || 'Mon-Fri'}</p>
      <div className="mt-3">
        <Link to={`/book/${doctor.id}`} className="bg-blue-600 text-white px-3 py-1 rounded">Book Appointment</Link>
      </div>
    </div>
  );
}
