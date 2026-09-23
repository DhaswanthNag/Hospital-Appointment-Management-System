import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";

export default function DoctorList(){
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/doctors");
        if (mounted) setDoctors(res.data || []);
      } catch (e) { setErr(e?.response?.data?.message || "Failed to load doctors"); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => mounted = false;
  }, []);

  if (loading) return <div className="p-6">Loading doctors…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Doctors</h1>
        <Link to="/doctors/add" className="bg-indigo-600 text-white px-4 py-2 rounded">Add Doctor</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map(d => (
          <div key={d.id} className="p-4 border rounded shadow-sm flex justify-between items-center">
            <div>
              <div className="font-semibold text-lg">{d.user?.name || d.user_name || d.name || "Dr. Unknown"}</div>
              <div className="text-sm text-gray-600">{d.specialization}</div>
              <div className="text-sm text-gray-500">Fee: ₹{d.consultation_fee ?? d.consultationFee ?? 0}</div>
            </div>
            <div className="flex flex-col space-y-2">
              <Link to={`/doctors/${d.id}`} className="text-indigo-600 hover:underline">View</Link>
              <Link to={`/doctors/${d.id}/edit`} className="text-gray-600 hover:underline">Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
