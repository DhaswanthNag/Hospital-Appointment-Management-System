import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MdAdd, MdDelete, MdEdit, MdPayment, MdPrint, MdRefresh, MdSearch, MdClose, MdReceiptLong, MdPeople, MdAttachMoney } from "react-icons/md";
import api from "../../api/api";

const Billingandpayment = () => {
  const [billings, setBillings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedBilling, setSelectedBilling] = useState(null);

  const getInitialForm = useCallback(() => ({
    invoiceNumber: `INV-${Date.now()}`,
    patientId: "",
    doctorId: "",
    appointmentId: "",
    serviceName: "Doctor Consultation",
    billingDate: new Date().toISOString().split("T")[0],
    amount: "",
    discount: "0",
    tax: "0",
    paidAmount: "0",
    paymentMethod: "CASH",
    paymentStatus: "PENDING",
    notes: ""
  }), []);

  const [formData, setFormData] = useState(getInitialForm);

  const loadBillingData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        billingResponse,
        patientResponse,
        doctorResponse,
        appointmentResponse
      ] = await Promise.all([
        api.get("/api/billing"),
        api.get("/api/patients"),
        api.get("/api/doctors"),
        api.get("/api/appointments")
      ]);

      setBillings(
        Array.isArray(billingResponse.data)
          ? billingResponse.data
          : []
      );

      setPatients(
        Array.isArray(patientResponse.data)
          ? patientResponse.data
          : []
      );

      setDoctors(
        Array.isArray(doctorResponse.data)
          ? doctorResponse.data
          : []
      );

      setAppointments(
        Array.isArray(appointmentResponse.data)
          ? appointmentResponse.data
          : []
      );
    } catch (err) {
      console.error("Billing & Payment - Failed to load data:", err);
      console.error("Billing & Payment - API response:", err?.response?.data);

      setError(
        err?.response?.data?.message ||
        "Could not load billing data. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  const getPatientName = useCallback((patientId) => {
    const patient = patients.find(
      (item) =>
        String(item.patientId || item.id) === String(patientId)
    );

    if (!patient) {
      return "Unknown Patient";
    }

    return (
      `${patient.firstName || ""} ${patient.lastName || ""}`.trim() ||
      patient.name ||
      "Unknown Patient"
    );
  }, [patients]);

  const getDoctorName = useCallback((doctorId) => {
    const doctor = doctors.find(
      (item) => String(item.id) === String(doctorId)
    );

    if (!doctor) {
      return "Unknown Doctor";
    }

    const name = doctor.name || "Unknown Doctor";

    return name.startsWith("Dr.") ? name : `Dr. ${name}`;
  }, [doctors]);

  const getAppointmentLabel = useCallback((appointmentId) => {
    const appointment = appointments.find(
      (item) => String(item.id) === String(appointmentId)
    );

    if (!appointment) {
      return "No appointment";
    }

    return `${appointment.date || "N/A"} ${appointment.time || ""}`.trim();
  }, [appointments]);

  const calculateTotal = useMemo(() => {
    const amount = Number(formData.amount) || 0;
    const discount = Number(formData.discount) || 0;
    const tax = Number(formData.tax) || 0;
    const total = Math.max(0, amount - discount + tax);

    return total;
  }, [formData.amount, formData.discount, formData.tax]);

  const calculateDue = useMemo(() => {
    const paid = Number(formData.paidAmount) || 0;
    return Math.max(0, calculateTotal - paid);
  }, [calculateTotal, formData.paidAmount]);

  const filteredBillings = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return billings.filter((billing) => {
      const patientName = getPatientName(billing.patientId).toLowerCase();
      const doctorName = getDoctorName(billing.doctorId).toLowerCase();

      const matchesSearch =
        !searchValue ||
        String(billing.invoiceNumber || "").toLowerCase().includes(searchValue) ||
        patientName.includes(searchValue) ||
        doctorName.includes(searchValue) ||
        String(billing.serviceName || "").toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        String(billing.paymentStatus || "").toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [billings, getPatientName, getDoctorName, search, statusFilter]);

  const statistics = useMemo(() => {
    const total = billings.reduce(
      (sum, billing) => sum + Number(billing.totalAmount || 0),
      0
    );

    const paid = billings.reduce(
      (sum, billing) => sum + Number(billing.paidAmount || 0),
      0
    );

    const due = billings.reduce(
      (sum, billing) => sum + Number(billing.dueAmount || 0),
      0
    );

    const pending = billings.filter(
      (billing) =>
        String(billing.paymentStatus || "").toUpperCase() === "PENDING"
    ).length;

    return {
      total,
      paid,
      due,
      pending
    };
  }, [billings]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "paymentStatus") {
      setFormData((previous) => {
        const amount = Number(previous.amount) || 0;
        const discount = Number(previous.discount) || 0;
        const tax = Number(previous.tax) || 0;
        const total = Math.max(0, amount - discount + tax);

        if (value === "PAID") {
          return {
            ...previous,
            paymentStatus: "PAID",
            paidAmount: total.toFixed(2)
          };
        }

        if (value === "PENDING") {
          return {
            ...previous,
            paymentStatus: "PENDING",
            paidAmount: "0"
          };
        }

        return {
          ...previous,
          paymentStatus: value
        };
      });

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData(getInitialForm());
    setEditingId(null);
    setShowForm(false);
  };

  const handleCreate = () => {
    setFormData(getInitialForm());
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (billing) => {
    const totalAmount = Number(billing.totalAmount || 0);
    const paidAmount = Number(billing.paidAmount || 0);

    let calculatedStatus = "PENDING";

    if (paidAmount >= totalAmount && totalAmount > 0) {
      calculatedStatus = "PAID";
    } else if (paidAmount > 0) {
      calculatedStatus = "PARTIAL";
    }

    setEditingId(billing.id);

    setFormData({
      invoiceNumber: billing.invoiceNumber || `INV-${Date.now()}`,
      patientId: billing.patientId || "",
      doctorId: billing.doctorId || "",
      appointmentId: billing.appointmentId || "",
      serviceName: billing.serviceName || "Doctor Consultation",
      billingDate: billing.billingDate || new Date().toISOString().split("T")[0],
      amount: billing.amount ?? "",
      discount: billing.discount ?? "0",
      tax: billing.tax ?? "0",
      paidAmount: billing.paidAmount ?? "0",
      paymentMethod: billing.paymentMethod || "CASH",
      paymentStatus: calculatedStatus,
      notes: billing.notes || ""
    });

    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.patientId) {
      alert("Please select a patient.");
      return;
    }

    if (!formData.doctorId) {
      alert("Please select a doctor.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("Please enter a valid billing amount.");
      return;
    }

    if (Number(formData.discount) < 0 || Number(formData.tax) < 0) {
      alert("Discount and tax cannot be negative.");
      return;
    }

    if (Number(formData.paidAmount) < 0) {
      alert("Paid amount cannot be negative.");
      return;
    }

    if (Number(formData.paidAmount) > calculateTotal) {
      alert("Paid amount cannot be greater than the total amount.");
      return;
    }

    const finalPaymentStatus =
      Number(formData.paidAmount) >= calculateTotal
        ? "PAID"
        : Number(formData.paidAmount) > 0
        ? "PARTIAL"
        : "PENDING";

    const billingData = {
      invoiceNumber: formData.invoiceNumber,
      patientId: formData.patientId,
      doctorId: formData.doctorId,
      appointmentId: formData.appointmentId
        ? Number(formData.appointmentId)
        : null,
      serviceName: formData.serviceName,
      billingDate: formData.billingDate,
      amount: Number(formData.amount),
      discount: Number(formData.discount) || 0,
      tax: Number(formData.tax) || 0,
      paidAmount: Number(formData.paidAmount) || 0,
      paymentMethod: formData.paymentMethod,
      paymentStatus: finalPaymentStatus,
      notes: formData.notes
    };

    setSaving(true);

    try {
      if (editingId) {
        await api.put(
          `/api/billing/${editingId}`,
          billingData
        );
        alert("Billing record updated successfully.");
      } else {
        await api.post(
          "/api/billing",
          billingData
        );
        alert("Billing record created successfully.");
      }

      resetForm();
      await loadBillingData();
    } catch (err) {
      console.error("Billing & Payment - Save failed:", err);
      console.error("Billing & Payment - API response:", err?.response?.data);

      alert(
        err?.response?.data?.message ||
        "Unable to save billing record."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this billing record?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/api/billing/${id}`);

      alert("Billing record deleted successfully.");

      if (selectedBilling?.id === id) {
        setSelectedBilling(null);
      }

      await loadBillingData();
    } catch (err) {
      console.error("Billing & Payment - Delete failed:", err);
      console.error("Billing & Payment - API response:", err?.response?.data);

      alert(
        err?.response?.data?.message ||
        "Unable to delete billing record."
      );
    }
  };

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const getStatusClass = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PARTIAL":
        return "bg-yellow-100 text-yellow-800";
      case "PENDING":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const printInvoice = (billing) => {
    const patientName = getPatientName(billing.patientId);
    const doctorName = getDoctorName(billing.doctorId);

    const printWindow = window.open(
      "",
      "_blank",
      "width=900,height=700"
    );

    if (!printWindow) {
      alert("Please allow pop-ups to print the invoice.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${billing.invoiceNumber || "Invoice"}</title>
        <style>
          body{font-family:Arial,sans-serif;margin:40px;color:#222}
          .header{text-align:center;border-bottom:2px solid #84cc16;padding-bottom:20px}
          h1{margin:0;color:#65a30d}
          .invoice{margin-top:30px}
          .row{display:flex;justify-content:space-between;border-bottom:1px solid #ddd;padding:10px 0}
          .total{font-size:20px;font-weight:bold}
          .due{font-size:20px;font-weight:bold}
          .footer{text-align:center;margin-top:40px;color:#666}
          @media print{button{display:none}}
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HAMS Hospital</h1>
          <p>Hospital Appointment Management System</p>
          <h2>Billing & Payment Invoice</h2>
        </div>
        <div class="invoice">
          <div class="row"><strong>Invoice Number</strong><span>${billing.invoiceNumber || "N/A"}</span></div>
          <div class="row"><strong>Billing Date</strong><span>${billing.billingDate || "N/A"}</span></div>
          <div class="row"><strong>Patient</strong><span>${patientName}</span></div>
          <div class="row"><strong>Doctor</strong><span>${doctorName}</span></div>
          <div class="row"><strong>Service</strong><span>${billing.serviceName || "N/A"}</span></div>
          <div class="row"><strong>Appointment</strong><span>${getAppointmentLabel(billing.appointmentId)}</span></div>
          <div class="row"><strong>Amount</strong><span>${formatCurrency(billing.amount)}</span></div>
          <div class="row"><strong>Discount</strong><span>${formatCurrency(billing.discount)}</span></div>
          <div class="row"><strong>Tax</strong><span>${formatCurrency(billing.tax)}</span></div>
          <div class="row total"><strong>Total Amount</strong><span>${formatCurrency(billing.totalAmount)}</span></div>
          <div class="row"><strong>Paid Amount</strong><span>${formatCurrency(billing.paidAmount)}</span></div>
          <div class="row due"><strong>Due Amount</strong><span>${formatCurrency(billing.dueAmount)}</span></div>
          <div class="row"><strong>Payment Method</strong><span>${billing.paymentMethod || "N/A"}</span></div>
          <div class="row"><strong>Payment Status</strong><span>${billing.paymentStatus || "N/A"}</span></div>
          <div class="row"><strong>Notes</strong><span>${billing.notes || "N/A"}</span></div>
        </div>
        <div class="footer">
          <p>Thank you for choosing HAMS Hospital.</p>
        </div>
        <script>
          window.onload = function(){window.print();}
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Billing & Payment
          </h2>
          <p className="text-gray-500 mt-1">
            Manage hospital bills and patient payments
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={loadBillingData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <MdRefresh />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-500 text-white hover:bg-lime-600 shadow-sm"
          >
            <MdAdd />
            Create Bill
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-lime-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Billing</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-2">
                {formatCurrency(statistics.total)}
              </h3>
              <p className="text-lime-600 text-sm mt-1">
                {billings.length} invoices
              </p>
            </div>
            <div className="bg-lime-100 p-3 rounded-lg text-lime-600">
              <MdAttachMoney className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Paid Amount</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-2">
                {formatCurrency(statistics.paid)}
              </h3>
              <p className="text-green-600 text-sm mt-1">
                Amount collected
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg text-green-600">
              <MdPayment className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Due Amount</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-2">
                {formatCurrency(statistics.due)}
              </h3>
              <p className="text-yellow-600 text-sm mt-1">
                Outstanding payments
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600">
              <MdReceiptLong className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Pending Bills</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-2">
                {statistics.pending}
              </h3>
              <p className="text-red-600 text-sm mt-1">
                Payment pending
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg text-red-600">
              <MdPeople className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoice, patient, doctor or service..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
          >
            <option value="ALL">All Payment Status</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Billing Records
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Bills stored in the HAMS backend database
            </p>
          </div>

          <span className="text-sm text-gray-500">
            {filteredBillings.length} record(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              Loading billing records...
            </div>
          ) : filteredBillings.length === 0 ? (
            <div className="py-12 text-center">
              <MdReceiptLong className="text-5xl text-gray-300 mx-auto" />
              <p className="text-gray-500 mt-3">
                No billing records found.
              </p>
              <button
                type="button"
                onClick={handleCreate}
                className="mt-4 px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600"
              >
                Create First Bill
              </button>
            </div>
          ) : (
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3">Invoice</th>
                  <th className="pb-3">Patient</th>
                  <th className="pb-3">Doctor</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Paid</th>
                  <th className="pb-3">Due</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBillings.map((billing) => (
                  <tr
                    key={billing.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 font-medium text-gray-800">
                      {billing.invoiceNumber || "N/A"}
                    </td>

                    <td className="py-4">
                      {getPatientName(billing.patientId)}
                    </td>

                    <td className="py-4">
                      {getDoctorName(billing.doctorId)}
                    </td>

                    <td className="py-4">
                      {billing.serviceName || "N/A"}
                    </td>

                    <td className="py-4">
                      {billing.billingDate || "N/A"}
                    </td>

                    <td className="py-4 font-semibold">
                      {formatCurrency(billing.totalAmount)}
                    </td>

                    <td className="py-4 text-green-600 font-medium">
                      {formatCurrency(billing.paidAmount)}
                    </td>

                    <td className="py-4 text-red-600 font-medium">
                      {formatCurrency(billing.dueAmount)}
                    </td>

                    <td className="py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                          billing.paymentStatus
                        )}`}
                      >
                        {billing.paymentStatus || "PENDING"}
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedBilling(billing)}
                          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                          title="View"
                        >
                          <MdReceiptLong />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(billing)}
                          className="p-2 rounded-lg text-lime-600 hover:bg-lime-50"
                          title="Edit"
                        >
                          <MdEdit />
                        </button>

                        <button
                          type="button"
                          onClick={() => printInvoice(billing)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                          title="Print"
                        >
                          <MdPrint />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(billing.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingId ? "Edit Billing Record" : "Create Billing Record"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Connect this bill to an existing patient, doctor and appointment
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Date
                  </label>
                  <input
                    type="date"
                    name="billingDate"
                    value={formData.billingDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service
                  </label>
                  <select
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
                  >
                    <option>Doctor Consultation</option>
                    <option>Follow-up Consultation</option>
                    <option>Emergency Consultation</option>
                    <option>Laboratory Service</option>
                    <option>Medical Procedure</option>
                    <option>Medicine</option>
                    <option>Other Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient
                  </label>
                  <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option
                        key={patient.patientId || patient.id}
                        value={patient.patientId || patient.id}
                      >
                        {`${patient.firstName || ""} ${patient.lastName || ""}`.trim() ||
                          patient.name ||
                          "Unknown Patient"}{" "}
                        - {patient.patientId || patient.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor
                  </label>
                  <select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option
                        key={doctor.id}
                        value={doctor.id}
                      >
                        {doctor.name?.startsWith("Dr.")
                          ? doctor.name
                          : `Dr. ${doctor.name || "Unknown Doctor"}`}{" "}
                        - {doctor.specialization || "General"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment
                  </label>
                  <select
                    name="appointmentId"
                    value={formData.appointmentId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
                  >
                    <option value="">No Appointment</option>
                    {appointments.map((appointment) => (
                      <option
                        key={appointment.id}
                        value={appointment.id}
                      >
                        #{appointment.id} - {appointment.date || "N/A"}{" "}
                        {appointment.time || ""} -{" "}
                        {getPatientName(
                          appointment.patientId ||
                          appointment?.patient?.patientId ||
                          appointment?.patient?.id
                        )}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Payment Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      name="discount"
                      min="0"
                      step="0.01"
                      value={formData.discount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax (₹)
                    </label>
                    <input
                      type="number"
                      name="tax"
                      min="0"
                      step="0.01"
                      value={formData.tax}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paid Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="paidAmount"
                      min="0"
                      step="0.01"
                      value={formData.paidAmount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {formatCurrency(calculateTotal)}
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                  <p className="text-sm text-green-600">Paid Amount</p>
                  <p className="text-2xl font-bold text-green-700 mt-1">
                    {formatCurrency(formData.paidAmount)}
                  </p>
                </div>

                <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                  <p className="text-sm text-red-600">Due Amount</p>
                  <p className="text-2xl font-bold text-red-700 mt-1">
                    {formatCurrency(calculateDue)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="NET_BANKING">Net Banking</option>
                    <option value="INSURANCE">Insurance</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Status
                  </label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="PAID">Paid</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-2">
                    Final status is calculated automatically from paid and due amounts.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Add billing or payment notes..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-3 rounded-lg bg-lime-500 text-white hover:bg-lime-600 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Bill"
                    : "Create Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedBilling && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Invoice Details
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedBilling.invoiceNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBilling(null)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-semibold text-gray-800 mt-1">
                    {getPatientName(selectedBilling.patientId)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Doctor</p>
                  <p className="font-semibold text-gray-800 mt-1">
                    {getDoctorName(selectedBilling.doctorId)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="font-semibold text-gray-800 mt-1">
                    {selectedBilling.serviceName || "N/A"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Billing Date</p>
                  <p className="font-semibold text-gray-800 mt-1">
                    {selectedBilling.billingDate || "N/A"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Appointment</p>
                  <p className="font-semibold text-gray-800 mt-1">
                    {getAppointmentLabel(selectedBilling.appointmentId)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-semibold text-gray-800 mt-1">
                    {selectedBilling.paymentMethod || "N/A"}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span>{formatCurrency(selectedBilling.amount)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span>{formatCurrency(selectedBilling.discount)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span>{formatCurrency(selectedBilling.tax)}</span>
                </div>

                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span>{formatCurrency(selectedBilling.totalAmount)}</span>
                </div>

                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Paid</span>
                  <span>{formatCurrency(selectedBilling.paidAmount)}</span>
                </div>

                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Due</span>
                  <span>{formatCurrency(selectedBilling.dueAmount)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                      selectedBilling.paymentStatus
                    )}`}
                  >
                    {selectedBilling.paymentStatus || "PENDING"}
                  </span>
                </div>
              </div>

              {selectedBilling.notes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-gray-700 mt-1">
                    {selectedBilling.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={() => printInvoice(selectedBilling)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  <MdPrint />
                  Print Invoice
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBilling(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billingandpayment;