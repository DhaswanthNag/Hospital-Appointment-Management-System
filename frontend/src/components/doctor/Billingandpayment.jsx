import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Eye,
  Search,
  RefreshCw,
  Receipt,
  IndianRupee,
  Clock,
  CheckCircle
} from "lucide-react";
import api from "../../api/api";

const Billingandpayment = () => {
  const [billings, setBillings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBilling, setSelectedBilling] = useState(null);

  const getLoggedInUser = useCallback(() => {
    try {
      const storedUser =
        sessionStorage.getItem("hams_user") ||
        sessionStorage.getItem("user") ||
        localStorage.getItem("hams_user") ||
        localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Unable to read logged-in user:", error);
      return null;
    }
  }, []);

  const getPatientName = useCallback(
    (patientId) => {
      const patient = patients.find(
        item =>
          String(item.patientId || item.id) === String(patientId)
      );

      if (!patient) {
        return patientId || "Unknown Patient";
      }

      if (patient.firstName || patient.lastName) {
        return `${patient.firstName || ""} ${patient.lastName || ""}`.trim();
      }

      return patient.name || patient.patientId || patient.id;
    },
    [patients]
  );

  const findCurrentDoctor = useCallback(async () => {
    const loggedInUser = getLoggedInUser();

    if (!loggedInUser) {
      return null;
    }

    try {
      const response = await api.get("/api/doctors");
      const doctors = Array.isArray(response.data) ? response.data : [];

      console.log("Logged-in user:", loggedInUser);
      console.log("Fetched doctors:", doctors);

      // First try doctorId from logged-in user
      const loggedInDoctorId =
        loggedInUser.doctorId ||
        loggedInUser.doctorID ||
        loggedInUser.doctor_id;

      if (loggedInDoctorId) {
        const doctor = doctors.find(
          item =>
            String(item.id) === String(loggedInDoctorId)
        );

        if (doctor) {
          return doctor;
        }
      }

      // Try user id if the doctor record uses the same ID
      if (loggedInUser.id) {
        const doctor = doctors.find(
          item =>
            String(item.id) === String(loggedInUser.id)
        );

        if (doctor) {
          return doctor;
        }
      }

      // Try email / username / userEmail
      const email =
        loggedInUser.email ||
        loggedInUser.username ||
        loggedInUser.userEmail;

      if (email) {
        const doctor = doctors.find(
          item =>
            item.email &&
            item.email.toLowerCase() === email.toLowerCase()
        );

        if (doctor) {
          return doctor;
        }
      }

      return null;
    } catch (err) {
      console.error("Error finding current doctor:", err);
      return null;
    }
  }, [getLoggedInUser]);

  const loadPatients = useCallback(async () => {
    try {
      const response = await api.get("/api/patients");
      setPatients(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error loading patients:", err);
      setPatients([]);
    }
  }, []);

  const loadBillings = useCallback(async () => {
    try {
      setError("");

      const currentDoctor = await findCurrentDoctor();

      console.log("Current doctor for billing:", currentDoctor);

      if (!currentDoctor) {
        setError("Unable to identify the logged-in doctor.");
        setBillings([]);
        return;
      }

      const response = await api.get(
        `/api/billing/doctor/${currentDoctor.id}`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      console.log("Billing records for current doctor:", data);

      setBillings(data);
    } catch (err) {
      console.error("Error loading billing records:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load billing records."
      );

      setBillings([]);
    }
  }, [findCurrentDoctor]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      await Promise.all([
        loadPatients(),
        loadBillings()
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadPatients, loadBillings]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const getDoctorName = (doctorId) => {
    return doctorId || "Unknown Doctor";
  };

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return date;
    }
  };

  const getStatusClass = (status) => {
    const normalizedStatus = String(status || "").toUpperCase();

    if (normalizedStatus === "PAID") {
      return "bg-green-100 text-green-700";
    }

    if (normalizedStatus === "PARTIAL") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
  };

  const filteredBillings = useMemo(() => {
    let filtered = [...billings];

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      filtered = filtered.filter(billing => {
        const patientName =
          getPatientName(billing.patientId).toLowerCase();

        const invoiceNumber =
          String(billing.invoiceNumber || "").toLowerCase();

        const serviceName =
          String(billing.serviceName || "").toLowerCase();

        const status =
          String(billing.paymentStatus || "").toLowerCase();

        return (
          patientName.includes(search) ||
          invoiceNumber.includes(search) ||
          serviceName.includes(search) ||
          status.includes(search)
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        billing =>
          String(billing.paymentStatus || "").toUpperCase() ===
          statusFilter
      );
    }

    return filtered;
  }, [
    billings,
    searchTerm,
    statusFilter,
    getPatientName
  ]);

  const statistics = useMemo(() => {
    const total = billings.reduce(
      (sum, item) =>
        sum + Number(item.totalAmount || 0),
      0
    );

    const paid = billings.reduce(
      (sum, item) =>
        sum + Number(item.paidAmount || 0),
      0
    );

    const due = billings.reduce(
      (sum, item) =>
        sum + Number(item.dueAmount || 0),
      0
    );

    const pending = billings.filter(
      item =>
        String(item.paymentStatus || "").toUpperCase() ===
        "PENDING"
    ).length;

    return {
      total,
      paid,
      due,
      pending
    };
  }, [billings]);

  const closeDetails = () => {
    setSelectedBilling(null);
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow-sm border p-10 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-lime-500 mx-auto mb-3" />
          <p className="text-gray-600">
            Loading billing information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Billing & Payment
            </h1>

            <p className="text-gray-500 mt-1">
              View billing records and payment information for your patients.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-lime-500 text-white rounded-lg font-medium hover:bg-lime-600 transition disabled:opacity-60"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Billing
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {formatCurrency(statistics.total)}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-lime-100 text-lime-600">
                <Receipt size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Paid Amount
                </p>

                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(statistics.paid)}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <CheckCircle size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Due Amount
                </p>

                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(statistics.due)}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-red-100 text-red-600">
                <IndianRupee size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Pending Bills
                </p>

                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {statistics.pending}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                <Clock size={22} />
              </div>
            </div>
          </div>

        </div>

        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex flex-col lg:flex-row gap-4">

            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search invoice, patient or service..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
            >
              <option value="all">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="PENDING">Pending</option>
            </select>

          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800">
                Patient Billing Records
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {filteredBillings.length} billing record
                {filteredBillings.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {filteredBillings.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />

              <h3 className="text-lg font-semibold text-gray-700">
                No billing records found
              </h3>

              <p className="text-gray-500 mt-1">
                Billing records created for your patients will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">

                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Invoice
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Patient
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Service
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Date
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                      Total
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                      Paid
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                      Due
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                      Status
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredBillings.map(billing => (
                    <tr
                      key={billing.id}
                      className="hover:bg-lime-50/40 transition"
                    >
                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-800">
                          {billing.invoiceNumber || `INV-${billing.id}`}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-800">
                          {getPatientName(billing.patientId)}
                        </div>

                        <div className="text-xs text-gray-500">
                          {billing.patientId}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-gray-800">
                          {billing.serviceName || "Medical Service"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(billing.billingDate)}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-gray-800">
                        {formatCurrency(billing.totalAmount)}
                      </td>

                      <td className="px-5 py-4 text-right text-green-600 font-medium">
                        {formatCurrency(billing.paidAmount)}
                      </td>

                      <td className="px-5 py-4 text-right text-red-600 font-medium">
                        {formatCurrency(billing.dueAmount)}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                            billing.paymentStatus
                          )}`}
                        >
                          {billing.paymentStatus || "PENDING"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => setSelectedBilling(billing)}
                          className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-lime-600 hover:bg-lime-50 transition"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            </div>
          )}

        </div>

      </div>

      {selectedBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            <div className="px-6 py-5 border-b flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Billing Details
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {selectedBilling.invoiceNumber ||
                    `INV-${selectedBilling.id}`}
                </p>
              </div>

              <button
                onClick={closeDetails}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>

            </div>

            <div className="p-6 space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="border rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase">
                    Patient
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {getPatientName(selectedBilling.patientId)}
                  </p>

                  <p className="text-sm text-gray-500">
                    {selectedBilling.patientId}
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase">
                    Doctor
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {getDoctorName(selectedBilling.doctorId)}
                  </p>

                  <p className="text-sm text-gray-500">
                    {selectedBilling.doctorId}
                  </p>
                </div>

              </div>

              <div className="border rounded-lg overflow-hidden">

                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="font-semibold text-gray-800">
                    Invoice Summary
                  </h3>
                </div>

                <div className="p-4 space-y-3">

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Service
                    </span>

                    <span className="font-medium text-gray-800">
                      {selectedBilling.serviceName ||
                        "Medical Service"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Billing Date
                    </span>

                    <span className="font-medium text-gray-800">
                      {formatDate(selectedBilling.billingDate)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Amount
                    </span>

                    <span className="font-medium text-gray-800">
                      {formatCurrency(selectedBilling.amount)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Discount
                    </span>

                    <span className="font-medium text-gray-800">
                      - {formatCurrency(selectedBilling.discount)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Tax
                    </span>

                    <span className="font-medium text-gray-800">
                      {formatCurrency(selectedBilling.tax)}
                    </span>
                  </div>

                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold text-gray-800">
                      Total Amount
                    </span>

                    <span className="font-bold text-gray-800">
                      {formatCurrency(selectedBilling.totalAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Paid Amount
                    </span>

                    <span className="font-semibold text-green-600">
                      {formatCurrency(selectedBilling.paidAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Due Amount
                    </span>

                    <span className="font-semibold text-red-600">
                      {formatCurrency(selectedBilling.dueAmount)}
                    </span>
                  </div>

                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="border rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase">
                    Payment Method
                  </p>

                  <p className="font-medium text-gray-800 mt-1">
                    {selectedBilling.paymentMethod ||
                      "Not specified"}
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase">
                    Payment Status
                  </p>

                  <span
                    className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                      selectedBilling.paymentStatus
                    )}`}
                  >
                    {selectedBilling.paymentStatus ||
                      "PENDING"}
                  </span>
                </div>

              </div>

              {selectedBilling.notes && (
                <div className="border rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    Notes
                  </p>

                  <p className="text-gray-700">
                    {selectedBilling.notes}
                  </p>
                </div>
              )}

            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">

              <button
                onClick={closeDetails}
                className="px-5 py-2.5 bg-lime-500 text-white rounded-lg font-medium hover:bg-lime-600"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Billingandpayment;
