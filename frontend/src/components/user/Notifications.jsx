// import React, {
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import PropTypes from "prop-types";

// import {
//   AlertCircle,
//   Bell,
//   CheckCircle2,
//   Clock3,
//   Info,
//   Loader2,
//   RefreshCw,
//   Stethoscope,
//   Trash2,
//   UserRound,
//   XCircle,
// } from "lucide-react";

// import { AuthContext } from "../../context/AuthContext";
// import api from "../../api/api";

// export default function Notifications({
//   patientId: dashboardPatientId,
// }) {
//   const { user } = useContext(AuthContext);

//   const [notifications, setNotifications] = useState([]);

//   const [resolvedPatientId, setResolvedPatientId] = useState(
//     dashboardPatientId ? String(dashboardPatientId) : ""
//   );

//   const [patientName, setPatientName] = useState("");

//   const [loading, setLoading] = useState(true);

//   const [refreshing, setRefreshing] = useState(false);

//   const [actionLoading, setActionLoading] = useState(false);

//   const [error, setError] = useState("");

//   /*
//    * ============================================================
//    * FIND LOGGED-IN PATIENT
//    * ============================================================
//    */

//   const loadPatient = useCallback(async () => {
//     try {
//       /*
//        * If UserDashboard already resolved the real
//        * business patient ID, use that ID first.
//        *
//        * HAMS patient IDs are strings such as:
//        * PAT001, PAT002, PAT005, etc.
//        */
//       if (dashboardPatientId) {
//         const response = await api.get("/api/patients");

//         const patients = Array.isArray(response.data)
//           ? response.data
//           : [];

//         const matchedPatient = patients.find(
//           (patient) =>
//             String(patient.id) ===
//               String(dashboardPatientId) ||
//             String(patient.patientId) ===
//               String(dashboardPatientId)
//         );

//         if (matchedPatient) {
//           const resolvedId =
//             matchedPatient.id ||
//             matchedPatient.patientId;

//           setResolvedPatientId(
//             String(resolvedId)
//           );

//           setPatientName(
//             matchedPatient.name ||
//               matchedPatient.fullName ||
//               [
//                 matchedPatient.firstName,
//                 matchedPatient.lastName,
//               ]
//                 .filter(Boolean)
//                 .join(" ") ||
//               "Patient"
//           );

//           return String(resolvedId);
//         }

//         /*
//          * If the dashboard ID could not be matched,
//          * continue with the existing user-based lookup.
//          */
//       }

//       /*
//        * Load all patients for user-based identification.
//        */
//       const response = await api.get("/api/patients");

//       const patients = Array.isArray(response.data)
//         ? response.data
//         : [];

//       /*
//        * Try patient ID from logged-in user first.
//        */
//       const loggedInPatientId =
//         user?.patientId ||
//         user?.id ||
//         user?.userId ||
//         user?.username;

//       /*
//        * Try email/username as another identifier.
//        */
//       const loggedInEmail =
//         user?.email ||
//         user?.username;

//       let matchedPatient = null;

//       /*
//        * First try to find patient using patient ID.
//        */
//       if (loggedInPatientId) {
//         matchedPatient = patients.find(
//           (patient) =>
//             String(patient.id) ===
//               String(loggedInPatientId) ||
//             String(patient.patientId) ===
//               String(loggedInPatientId)
//         );
//       }

//       /*
//        * If patient ID is not available,
//        * try matching by email.
//        */
//       if (!matchedPatient && loggedInEmail) {
//         matchedPatient = patients.find(
//           (patient) =>
//             patient.email &&
//             String(patient.email)
//               .trim()
//               .toLowerCase() ===
//               String(loggedInEmail)
//                 .trim()
//                 .toLowerCase()
//         );
//       }

//       /*
//        * If still not found, try username.
//        */
//       if (!matchedPatient && user?.username) {
//         matchedPatient = patients.find(
//           (patient) =>
//             patient.username &&
//             String(patient.username)
//               .trim()
//               .toLowerCase() ===
//               String(user.username)
//                 .trim()
//                 .toLowerCase()
//         );
//       }

//       if (!matchedPatient) {
//         throw new Error(
//           "Unable to identify the logged-in patient."
//         );
//       }

//       /*
//        * Your HAMS Patient entity uses id/patientId
//        * as the business patient ID such as PAT001.
//        */
//       const resolvedId =
//         matchedPatient.patientId ||
//         matchedPatient.id;

//       if (!resolvedId) {
//         throw new Error(
//           "Patient record does not contain a valid patient ID."
//         );
//       }

//       setResolvedPatientId(
//         String(resolvedId)
//       );

//       setPatientName(
//         matchedPatient.name ||
//           matchedPatient.fullName ||
//           [
//             matchedPatient.firstName,
//             matchedPatient.lastName,
//           ]
//             .filter(Boolean)
//             .join(" ") ||
//           "Patient"
//       );

//       return String(resolvedId);
//     } catch (err) {
//       console.error(
//         "Unable to identify patient:",
//         err
//       );

//       throw err;
//     }
//   }, [user, dashboardPatientId]);

//   /*
//    * ============================================================
//    * LOAD NOTIFICATIONS
//    * ============================================================
//    */

//   const loadNotifications = useCallback(
//     async (showRefresh = false) => {
//       try {
//         if (showRefresh) {
//           setRefreshing(true);
//         } else {
//           setLoading(true);
//         }

//         setError("");

//         /*
//          * Use the already resolved patient ID.
//          * If it is not available yet, resolve it first.
//          */
//         const patientBusinessId =
//           resolvedPatientId ||
//           (await loadPatient());

//         if (!patientBusinessId) {
//           throw new Error(
//             "Patient ID is not available."
//           );
//         }

//         console.log(
//           "User Notifications - Fetching notifications for patient:",
//           patientBusinessId
//         );

//         const response = await api.get(
//           `/api/notifications/patient/${encodeURIComponent(
//             patientBusinessId
//           )}`
//         );

//         const data = Array.isArray(response.data)
//           ? response.data
//           : [];

//         console.log(
//           "User Notifications - Notifications received:",
//           data
//         );

//         setNotifications(data);

//         /*
//          * Make sure the state also contains the ID
//          * returned by loadPatient().
//          */
//         setResolvedPatientId(
//           String(patientBusinessId)
//         );
//       } catch (err) {
//         console.error(
//           "Unable to load patient notifications:",
//           err
//         );

//         console.error(
//           "User Notifications - API response:",
//           err?.response?.data
//         );

//         setError(
//           err?.response?.data?.message ||
//             err?.message ||
//             "Unable to load notifications. Please try again."
//         );
//       } finally {
//         setLoading(false);
//         setRefreshing(false);
//       }
//     },
//     [resolvedPatientId, loadPatient]
//   );

//   /*
//    * ============================================================
//    * INITIAL LOAD
//    * ============================================================
//    */

//   useEffect(() => {
//     loadNotifications();
//   }, [loadNotifications]);

//   /*
//    * ============================================================
//    * KEEP PATIENT ID SYNCHRONIZED WITH USER DASHBOARD
//    * ============================================================
//    */

//   useEffect(() => {
//     if (!dashboardPatientId) {
//       return;
//     }

//     const newPatientId =
//       String(dashboardPatientId);

//     if (newPatientId !== resolvedPatientId) {
//       setResolvedPatientId(newPatientId);
//     }
//   }, [
//     dashboardPatientId,
//     resolvedPatientId,
//   ]);

//   /*
//    * ============================================================
//    * AUTOMATIC REFRESH
//    * ============================================================
//    *
//    * If Admin creates a new notification for this patient,
//    * the User Notification panel will automatically check
//    * for it every 5 seconds.
//    */

//   useEffect(() => {
//     if (!resolvedPatientId) {
//       return;
//     }

//     const interval = setInterval(() => {
//       loadNotifications(true);
//     }, 5000);

//     return () => {
//       clearInterval(interval);
//     };
//   }, [
//     resolvedPatientId,
//     loadNotifications,
//   ]);

//   /*
//    * ============================================================
//    * MARK NOTIFICATION AS READ
//    * ============================================================
//    */

//   const markAsRead = async (notificationId) => {
//     try {
//       setActionLoading(true);
//       setError("");

//       const response = await api.put(
//         `/api/notifications/${notificationId}/read`
//       );

//       const updatedNotification =
//         response.data;

//       setNotifications(
//         (currentNotifications) =>
//           currentNotifications.map(
//             (notification) =>
//               notification.id ===
//               notificationId
//                 ? updatedNotification
//                 : notification
//           )
//       );
//     } catch (err) {
//       console.error(
//         "Unable to mark notification as read:",
//         err
//       );

//       setError(
//         "Unable to update notification."
//       );
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /*
//    * ============================================================
//    * MARK ALL AS READ
//    * ============================================================
//    */

//   const markAllAsRead = async () => {
//     const unreadNotifications =
//       notifications.filter(
//         (notification) =>
//           !notification.read
//       );

//     if (
//       unreadNotifications.length === 0
//     ) {
//       return;
//     }

//     try {
//       setActionLoading(true);
//       setError("");

//       await Promise.all(
//         unreadNotifications.map(
//           (notification) =>
//             api.put(
//               `/api/notifications/${notification.id}/read`
//             )
//         )
//       );

//       setNotifications(
//         (currentNotifications) =>
//           currentNotifications.map(
//             (notification) => ({
//               ...notification,
//               read: true,
//             })
//           )
//       );
//     } catch (err) {
//       console.error(
//         "Unable to mark all notifications as read:",
//         err
//       );

//       setError(
//         "Unable to mark all notifications as read."
//       );
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /*
//    * ============================================================
//    * DELETE NOTIFICATION
//    * ============================================================
//    */

//   const deleteNotification = async (
//     notificationId
//   ) => {
//     const confirmed = window.confirm(
//       "Are you sure you want to delete this notification?"
//     );

//     if (!confirmed) {
//       return;
//     }

//     try {
//       setActionLoading(true);
//       setError("");

//       await api.delete(
//         `/api/notifications/${notificationId}`
//       );

//       setNotifications(
//         (currentNotifications) =>
//           currentNotifications.filter(
//             (notification) =>
//               notification.id !==
//               notificationId
//           )
//       );
//     } catch (err) {
//       console.error(
//         "Unable to delete notification:",
//         err
//       );

//       setError(
//         "Unable to delete notification."
//       );
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /*
//    * ============================================================
//    * NOTIFICATION STATISTICS
//    * ============================================================
//    */

//   const stats = useMemo(() => {
//     const total =
//       notifications.length;

//     const unread =
//       notifications.filter(
//         (notification) =>
//           !notification.read
//       ).length;

//     const alerts =
//       notifications.filter(
//         (notification) =>
//           String(
//             notification.type || ""
//           ).toUpperCase() === "ALERT"
//       ).length;

//     const warnings =
//       notifications.filter(
//         (notification) =>
//           String(
//             notification.type || ""
//           ).toUpperCase() === "WARNING"
//       ).length;

//     return {
//       total,
//       unread,
//       alerts,
//       warnings,
//     };
//   }, [notifications]);

//   /*
//    * ============================================================
//    * NOTIFICATION ICON
//    * ============================================================
//    */

//   const getNotificationIcon = (
//     type
//   ) => {
//     const notificationType =
//       String(
//         type || "INFO"
//       ).toUpperCase();

//     if (
//       notificationType ===
//       "SUCCESS"
//     ) {
//       return (
//         <CheckCircle2 className="w-5 h-5" />
//       );
//     }

//     if (
//       notificationType ===
//       "WARNING"
//     ) {
//       return (
//         <AlertCircle className="w-5 h-5" />
//       );
//     }

//     if (
//       notificationType ===
//       "ALERT"
//     ) {
//       return (
//         <XCircle className="w-5 h-5" />
//       );
//     }

//     return (
//       <Info className="w-5 h-5" />
//     );
//   };

//   /*
//    * ============================================================
//    * NOTIFICATION STYLING
//    * ============================================================
//    */

//   const getNotificationStyle = (
//     type
//   ) => {
//     const notificationType =
//       String(
//         type || "INFO"
//       ).toUpperCase();

//     if (
//       notificationType ===
//       "SUCCESS"
//     ) {
//       return {
//         icon:
//           "bg-lime-100 text-lime-600",
//         badge:
//           "bg-lime-100 text-lime-700",
//       };
//     }

//     if (
//       notificationType ===
//       "WARNING"
//     ) {
//       return {
//         icon:
//           "bg-yellow-100 text-yellow-600",
//         badge:
//           "bg-yellow-100 text-yellow-700",
//       };
//     }

//     if (
//       notificationType ===
//       "ALERT"
//     ) {
//       return {
//         icon:
//           "bg-red-100 text-red-600",
//         badge:
//           "bg-red-100 text-red-700",
//       };
//     }

//     return {
//       icon:
//         "bg-lime-100 text-lime-600",
//       badge:
//         "bg-lime-100 text-lime-700",
//     };
//   };

//   /*
//    * ============================================================
//    * FORMAT NOTIFICATION DATE AND TIME
//    * ============================================================
//    */

//   const formatDateTime = (
//     createdAt
//   ) => {
//     if (!createdAt) {
//       return "Date not available";
//     }

//     const date =
//       new Date(createdAt);

//     if (
//       Number.isNaN(
//         date.getTime()
//       )
//     ) {
//       return String(createdAt);
//     }

//     return date.toLocaleString(
//       "en-IN",
//       {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       }
//     );
//   };

//   /*
//    * ============================================================
//    * LOADING STATE
//    * ============================================================
//    */

//   if (loading) {
//     return (
//       <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-14 h-14 rounded-2xl bg-lime-100 flex items-center justify-center">
//             <Loader2
//               className="text-lime-600 animate-spin"
//               size={27}
//             />
//           </div>

//           <p className="text-sm text-gray-500">
//             Loading your notifications...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   /*
//    * ============================================================
//    * MAIN UI
//    * ============================================================
//    */

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">

//         {/* ============================================================
//             HEADER
//         ============================================================ */}

//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">
//           <div className="flex items-center gap-4">

//             <div className="relative">
//               <div className="w-14 h-14 rounded-2xl bg-lime-100 flex items-center justify-center shadow-sm">
//                 <Bell
//                   className="text-lime-600"
//                   size={28}
//                 />
//               </div>

//               {stats.unread > 0 && (
//                 <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-lime-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-gray-50">
//                   {stats.unread > 99
//                     ? "99+"
//                     : stats.unread}
//                 </span>
//               )}
//             </div>

//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
//                 Notifications & Alerts
//               </h1>

//               <p className="text-sm text-gray-500 mt-1">
//                 {patientName
//                   ? `Notifications for ${patientName}`
//                   : resolvedPatientId
//                     ? `Patient ID: ${resolvedPatientId}`
//                     : "Your latest notifications and alerts"}
//               </p>

//               {resolvedPatientId && (
//                 <div className="flex items-center gap-2 mt-2">
//                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-lime-50 text-lime-700 text-xs font-semibold">
//                     <UserRound size={13} />

//                     {patientName ||
//                       "Patient"}
//                   </span>

//                   <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold">
//                     {resolvedPatientId}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="flex items-center gap-2">

//             {stats.unread > 0 && (
//               <button
//                 type="button"
//                 onClick={
//                   markAllAsRead
//                 }
//                 disabled={
//                   actionLoading
//                 }
//                 className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-lime-600 hover:bg-lime-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-60"
//               >
//                 <CheckCircle2 size={17} />

//                 Mark All Read
//               </button>
//             )}

//             <button
//               type="button"
//               onClick={() =>
//                 loadNotifications(
//                   true
//                 )
//               }
//               disabled={
//                 refreshing
//               }
//               className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium shadow-sm hover:border-lime-300 hover:text-lime-700 transition disabled:opacity-60"
//             >
//               <RefreshCw
//                 size={17}
//                 className={
//                   refreshing
//                     ? "animate-spin"
//                     : ""
//                 }
//               />

//               Refresh
//             </button>
//           </div>
//         </div>

//         {/* ============================================================
//             ERROR MESSAGE
//         ============================================================ */}

//         {error && (
//           <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
//             <AlertCircle
//               size={20}
//               className="mt-0.5 shrink-0"
//             />

//             <p className="text-sm font-medium">
//               {error}
//             </p>

//             <button
//               type="button"
//               onClick={() =>
//                 setError("")
//               }
//               className="ml-auto text-red-500 hover:text-red-700"
//             >
//               <XCircle size={20} />
//             </button>
//           </div>
//         )}

//         {/* ============================================================
//             STATISTICS
//         ============================================================ */}

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

//           {/* Total */}

//           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">
//                   Total Notifications
//                 </p>

//                 <p className="text-2xl font-bold text-gray-800 mt-1">
//                   {stats.total}
//                 </p>
//               </div>

//               <div className="w-11 h-11 rounded-xl bg-lime-50 flex items-center justify-center">
//                 <Bell
//                   size={21}
//                   className="text-lime-600"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Unread */}

//           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">
//                   Unread
//                 </p>

//                 <p className="text-2xl font-bold text-gray-800 mt-1">
//                   {stats.unread}
//                 </p>
//               </div>

//               <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
//                 <Bell
//                   size={21}
//                   className="text-orange-600"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Alerts */}

//           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">
//                   Alerts
//                 </p>

//                 <p className="text-2xl font-bold text-gray-800 mt-1">
//                   {stats.alerts}
//                 </p>
//               </div>

//               <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
//                 <AlertCircle
//                   size={21}
//                   className="text-red-600"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Warnings */}

//           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">
//                   Warnings
//                 </p>

//                 <p className="text-2xl font-bold text-gray-800 mt-1">
//                   {stats.warnings}
//                 </p>
//               </div>

//               <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center">
//                 <AlertCircle
//                   size={21}
//                   className="text-yellow-600"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ============================================================
//             NOTIFICATION CONTENT
//         ============================================================ */}

//         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

//           {/* Header */}

//           <div className="p-5 md:p-6 border-b border-gray-100">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

//               <div>
//                 <h2 className="text-lg font-bold text-gray-800">
//                   Your Notifications
//                 </h2>

//                 <p className="text-sm text-gray-500 mt-1">
//                   Notifications assigned specifically to{" "}
//                   {resolvedPatientId ||
//                     "your patient account"}.
//                 </p>
//               </div>

//               <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-lime-50 text-lime-700 text-xs font-semibold w-fit">
//                 <UserRound size={14} />

//                 Patient ID:{" "}
//                 {resolvedPatientId ||
//                   "Loading"}
//               </div>
//             </div>
//           </div>

//           {/* Notification List */}

//           {notifications.length === 0 ? (
//             <div className="p-12 text-center">

//               <div className="w-16 h-16 rounded-2xl bg-lime-50 flex items-center justify-center mx-auto mb-5">
//                 <Bell
//                   size={28}
//                   className="text-lime-500"
//                 />
//               </div>

//               <h3 className="text-lg font-bold text-gray-700">
//                 No notifications
//               </h3>

//               <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
//                 You currently don&apos;t have any notifications. New alerts from the hospital administration will appear here.
//               </p>
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-100">

//               {notifications.map(
//                 (notification) => {
//                   const style =
//                     getNotificationStyle(
//                       notification.type
//                     );

//                   const notificationType =
//                     String(
//                       notification.type ||
//                         "INFO"
//                     ).toUpperCase();

//                   return (
//                     <div
//                       key={
//                         notification.id
//                       }
//                       className={`p-5 md:p-6 transition hover:bg-gray-50 ${
//                         !notification.read
//                           ? "bg-lime-50/30"
//                           : ""
//                       }`}
//                     >
//                       <div className="flex gap-4">

//                         {/* Notification Icon */}

//                         <div
//                           className={`p-3 rounded-xl h-fit shrink-0 ${style.icon}`}
//                         >
//                           {getNotificationIcon(
//                             notification.type
//                           )}
//                         </div>

//                         {/* Notification Content */}

//                         <div className="flex-1 min-w-0">

//                           <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">

//                             <div>

//                               <div className="flex flex-wrap items-center gap-2">

//                                 <h3 className="text-base font-bold text-gray-800">
//                                   {notification.title ||
//                                     "Notification"}
//                                 </h3>

//                                 {!notification.read && (
//                                   <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-lime-100 text-lime-700 text-[10px] font-bold uppercase">
//                                     <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />

//                                     New
//                                   </span>
//                                 )}

//                                 <span
//                                   className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${style.badge}`}
//                                 >
//                                   {notificationType}
//                                 </span>
//                               </div>

//                               <p className="mt-2 text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
//                                 {
//                                   notification.message
//                                 }
//                               </p>
//                             </div>
//                           </div>

//                           {/* Notification Metadata */}

//                           <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs text-gray-500">

//                             <span className="flex items-center gap-1.5">
//                               <Clock3 className="w-3.5 h-3.5" />

//                               {formatDateTime(
//                                 notification.createdAt
//                               )}
//                             </span>

//                             {resolvedPatientId && (
//                               <span className="flex items-center gap-1.5">
//                                 <UserRound className="w-3.5 h-3.5" />

//                                 Patient:{" "}
//                                 {
//                                   resolvedPatientId
//                                 }
//                               </span>
//                             )}

//                             {notification.doctorId && (
//                               <span className="flex items-center gap-1.5">
//                                 <Stethoscope className="w-3.5 h-3.5" />

//                                 Doctor:{" "}
//                                 {
//                                   notification.doctorId
//                                 }
//                               </span>
//                             )}

//                             {notification.appointmentId && (
//                               <span>
//                                 Appointment:{" "}
//                                 {
//                                   notification.appointmentId
//                                 }
//                               </span>
//                             )}
//                           </div>

//                           {/* Actions */}

//                           <div className="flex items-center justify-end gap-2 mt-4">

//                             {!notification.read && (
//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   markAsRead(
//                                     notification.id
//                                   )
//                                 }
//                                 disabled={
//                                   actionLoading
//                                 }
//                                 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-lime-700 bg-lime-50 hover:bg-lime-100 transition disabled:opacity-50"
//                               >
//                                 <CheckCircle2
//                                   size={14}
//                                 />

//                                 Mark as Read
//                               </button>
//                             )}

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 deleteNotification(
//                                   notification.id
//                                 )
//                               }
//                               disabled={
//                                 actionLoading
//                               }
//                               className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
//                               title="Delete notification"
//                             >
//                               <Trash2
//                                 size={16}
//                               />
//                             </button>
//                           </div>

//                         </div>
//                       </div>
//                     </div>
//                   );
//                 }
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// Notifications.propTypes = {
//   patientId: PropTypes.string,
// };
