import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import AvailabilityManager from "../components/AvailabilityManager";

export default function DoctorProfile(){
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/doctors/${id}`);
        setDoc(res.data);
      } catch (e) {
        setDoc(null);
      } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!doc) return <div className="p-6 text-red-600">Doctor not found</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">{doc.user?.name || doc.name}</h1>
          <div className="text-sm text-gray-600">{doc.specialization}</div>
          <div className="mt-2 text-gray-700">{doc.bio}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold">Fee</div>
          <div>₹{doc.consultation_fee}</div>
          <Link to={`/doctors/${id}/edit`} className="text-indigo-600 underline mt-2 block">Edit</Link>
        </div>
      </div>

      <hr className="my-6" />

      <AvailabilityManager doctorId={id} />
    </div>
  );
}
