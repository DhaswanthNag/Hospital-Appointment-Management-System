import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock3,
  Info,
  Loader2,
  RefreshCw,
  Stethoscope,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import PropTypes from "prop-types";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";

export default function Notifications({
  doctorId: dashboardDoctorId,
}) {
  const { user } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);

  const [doctorId, setDoctorId] = useState("");

  const [doctorName, setDoctorName] = useState("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /*
   * ============================================================
   * FIND LOGGED-IN DOCTOR
   * ============================================================
   */

  const loadDoctor = useCallback(async () => {
    try {
      /*
       * If DoctorDashboard already resolved the real
       * business doctor ID, use that ID first.
       */
      if (dashboardDoctorId) {
        const response = await api.get("/api/doctors");

        const doctors = Array.isArray(response.data)
          ? response.data
          : [];

        const matchedDoctor = doctors.find(
          (doctor) =>
            String(doctor.id) ===
              String(dashboardDoctorId) ||
            String(doctor.doctorId) ===
              String(dashboardDoctorId)
        );

        if (matchedDoctor) {
          const resolvedDoctorId =
            matchedDoctor.id ||
            matchedDoctor.doctorId;

          setDoctorId(String(resolvedDoctorId));

          setDoctorName(
            matchedDoctor.name ||
              "Doctor"
          );

          return String(resolvedDoctorId);
        }

        /*
         * If the dashboard ID could not be matched,
         * continue with the existing user-based lookup.
         */
      }

      const response = await api.get("/api/doctors");

      const doctors = Array.isArray(response.data)
        ? response.data
        : [];

      const loggedInDoctorId =
        user?.doctorId ||
        user?.id ||
        user?.username;

      const loggedInEmail =
        user?.email ||
        user?.username;

      let matchedDoctor = null;

      /*
       * First try to find doctor using doctorId.
       */
      if (loggedInDoctorId) {
        matchedDoctor = doctors.find(
          (doctor) =>
            String(doctor.id) ===
              String(loggedInDoctorId) ||
            String(doctor.doctorId) ===
              String(loggedInDoctorId)
        );
      }

      /*
       * If doctorId is not available,
       * try matching by email.
       */
      if (!matchedDoctor && loggedInEmail) {
        matchedDoctor = doctors.find(
          (doctor) =>
            doctor.email &&
            String(doctor.email).toLowerCase() ===
              String(loggedInEmail).toLowerCase()
        );
      }

      if (!matchedDoctor) {
        throw new Error(
          "Unable to identify the logged-in doctor."
        );
      }

      /*
       * Your Doctor entity uses id as the
       * business doctor ID such as DOC001.
       */
      const resolvedDoctorId =
        matchedDoctor.id ||
        matchedDoctor.doctorId;

      setDoctorId(
        String(resolvedDoctorId)
      );

      setDoctorName(
        matchedDoctor.name ||
          "Doctor"
      );

      return String(resolvedDoctorId);
    } catch (err) {
      console.error(
        "Unable to identify doctor:",
        err
      );

      throw err;
    }
  }, [user, dashboardDoctorId]);

  /*
   * ============================================================
   * LOAD NOTIFICATIONS
   * ============================================================
   */

  const loadNotifications = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const resolvedDoctorId =
          doctorId ||
          (await loadDoctor());

        const response = await api.get(
          `/api/notifications/doctor/${resolvedDoctorId}`
        );

        setNotifications(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (err) {
        console.error(
          "Unable to load doctor notifications:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load notifications. Please try again."
        );
      } finally {
        setLoading(false);

        setRefreshing(false);
      }
    },
    [doctorId, loadDoctor]
  );

  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  /*
   * ============================================================
   * MARK NOTIFICATION AS READ
   * ============================================================
   */

  const markAsRead = async (id) => {
    try {
      setError("");

      const response = await api.put(
        `/api/notifications/${id}/read`
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? response.data
            : notification
        )
      );
    } catch (err) {
      console.error(
        "Unable to mark notification as read:",
        err
      );

      setError(
        "Unable to update notification status."
      );
    }
  };

  /*
   * ============================================================
   * MARK ALL AS READ
   * ============================================================
   */

  const markAllAsRead = async () => {
    const unreadNotifications =
      notifications.filter(
        (notification) =>
          !notification.read
      );

    if (
      unreadNotifications.length === 0
    ) {
      return;
    }

    try {
      setError("");

      await Promise.all(
        unreadNotifications.map(
          (notification) =>
            api.put(
              `/api/notifications/${notification.id}/read`
            )
        )
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setSuccess(
        "All notifications marked as read."
      );
    } catch (err) {
      console.error(
        "Unable to mark all notifications as read:",
        err
      );

      setError(
        "Unable to update all notifications."
      );
    }
  };

  /*
   * ============================================================
   * DELETE NOTIFICATION
   * ============================================================
   */

  const deleteNotification = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/api/notifications/${id}`
      );

      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            notification.id !== id
        )
      );

      setSuccess(
        "Notification removed successfully."
      );
    } catch (err) {
      console.error(
        "Unable to delete notification:",
        err
      );

      setError(
        "Unable to delete notification."
      );
    }
  };

  /*
   * ============================================================
   * STATISTICS
   * ============================================================
   */

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.read
      ).length,
    [notifications]
  );

  const alertCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          String(
            notification.type || ""
          ).toUpperCase() === "ALERT"
      ).length,
    [notifications]
  );

  const warningCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          String(
            notification.type || ""
          ).toUpperCase() === "WARNING"
      ).length,
    [notifications]
  );

  /*
   * ============================================================
   * NOTIFICATION TYPE CONFIGURATION
   * ============================================================
   */

  const getTypeConfig = (type) => {
    const normalizedType =
      String(
        type || "INFO"
      ).toUpperCase();

    switch (normalizedType) {
      case "SUCCESS":
        return {
          icon: CheckCircle2,
          iconClass: "text-lime-600",
          bgClass: "bg-lime-50",
          borderClass:
            "border-lime-200",
          badgeClass:
            "bg-lime-100 text-lime-700",
          label: "Success",
        };

      case "WARNING":
        return {
          icon: AlertCircle,
          iconClass: "text-amber-600",
          bgClass: "bg-amber-50",
          borderClass:
            "border-amber-200",
          badgeClass:
            "bg-amber-100 text-amber-700",
          label: "Warning",
        };

      case "ALERT":
        return {
          icon: XCircle,
          iconClass: "text-red-600",
          bgClass: "bg-red-50",
          borderClass:
            "border-red-200",
          badgeClass:
            "bg-red-100 text-red-700",
          label: "Alert",
        };

      default:
        return {
          icon: Info,
          iconClass: "text-lime-600",
          bgClass: "bg-lime-50",
          borderClass:
            "border-lime-200",
          badgeClass:
            "bg-lime-100 text-lime-700",
          label: "Information",
        };
    }
  };

  /*
   * ============================================================
   * FORMAT DATE
   * ============================================================
   */

  const formatDate = (value) => {
    if (!value) {
      return "Unknown date";
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /*
   * ============================================================
   * LOADING STATE
   * ============================================================
   */

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-lime-100 flex items-center justify-center">
            <Loader2
              className="text-lime-600 animate-spin"
              size={27}
            />
          </div>

          <p className="text-sm text-gray-500">
            Loading your notifications...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * MAIN UI
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* ============================================================
            HEADER
        ============================================================ */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">
          <div className="flex items-center gap-4">

            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-lime-100 flex items-center justify-center shadow-sm">
                <Bell
                  className="text-lime-600"
                  size={28}
                />
              </div>

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-lime-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-gray-50">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Notifications & Alerts
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Stay updated with important messages and patient-related alerts.
              </p>

              {doctorId && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-lime-50 text-lime-700 text-xs font-semibold">
                    <Stethoscope size={13} />

                    {doctorName}
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold">
                    {doctorId}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-600 text-white font-semibold text-sm shadow-sm transition"
              >
                <CheckCircle2 size={17} />

                Mark All Read
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                loadNotifications(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium shadow-sm hover:border-lime-300 hover:text-lime-700 transition disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>
        </div>

        {/* ============================================================
            ALERT MESSAGES
        ============================================================ */}

        {error && (
          <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <p className="text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-lime-50 border border-lime-200 text-lime-700">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0"
            />

            <p className="text-sm font-medium">
              {success}
            </p>
          </div>
        )}

        {/* ============================================================
            STAT CARDS
        ============================================================ */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          {/* Total */}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Notifications
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {notifications.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-lime-50 flex items-center justify-center">
                <Bell
                  size={21}
                  className="text-lime-600"
                />
              </div>
            </div>
          </div>

          {/* Unread */}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Unread
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {unreadCount}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <Bell
                  size={21}
                  className="text-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Alerts */}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Critical Alerts
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {alertCount}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertCircle
                  size={21}
                  className="text-red-600"
                />
              </div>
            </div>
          </div>

          {/* Warnings */}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Warnings
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {warningCount}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertCircle
                  size={21}
                  className="text-amber-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            NOTIFICATION CONTENT
        ============================================================ */}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Header */}

          <div className="p-5 md:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Your Notifications
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Notifications assigned specifically to{" "}
                  {doctorId ||
                    "your doctor account"}.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-lime-50 text-lime-700 text-xs font-semibold w-fit">
                <UserRound size={14} />

                Doctor ID:{" "}
                {doctorId || "Loading"}
              </div>
            </div>
          </div>

          {/* Notification List */}

          {notifications.length === 0 ? (
            <div className="p-12 text-center">

              <div className="w-16 h-16 rounded-2xl bg-lime-50 flex items-center justify-center mx-auto mb-5">
                <Bell
                  size={28}
                  className="text-lime-500"
                />
              </div>

              <h3 className="text-lg font-bold text-gray-700">
                No notifications
              </h3>

              <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                You currently don&apos;t have any notifications. New alerts from the hospital administration will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">

              {notifications.map(
                (notification) => {
                  const config =
                    getTypeConfig(
                      notification.type
                    );

                  const TypeIcon =
                    config.icon;

                  return (
                    <div
                      key={
                        notification.id
                      }
                      className={`p-5 md:p-6 transition hover:bg-gray-50 ${
                        !notification.read
                          ? "bg-lime-50/30"
                          : ""
                      }`}
                    >
                      <div className="flex gap-4">

                        {/* Notification Icon */}

                        <div
                          className={`w-12 h-12 rounded-xl ${config.bgClass} ${config.borderClass} border flex items-center justify-center shrink-0`}
                        >
                          <TypeIcon
                            size={21}
                            className={
                              config.iconClass
                            }
                          />
                        </div>

                        {/* Notification Content */}

                        <div className="flex-1 min-w-0">

                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">

                            <div>

                              <div className="flex flex-wrap items-center gap-2">

                                <h3 className="text-base font-bold text-gray-800">
                                  {
                                    notification.title
                                  }
                                </h3>

                                {!notification.read && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-lime-100 text-lime-700 text-[10px] font-bold uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />

                                    New
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 mt-2">

                                <span
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${config.badgeClass}`}
                                >
                                  {config.label}
                                </span>

                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold">

                                  <UserRound
                                    size={12}
                                  />

                                  Patient ID:

                                  <span className="font-bold">
                                    {notification.patientId ||
                                      notification
                                        .metadata
                                        ?.patientId ||
                                      "Not specified"}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Message */}

                          <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-4">

                            <p className="text-sm text-gray-600 leading-6 whitespace-pre-wrap">
                              {
                                notification.message
                              }
                            </p>
                          </div>

                          {/* Footer */}

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">

                            <div className="flex items-center gap-1.5 text-xs text-gray-400">

                              <Clock3
                                size={14}
                              />

                              {formatDate(
                                notification.createdAt
                              )}
                            </div>

                            <div className="flex items-center gap-2">

                              {!notification.read && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    markAsRead(
                                      notification.id
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-lime-700 bg-lime-50 hover:bg-lime-100 transition"
                                >
                                  <CheckCircle2
                                    size={14}
                                  />

                                  Mark as Read
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  deleteNotification(
                                    notification.id
                                  )
                                }
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Delete notification"
                              >
                                <Trash2
                                  size={16}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Notifications.propTypes = {
  doctorId: PropTypes.string,
};