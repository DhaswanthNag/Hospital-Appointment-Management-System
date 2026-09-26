import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Receipt,
  Search,
  RefreshCw,
  IndianRupee,
  Clock,
  CheckCircle,
  Eye
} from "lucide-react";
import PropTypes from "prop-types";
import api from "../../api/api";

const Billingandpayment = ({ patientId }) => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBilling, setSelectedBilling] = useState(null);

  const loadBillings = useCallback(async (showLoading = false) => {
    if (!patientId) {
      setBillings([]);
      setError("Patient information is not available.");
      setLoading(false);
      return;
    }

    if (showLoading) {
      setLoading(true);
    }

    try {
      setError("");

      console.log(
        "Billingandpayment - Fetching billing for patient:",
        patientId
      );

      const response = await api.get(
        `/api/billing/patient/${patientId}`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      console.log(
        "Billingandpayment - Billing records received:",
        data
      );

      setBillings(data);

      setSelectedBilling((currentBilling) => {
        if (!currentBilling) {
          return null;
        }

        const updatedBilling = data.find(
          (billing) =>
            String(billing.id) === String(currentBilling.id)
        );

        return updatedBilling || null;
      });
    } catch (err) {
      console.error(
        "Billingandpayment - Failed to load billing records:",
        err
      );

      console.error(
        "Billingandpayment - API response:",
        err?.response?.data
      );

      setBillings([]);

      setError(
        err?.response?.data?.message ||
          "Could not load your billing information."
      );
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadBillings(true);
  }, [loadBillings]);

  // Automatically refresh billing information every 5 seconds
  // so payment status changes made by admin appear automatically.
  useEffect(() => {
    if (!patientId) {
      return;
    }

    const interval = setInterval(() => {
      loadBillings(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [patientId, loadBillings]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadBillings(false);
    } finally {
      setRefreshing(false);
    }
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
      return new Date(`${date}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );
    } catch {
      return date;
    }
  };

  const getStatusClass = (status) => {
    const normalizedStatus = String(status || "").toUpperCase();

    switch (normalizedStatus) {
      case "PAID":
        return "bg-green-100 text-green-700";

      case "PARTIAL":
        return "bg-yellow-100 text-yellow-700";

      case "PENDING":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredBillings = useMemo(() => {
    let filtered = [...billings];

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      filtered = filtered.filter((billing) => {
        const invoiceNumber = String(
          billing.invoiceNumber || ""
        ).toLowerCase();

        const serviceName = String(
          billing.serviceName || ""
        ).toLowerCase();

        const status = String(
          billing.paymentStatus || ""
        ).toLowerCase();

        return (
          invoiceNumber.includes(search) ||
          serviceName.includes(search) ||
          status.includes(search)
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (billing) =>
          String(billing.paymentStatus || "").toUpperCase() ===
          statusFilter
      );
    }

    return filtered;
  }, [billings, searchTerm, statusFilter]);

  const statistics = useMemo(() => {
    const total = billings.reduce(
      (sum, billing) =>
        sum + Number(billing.totalAmount || 0),
      0
    );

    const paid = billings.reduce(
      (sum, billing) =>
        sum + Number(billing.paidAmount || 0),
      0
    );

    const due = billings.reduce(
      (sum, billing) =>
        sum + Number(billing.dueAmount || 0),
      0
    );

    const pending = billings.filter(
      (billing) =>
        String(billing.paymentStatus || "").toUpperCase() ===
        "PENDING"
    ).length;

    return {
      total,
      paid,
      due,
      pending
    };
  }, [billings]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Payments & Billing
          </h1>

          <p className="text-gray-500 mt-1">
            View your billing and payment history.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <RefreshCw className="w-8 h-8 text-lime-600 animate-spin mx-auto" />

          <p className="text-gray-500 mt-3">
            Loading your billing information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Payments & Billing
          </h1>

          <p className="text-gray-500 mt-1">
            View your billing and payment history.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-lime-500 text-white rounded-lg font-medium hover:bg-lime-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw
            size={18}
            className={refreshing ? "animate-spin" : ""}
          />

          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
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

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
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

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
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

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
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

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search invoice or service..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
          >
            <option value="all">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            My Billing Records
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {filteredBillings.length} billing record
            {filteredBillings.length !== 1 ? "s" : ""}
          </p>
        </div>

        {filteredBillings.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto" />

            <h3 className="font-semibold text-gray-700 mt-3">
              No billing records found
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Billing records created for you will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Invoice
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
                {filteredBillings.map((billing) => (
                  <tr
                    key={billing.id}
                    className="hover:bg-lime-50/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="font-semibold text-gray-800">
                        {billing.invoiceNumber ||
                          `INV-${billing.id}`}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-gray-800">
                        {billing.serviceName ||
                          "Medical Service"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(billing.billingDate)}
                    </td>

                    <td className="px-5 py-4 text-right font-semibold text-gray-800">
                      {formatCurrency(
                        billing.totalAmount
                      )}
                    </td>

                    <td className="px-5 py-4 text-right font-medium text-green-600">
                      {formatCurrency(
                        billing.paidAmount
                      )}
                    </td>

                    <td className="px-5 py-4 text-right font-medium text-red-600">
                      {formatCurrency(
                        billing.dueAmount
                      )}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                          billing.paymentStatus
                        )}`}
                      >
                        {billing.paymentStatus ||
                          "PENDING"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedBilling(billing)
                        }
                        className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-lime-600 hover:bg-lime-50 transition-colors"
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

      {selectedBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
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
                type="button"
                onClick={() => setSelectedBilling(null)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase">
                    Patient ID
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {selectedBilling.patientId}
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase">
                    Doctor ID
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {selectedBilling.doctorId ||
                      "Not specified"}
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
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">
                      Service
                    </span>

                    <span className="font-medium text-gray-800 text-right">
                      {selectedBilling.serviceName ||
                        "Medical Service"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">
                      Billing Date
                    </span>

                    <span className="font-medium text-gray-800">
                      {formatDate(
                        selectedBilling.billingDate
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Amount
                    </span>

                    <span className="font-medium text-gray-800">
                      {formatCurrency(
                        selectedBilling.amount
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Discount
                    </span>

                    <span className="font-medium text-gray-800">
                      -{" "}
                      {formatCurrency(
                        selectedBilling.discount
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Tax
                    </span>

                    <span className="font-medium text-gray-800">
                      {formatCurrency(
                        selectedBilling.tax
                      )}
                    </span>
                  </div>

                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold text-gray-800">
                      Total Amount
                    </span>

                    <span className="font-bold text-gray-800">
                      {formatCurrency(
                        selectedBilling.totalAmount
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Paid Amount
                    </span>

                    <span className="font-semibold text-green-600">
                      {formatCurrency(
                        selectedBilling.paidAmount
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Due Amount
                    </span>

                    <span className="font-semibold text-red-600">
                      {formatCurrency(
                        selectedBilling.dueAmount
                      )}
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

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBilling(null)}
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

Billingandpayment.propTypes = {
  patientId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ])
};

export default Billingandpayment;