import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate, useParams } from "react-router-dom";

export default function DoctorForm({ edit=false }){
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState({ user_id:"", specialization:"", qualifications:"", consultation_fee:"0", bio:"" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (edit && id) {
      (async () => {
        try {
          const res = await api.get(`/doctors/${id}`);
          setForm({
            user_id: res.data.user_id || res.data.user?.id || "",
            specialization: res.data.specialization || "",
            qualifications: res.data.qualifications || "",
            consultation_fee: res.data.consultation_fee || res.data.consultationFee || "0",
            bio: res.data.bio || ""
          });
        } catch (e) { setErr("Failed to load doctor"); }
      })();
    }
  }, [edit, id]);

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      setLoading(true);
      if (edit && id) {
        await api.put(`/doctors/${id}`, form);
      } else {
        await api.post(`/doctors/add`, form);
      }
      nav("/doctors");
    } catch (e) {
      setErr(e?.response?.data?.message || "Save failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl mb-4">{edit ? "Edit Doctor" : "Add Doctor"}</h2>
      {err && <div className="text-red-600 mb-3">{err}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="user_id" value={form.user_id} onChange={handleChange} placeholder="User ID (link to users table)" className="w-full border p-2 rounded" required />
        <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="Specialization" className="w-full border p-2 rounded" />
        <input name="qualifications" value={form.qualifications} onChange={handleChange} placeholder="Qualifications" className="w-full border p-2 rounded" />
        <input name="consultation_fee" value={form.consultation_fee} onChange={handleChange} placeholder="Consultation Fee" className="w-full border p-2 rounded" />
        <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Bio" className="w-full border p-2 rounded" rows={4} />
        <div className="flex gap-3">
          <button disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded">{loading ? "Saving..." : "Save"}</button>
          <button type="button" className="px-4 py-2 border rounded" onClick={()=>nav(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
