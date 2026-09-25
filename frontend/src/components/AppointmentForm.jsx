import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import PropTypes from "prop-types";

AppointmentForm.propTypes = {
  doctorId: PropTypes.string,
};

export default function AppointmentForm({ doctorId }) {
  const [form, setForm] = useState({ date: '', time: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments/book', { doctorId, date: form.date, time: form.time });
      navigate('/appointments');
    } catch (err) {
      alert('Error booking appointment');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <label className="block mb-2">Date</label>
      <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full border p-2 rounded mb-3" required />
      <label className="block mb-2">Time</label>
      <input type="time" name="time" value={form.time} onChange={handleChange} className="w-full border p-2 rounded mb-3" required />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Confirm</button>
    </form>
  );
}
