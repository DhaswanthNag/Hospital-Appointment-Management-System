import React, { useState, useEffect, useCallback, useContext } from "react";
import { User, Mail, Phone, Calendar, MapPin, HeartPulse, ShieldCheck, Pencil, X, Save, Loader2, AlertCircle, CheckCircle2, UserRound, Droplets, CreditCard } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [patient, setPatient] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const getLoggedInUser = useCallback(() => {
    if (user?.email) {
      return user;
    }

    try {
      const storedUser = localStorage.getItem("hams_user");
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (err) {
      console.error("Error reading hams_user:", err);
    }

    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (err) {
      console.error("Error reading user:", err);
    }

    return null;
  }, [user]);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const loggedInUser = getLoggedInUser();

      if (!loggedInUser?.email) {
        setError("Unable to identify the logged-in patient.");
        return;
      }

      const response = await api.get("/api/patients");
      const patients = Array.isArray(response.data) ? response.data : [];

      const matchedPatient = patients.find(
        (item) =>
          item.email?.toLowerCase() === loggedInUser.email?.toLowerCase()
      );

      if (!matchedPatient) {
        setError("Patient profile not found.");
        return;
      }

      setPatient(matchedPatient);
      setFormData({
        firstName: matchedPatient.firstName || "",
        lastName: matchedPatient.lastName || "",
        email: matchedPatient.email || "",
        phone: matchedPatient.phone || "",
        dateOfBirth: matchedPatient.dateOfBirth || "",
        gender: matchedPatient.gender || "",
        address: matchedPatient.address || "",
        emergencyContact: matchedPatient.emergencyContact || "",
        bloodGroup: matchedPatient.bloodGroup || "",
        insuranceProvider: matchedPatient.insuranceProvider || "",
        insuranceId: matchedPatient.insuranceId || ""
      });
    } catch (err) {
      console.error("Error loading patient profile:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [getLoggedInUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setSuccess("");
    setError("");
  };

  const handleEdit = () => {
    setEditing(true);
    setSuccess("");
    setError("");
  };

  const handleCancel = () => {
    if (patient) {
      setFormData({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        email: patient.email || "",
        phone: patient.phone || "",
        dateOfBirth: patient.dateOfBirth || "",
        gender: patient.gender || "",
        address: patient.address || "",
        emergencyContact: patient.emergencyContact || "",
        bloodGroup: patient.bloodGroup || "",
        insuranceProvider: patient.insuranceProvider || "",
        insuranceId: patient.insuranceId || ""
      });
    }

    setEditing(false);
    setSuccess("");
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!patient?.patientId) {
      setError("Patient ID is missing. Unable to update profile.");
      return;
    }

    try {
      setSaving(true);
      setSuccess("");
      setError("");

      const updatedPatient = {
        ...patient,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        bloodGroup: formData.bloodGroup,
        insuranceProvider: formData.insuranceProvider,
        insuranceId: formData.insuranceId
      };

      const response = await api.put(
        `/api/patients/${patient.patientId}`,
        updatedPatient
      );

      setPatient(response.data);
      setFormData({
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        dateOfBirth: response.data.dateOfBirth || "",
        gender: response.data.gender || "",
        address: response.data.address || "",
        emergencyContact: response.data.emergencyContact || "",
        bloodGroup: response.data.bloodGroup || "",
        insuranceProvider: response.data.insuranceProvider || "",
        insuranceId: response.data.insuranceId || ""
      });

      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("Error updating patient profile:", err);
      setError(
        err.response?.data?.message ||
        "Unable to update your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const first = formData.firstName?.charAt(0) || "";
    const last = formData.lastName?.charAt(0) || "";
    return `${first}${last}`.toUpperCase() || "P";
  };

  const getFullName = () => {
    const name = `${formData.firstName || ""} ${formData.lastName || ""}`.trim();
    return name || "Patient";
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 text-lime-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white px-6">
        <div className="max-w-md w-full bg-white border border-lime-100 rounded-lg p-8 text-center shadow-sm">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Profile Not Available
          </h2>
          <p className="text-gray-600 mb-5">
            {error || "We could not find your patient profile."}
          </p>
          <button
            onClick={loadProfile}
            className="px-5 py-3 rounded-md bg-lime-600 hover:bg-lime-700 text-white transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans px-6 py-8">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              My Profile
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your personal and contact information
            </p>
          </div>

          {!editing ? (
            <button
              onClick={handleEdit}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-lime-600 hover:bg-lime-700 text-white font-medium shadow-sm transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-lime-600 bg-white text-lime-600 hover:bg-lime-50 transition-colors disabled:opacity-50 font-medium"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-lime-600 hover:bg-lime-700 text-white font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-lime-200 bg-lime-50 px-5 py-4 text-lime-700">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-red-600">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-gradient-to-r from-lime-50 to-lime-50 border border-lime-100 rounded-lg overflow-hidden mb-8 shadow-sm">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 rounded-lg bg-lime-100 border border-lime-200 flex items-center justify-center">
                <span className="text-3xl font-bold text-lime-600">
                  {getInitials()}
                </span>
              </div>

              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-bold text-gray-800">
                  {getFullName()}
                </h2>

                <p className="text-gray-600 mt-2">
                  {formData.email || "No email available"}
                </p>

                <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-lime-100 border border-lime-200 text-lime-700 text-sm font-medium">
                    <UserRound className="w-4 h-4" />
                    Patient
                  </span>

                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-lime-100 text-gray-600 text-sm">
                    Patient ID: {patient.patientId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="bg-white border border-lime-100 rounded-lg overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-lime-100 bg-lime-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center">
                <User className="w-5 h-5 text-lime-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Personal Information
                </h3>
                <p className="text-sm text-gray-600">
                  Your basic personal details
                </p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>

                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                  className="w-full px-4 py-3 rounded-md bg-white border border-lime-100 text-gray-800 outline-none focus:border-lime-600 focus:ring-2 focus:ring-lime-100 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>

                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                  className="w-full px-4 py-3 rounded-md bg-white border border-lime-100 text-gray-800 outline-none focus:border-lime-600 focus:ring-2 focus:ring-lime-100 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>

                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-600" />

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full pl-11 pr-4 py-3 rounded-md bg-white border border-lime-100 text-gray-800 outline-none focus:border-lime-600 focus:ring-2 focus:ring-lime-100 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>

                <select
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-3 rounded-md bg-white border border-lime-100 text-gray-800 outline-none focus:border-lime-600 focus:ring-2 focus:ring-lime-100 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-lime-100 rounded-lg overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-lime-100 bg-lime-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-lime-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Contact Information
                </h3>
                <p className="text-sm text-gray-600">
                  Your communication and emergency details
                </p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-600" />

                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-md bg-white border border-lime-100 text-gray-800 outline-none focus:border-lime-600 focus:ring-2 focus:ring-lime-100 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-600" />

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full pl-11 pr-4 py-3 rounded-md bg-white border border-lime-100 text-gray-800 outline-none focus:border-lime-600 focus:ring-2 focus:ring-lime-100 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact
                </label>

                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-3 rounded-md bg-white border border-lime-100 text-gray-800 outline-none focus:border-lime-600 focus:ring-2 focus:ring-lime-100 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>

                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-4 h-4 text-lime-600" />

                  <textarea
                    name="address"
                    value={formData.address || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    rows="3"
                    className="w-full pl-11 pr-4 py-3 rounded-md bg-white border border-lime-100 text-gray-800 outline-none focus:border-lime-600 focus:ring-2 focus:ring-lime-100 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-lime-100 rounded-lg overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-lime-100 bg-lime-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-lime-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Medical Information
                </h3>
                <p className="text-sm text-gray-600">
                  Basic medical information associated with your profile
                </p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group
                </label>

                <div className="relative">
                  <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-600" />

                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full pl-11 pr-4 py-3 rounded-md bg-white border border-lime-100 text-gray-800 outline-none focus:border-lime-600 focus:ring-2 focus:ring-lime-100 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient ID
                </label>

                <input
                  type="text"
                  value={patient.patientId || ""}
                  disabled
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-lime-100 text-gray-500 cursor-not-allowed"
                />

                <p className="text-xs text-gray-500 mt-2">
                  Patient ID cannot be changed.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-lime-100 rounded-lg overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-lime-100 bg-lime-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-lime-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Insurance Information
                </h3>
                <p className="text-sm text-gray-600">
                  Your healthcare insurance details
                </p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Provider
                </label>

                <input
                  type="text"
                  name="insuranceProvider"
                  value={formData.insuranceProvider || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-3 rounded-md bg-white border border-lime-100 text-gray-800 outline-none focus:border-lime-600 focus:ring-2 focus:ring-lime-100 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance ID
                </label>

                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-600" />

                  <input
                    type="text"
                    name="insuranceId"
                    value={formData.insuranceId || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full pl-11 pr-4 py-3 rounded-md bg-white border border-lime-100 text-gray-800 outline-none focus:border-lime-600 focus:ring-2 focus:ring-lime-100 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {editing && (
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-lime-600 bg-white text-lime-600 hover:bg-lime-50 transition-colors disabled:opacity-50 font-medium"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-lime-600 hover:bg-lime-700 text-white font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
