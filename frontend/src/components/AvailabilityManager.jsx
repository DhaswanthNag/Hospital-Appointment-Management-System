import React, { useEffect, useState } from "react";
import api from "../api/api";

const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export default function AvailabilityManager({ doctorId }){
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ day_of_week:0, start_time:"09:00", end_time:"17:00", slot_duration_mins:30 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fetchAvail = async () => {
    try {
      const res = await api.get(`/doctors/${doctorId}/availability`);
      setList(res.data || []);
    } catch (e) { setErr("Failed to load availability"); }
  };

  useEffect(()=>{ if (doctorId) fetchAvail(); }, [doctorId]);

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const addAvail = async (e) => {
    e?.preventDefault?.();
    setErr("");
    try {
      setLoading(true);
      await api.post(`/doctors/${doctorId}/availability`, form);
      setForm({ day_of_week:0, start_time:"09:00", end_time:"17:00", slot_duration_mins:30 });
      await fetchAvail();
    } catch (e) { setErr("Failed to add"); } finally { setLoading(false); }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/doctors/${doctorId}/availability/${id}`);
      await fetchAvail();
    } catch (e) { setErr("Delete failed"); }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Availability</h3>
      {err && <div className="text-red-600 mb-3">{err}</div>}
      <form onSubmit={addAvail} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <select name="day_of_week" value={form.day_of_week} onChange={handleChange} className="border p-2 rounded">
          {days.map((d,i)=> <option key={i} value={i}>{d}</option>)}
        </select>
        <input name="start_time" value={form.start_time} onChange={handleChange} type="time" className="border p-2 rounded" />
        <input name="end_time" value={form.end_time} onChange={handleChange} type="time" className="border p-2 rounded" />
        <input name="slot_duration_mins" value={form.slot_duration_mins} onChange={handleChange} type="number" className="border p-2 rounded" />
        <div className="md:col-span-4 mt-2">
          <button disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded">{loading? "Adding..." : "Add Availability"}</button>
        </div>
      </form>

      <div className="space-y-2">
        {list.length === 0 && <div className="text-gray-600">No availability set yet</div>}
        {list.map(a => (
          <div key={a.id} className="flex justify-between items-center border rounded p-2">
            <div>
              <div className="font-medium">{days[a.day_of_week]} • {a.start_time} - {a.end_time}</div>
              <div className="text-sm text-gray-500">Slot: {a.slot_duration_mins} mins</div>
            </div>
            <button onClick={()=>remove(a.id)} className="text-red-600">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
