import React from 'react';
import { useParams } from 'react-router-dom';
import AppointmentForm from '../components/AppointmentForm';

export default function AppointmentBooking() {
  const { doctorId } = useParams();
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Book Appointment</h2>
      <AppointmentForm doctorId={doctorId} />
    </div>
  );
}
