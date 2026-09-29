import React, { 
  useCallback, 
  useEffect, 
  useMemo, 
  useState, 
} from "react"; 
 
import { 
  AlertCircle, 
  Bell, 
  CheckCircle2, 
  ChevronDown, 
  Clock3, 
  Info, 
  Loader2, 
  MessageSquare, 
  RefreshCw, 
  Send, 
  Trash2, 
  UserRound, 
  Users, 
  XCircle, 
} from "lucide-react"; 
 
import api from "../../api/api"; 
 
export default function Notifications() { 
 
  const [notifications, setNotifications] = useState([]); 
 
  const [doctors, setDoctors] = useState([]); 
 
  const [patients, setPatients] = useState([]); 
 
  const [loading, setLoading] = useState(true); 
 
  const [refreshing, setRefreshing] = useState(false); 
 
  const [submitting, setSubmitting] = useState(false); 
 
  const [error, setError] = useState(""); 
 
  const [success, setSuccess] = useState(""); 
 
  const [form, setForm] = useState({ 
    recipientType: "DOCTOR", 
    recipientId: "", 
    title: "", 
    message: "", 
    type: "INFO", 
  }); 
 
  /* 
   * ============================================================ 
   * LOAD DATA 
   * ============================================================ 
   */ 
 
  const loadData = useCallback( 
    async (showRefresh = false) => { 
 
      try { 
 
        if (showRefresh) { 
          setRefreshing(true); 
        } else { 
          setLoading(true); 
        } 
 
        setError(""); 
 
        const [ 
          notificationResponse, 
          doctorResponse, 
          patientResponse, 
        ] = await Promise.all([ 
          api.get("/api/notifications"), 
          api.get("/api/doctors"), 
          api.get("/api/patients"), 
        ]); 
 
        setNotifications( 
          Array.isArray(notificationResponse.data) 
            ? notificationResponse.data 
            : [] 
        ); 
 
        setDoctors( 
          Array.isArray(doctorResponse.data) 
            ? doctorResponse.data 
            : [] 
        ); 
 
        setPatients( 
          Array.isArray(patientResponse.data) 
            ? patientResponse.data 
            : [] 
        ); 
 
      } catch (err) { 
 
        console.error( 
          "Unable to load notification data:", 
          err 
        ); 
 
        setError( 
          err.response?.data?.message || 
          "Unable to load notifications. Please try again." 
        ); 
 
      } finally { 
 
        setLoading(false); 
 
        setRefreshing(false); 
      } 
    }, 
    [] 
  ); 
 
  useEffect(() => { 
    loadData(); 
  }, [loadData]); 
 
  /* 
   * ============================================================ 
   * FORM HANDLERS 
   * ============================================================ 
   */ 
 
  const handleChange = (event) => { 
 
    const { 
      name, 
      value, 
    } = event.target; 
 
    setForm((previous) => ({ 
      ...previous, 
      [name]: value, 
    })); 
 
    setError(""); 
 
    setSuccess(""); 
  }; 
 
  const handleRecipientTypeChange = (event) => { 
 
    const value = event.target.value; 
 
    setForm((previous) => ({ 
      ...previous, 
      recipientType: value, 
      recipientId: "", 
    })); 
 
    setError(""); 
 
    setSuccess(""); 
  }; 
 
  /* 
   * ============================================================ 
   * SEND NOTIFICATION 
   * ============================================================ 
   */ 
 
  const handleSubmit = async (event) => { 
 
    event.preventDefault(); 
 
    setError(""); 
 
    setSuccess(""); 
 
    if (!form.recipientId) { 
      setError("Please select a recipient."); 
      return; 
    } 
 
    if (!form.title.trim()) { 
      setError("Please enter a notification title."); 
      return; 
    } 
 
    if (!form.message.trim()) { 
      setError("Please enter a notification message."); 
      return; 
    } 
 
    try { 
 
      setSubmitting(true); 
 
      const payload = { 
        recipientType: form.recipientType, 
        recipientId: form.recipientId, 
        title: form.title.trim(), 
        message: form.message.trim(), 
        type: form.type, 
      }; 
 
      const response = await api.post( 
        "/api/notifications", 
        payload 
      ); 
 
      setNotifications((previous) => [ 
        response.data, 
        ...previous, 
      ]); 
 
      setForm({ 
        recipientType: "DOCTOR", 
        recipientId: "", 
        title: "", 
        message: "", 
        type: "INFO", 
      }); 
 
      setSuccess( 
        "Notification sent successfully." 
      ); 
 
    } catch (err) { 
 
      console.error( 
        "Unable to send notification:", 
        err 
      ); 
 
      setError( 
        err.response?.data?.message || 
        err.response?.data || 
        "Unable to send notification. Please try again." 
      ); 
 
    } finally { 
 
      setSubmitting(false); 
    } 
  }; 
 
  /* 
   * ============================================================ 
   * MARK AS READ 
   * ============================================================ 
   */ 
 
  const markAsRead = async (id) => { 
 
    try { 
 
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
        "Notification deleted successfully." 
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
   * RECIPIENT OPTIONS 
   * ============================================================ 
   */ 
 
  const recipientOptions = useMemo(() => { 
 
    if (form.recipientType === "DOCTOR") { 
 
      return doctors.map((doctor) => ({ 
        id: doctor.id, 
        label: `${doctor.id} — ${doctor.name || "Doctor"}`, 
      })); 
 
    } 
 
    return patients.map((patient) => ({ 
      id: patient.patientId, 
      label: `${patient.patientId} — ${ 
        patient.fullName || 
        patient.name || 
        "Patient" 
      }`, 
    })); 
 
  }, [ 
    doctors, 
    patients, 
    form.recipientType, 
  ]); 
 
  /* 
   * ============================================================ 
   * STATISTICS 
   * ============================================================ 
   */ 
 
  const unreadCount = notifications.filter( 
    (notification) => 
      !notification.read 
  ).length; 
 
  const doctorNotificationCount = 
    notifications.filter( 
      (notification) => 
        notification.recipientType === "DOCTOR" 
    ).length; 
 
  const patientNotificationCount = 
    notifications.filter( 
      (notification) => 
        notification.recipientType === "PATIENT" 
    ).length; 
 
  /* 
   * ============================================================ 
   * HELPERS 
   * ============================================================ 
   */ 
 
  const getTypeConfig = (type) => { 
 
    const normalizedType = 
      String(type || "INFO").toUpperCase(); 
 
    switch (normalizedType) { 
 
      case "SUCCESS": 
        return { 
          icon: CheckCircle2, 
          iconClass: "text-lime-600", 
          bgClass: "bg-lime-50", 
          borderClass: "border-lime-200", 
          badgeClass: 
            "bg-lime-100 text-lime-700", 
          label: "Success", 
        }; 
 
      case "WARNING": 
        return { 
          icon: AlertCircle, 
          iconClass: "text-amber-600", 
          bgClass: "bg-amber-50", 
          borderClass: "border-amber-200", 
          badgeClass: 
            "bg-amber-100 text-amber-700", 
          label: "Warning", 
        }; 
 
      case "ALERT": 
        return { 
          icon: XCircle, 
          iconClass: "text-red-600", 
          bgClass: "bg-red-50", 
          borderClass: "border-red-200", 
          badgeClass: 
            "bg-red-100 text-red-700", 
          label: "Alert", 
        }; 
 
      default: 
        return { 
          icon: Info, 
          iconClass: "text-lime-600", 
          bgClass: "bg-lime-50", 
          borderClass: "border-lime-200", 
          badgeClass: 
            "bg-lime-100 text-lime-700", 
          label: "Information", 
        }; 
    } 
  }; 
 
  const formatDate = (value) => { 
 
    if (!value) { 
      return "Unknown date"; 
    } 
 
    const date = new Date(value); 
 
    if (Number.isNaN(date.getTime())) { 
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
 
          <div className="w-12 h-12 rounded-2xl bg-lime-100 flex items-center justify-center"> 
 
            <Loader2 
              className="text-lime-600 animate-spin" 
              size={25} 
            /> 
 
          </div> 
 
          <p className="text-sm text-gray-500"> 
            Loading notifications... 
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
 
            <div className="w-14 h-14 rounded-2xl bg-lime-100 flex items-center justify-center shadow-sm"> 
 
              <Bell 
                className="text-lime-600" 
                size={28} 
              /> 
 
            </div> 
 
            <div> 
 
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800"> 
                Notifications & Alerts 
              </h1> 
 
              <p className="text-sm text-gray-500 mt-1"> 
                Manage important updates and alerts for doctors and patients. 
              </p> 
 
            </div> 
 
          </div> 
 
          <button 
            type="button" 
            onClick={() => loadData(true)} 
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
 
                <MessageSquare 
                  size={21} 
                  className="text-amber-600" 
                /> 
 
              </div> 
 
            </div> 
 
          </div> 
 
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"> 
 
            <div className="flex items-center justify-between"> 
 
              <div> 
 
                <p className="text-sm text-gray-500"> 
                  Doctor Alerts 
                </p> 
 
                <p className="text-2xl font-bold text-gray-800 mt-1"> 
                  {doctorNotificationCount} 
                </p> 
 
              </div> 
 
              <div className="w-11 h-11 rounded-xl bg-lime-50 flex items-center justify-center"> 
 
                <UserRound 
                  size={21} 
                  className="text-lime-600" 
                /> 
 
              </div> 
 
            </div> 
 
          </div> 
 
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"> 
 
            <div className="flex items-center justify-between"> 
 
              <div> 
 
                <p className="text-sm text-gray-500"> 
                  Patient Alerts 
                </p> 
 
                <p className="text-2xl font-bold text-gray-800 mt-1"> 
                  {patientNotificationCount} 
                </p> 
 
              </div> 
 
              <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center"> 
 
                <Users 
                  size={21} 
                  className="text-purple-600" 
                /> 
 
              </div> 
 
            </div> 
 
          </div> 
 
        </div> 
 
        {/* ============================================================ 
            CONTENT GRID 
        ============================================================ */} 
 
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6"> 
 
          {/* ============================================================ 
              CREATE NOTIFICATION 
          ============================================================ */} 
 
          <div className="xl:col-span-2"> 
 
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"> 
 
              <div className="p-5 md:p-6 border-b border-gray-100"> 
 
                <div className="flex items-center gap-3"> 
 
                  <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center"> 
 
                    <Send 
                      size={19} 
                      className="text-lime-600" 
                    /> 
 
                  </div> 
 
                  <div> 
 
                    <h2 className="text-lg font-bold text-gray-800"> 
                      Send Notification 
                    </h2> 
 
                    <p className="text-xs text-gray-500 mt-0.5"> 
                      Send a targeted alert to a doctor or patient. 
                    </p> 
 
                  </div> 
 
                </div> 
 
              </div> 
 
              <form 
                onSubmit={handleSubmit} 
                className="p-5 md:p-6 space-y-5" 
              > 
 
                {/* Recipient Type */} 
 
                <div> 
 
                  <label 
                    htmlFor="recipientType" 
                    className="block text-sm font-semibold text-gray-700 mb-2" 
                  > 
                    Recipient Type 
                  </label> 
 
                  <div className="relative"> 
 
                    <select 
                      id="recipientType" 
                      name="recipientType" 
                      value={form.recipientType} 
                      onChange={ 
                        handleRecipientTypeChange 
                      } 
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-gray-700 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400 transition" 
                    > 
 
                      <option value="DOCTOR"> 
                        Doctor 
                      </option> 
 
                      <option value="PATIENT"> 
                        Patient 
                      </option> 
 
                    </select> 
 
                    <ChevronDown 
                      size={17} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                    /> 
 
                  </div> 
 
                </div> 
 
                {/* Recipient */} 
 
                <div> 
 
                  <label 
                    htmlFor="recipientId" 
                    className="block text-sm font-semibold text-gray-700 mb-2" 
                  > 
                    {form.recipientType === "DOCTOR" 
                      ? "Doctor" 
                      : "Patient"} 
                  </label> 
 
                  <div className="relative"> 
 
                    <select 
                      id="recipientId" 
                      name="recipientId" 
                      value={form.recipientId} 
                      onChange={handleChange} 
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-gray-700 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400 transition" 
                    > 
 
                      <option value=""> 
                        Select{" "} 
                        {form.recipientType === 
                        "DOCTOR" 
                          ? "doctor" 
                          : "patient"} 
                      </option> 
 
                      {recipientOptions.map( 
                        (recipient) => ( 
                          <option 
                            key={recipient.id} 
                            value={recipient.id} 
                          > 
                            {recipient.label} 
                          </option> 
                        ) 
                      )} 
 
                    </select> 
 
                    <ChevronDown 
                      size={17} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                    /> 
 
                  </div> 
 
                </div> 
 
                {/* Notification Type */} 
 
                <div> 
 
                  <label 
                    htmlFor="type" 
                    className="block text-sm font-semibold text-gray-700 mb-2" 
                  > 
                    Notification Type 
                  </label> 
 
                  <div className="grid grid-cols-2 gap-2"> 
 
                    {[ 
                      { 
                        value: "INFO", 
                        label: "Information", 
                      }, 
                      { 
                        value: "SUCCESS", 
                        label: "Success", 
                      }, 
                      { 
                        value: "WARNING", 
                        label: "Warning", 
                      }, 
                      { 
                        value: "ALERT", 
                        label: "Alert", 
                      }, 
                    ].map((option) => ( 
 
                      <label 
                        key={option.value} 
                        className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition ${ 
                          form.type === option.value 
                            ? "border-lime-400 bg-lime-50 text-lime-700" 
                            : "border-gray-200 text-gray-600 hover:border-lime-200" 
                        }`} 
                      > 
 
                        <input 
                          type="radio" 
                          name="type" 
                          value={option.value} 
                          checked={ 
                            form.type === 
                            option.value 
                          } 
                          onChange={handleChange} 
                          className="sr-only" 
                        /> 
 
                        {option.label} 
 
                      </label> 
 
                    ))} 
 
                  </div> 
 
                </div> 
 
                {/* Title */} 
 
                <div> 
 
                  <label 
                    htmlFor="title" 
                    className="block text-sm font-semibold text-gray-700 mb-2" 
                  > 
                    Notification Title 
                  </label> 
 
                  <input 
                    id="title" 
                    name="title" 
                    type="text" 
                    value={form.title} 
                    onChange={handleChange} 
                    maxLength={150} 
                    placeholder="Example: Appointment Confirmation" 
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400 transition" 
                  /> 
 
                </div> 
 
                {/* Message */} 
 
                <div> 
 
                  <label 
                    htmlFor="message" 
                    className="block text-sm font-semibold text-gray-700 mb-2" 
                  > 
                    Message 
                  </label> 
 
                  <textarea 
                    id="message" 
                    name="message" 
                    value={form.message} 
                    onChange={handleChange} 
                    rows={5} 
                    placeholder="Write the notification message..." 
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400 transition" 
                  /> 
 
                </div> 
 
                {/* Submit */} 
 
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-lime-500 hover:bg-lime-600 text-white font-semibold px-5 py-3 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed" 
                > 
 
                  {submitting ? ( 
                    <> 
                      <Loader2 
                        size={18} 
                        className="animate-spin" 
                      /> 
 
                      Sending... 
                    </> 
                  ) : ( 
                    <> 
                      <Send size={18} /> 
 
                      Send Notification 
                    </> 
                  )} 
 
                </button> 
 
              </form> 
 
            </div> 
 
          </div> 
 
          {/* ============================================================ 
              NOTIFICATION LIST 
          ============================================================ */} 
 
          <div className="xl:col-span-3"> 
 
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"> 
 
              <div className="p-5 md:p-6 border-b border-gray-100"> 
 
                <div className="flex items-center justify-between gap-4"> 
 
                  <div> 
 
                    <h2 className="text-lg font-bold text-gray-800"> 
                      Recent Notifications 
                    </h2> 
 
                    <p className="text-xs text-gray-500 mt-1"> 
                      Latest alerts sent through the HAMS system. 
                    </p> 
 
                  </div> 
 
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-lime-50 text-lime-700 text-xs font-semibold"> 
 
                    <Bell size={15} /> 
 
                    {notifications.length} Total 
 
                  </div> 
 
                </div> 
 
              </div> 
 
              <div className="divide-y divide-gray-100"> 
 
                {notifications.length === 0 ? ( 
 
                  <div className="p-10 text-center"> 
 
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4"> 
 
                      <Bell 
                        size={25} 
                        className="text-gray-400" 
                      /> 
 
                    </div> 
 
                    <h3 className="font-semibold text-gray-700"> 
                      No notifications yet 
                    </h3> 
 
                    <p className="text-sm text-gray-500 mt-1"> 
                      Send your first notification using the form. 
                    </p> 
 
                  </div> 
 
                ) : ( 
 
                  notifications.map( 
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
                          className={`p-5 transition hover:bg-gray-50 ${ 
                            !notification.read 
                              ? "bg-lime-50/30" 
                              : "" 
                          }`} 
                        > 
 
                          <div className="flex gap-4"> 
 
                            {/* Icon */} 
 
                            <div 
                              className={`w-11 h-11 rounded-xl ${config.bgClass} ${config.borderClass} border flex items-center justify-center shrink-0`} 
                            > 
 
                              <TypeIcon 
                                size={20} 
                                className={ 
                                  config.iconClass 
                                } 
                              /> 
 
                            </div> 
 
                            {/* Content */} 
 
                            <div className="min-w-0 flex-1"> 
 
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"> 
 
                                <div> 
 
                                  <div className="flex flex-wrap items-center gap-2"> 
 
                                    <h3 className="font-bold text-gray-800"> 
 
                                      { 
                                        notification.title 
                                      } 
 
                                    </h3> 
 
                                    {!notification.read && ( 
 
                                      <span className="w-2 h-2 rounded-full bg-lime-500" /> 
 
                                    )} 
 
                                  </div> 
 
                                  <div className="flex flex-wrap items-center gap-2 mt-2"> 
 
                                    <span 
                                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${config.badgeClass}`} 
                                    > 
                                      { 
                                        config.label 
                                      } 
                                    </span> 
 
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold"> 
 
                                      {notification.recipientType === 
                                      "DOCTOR" ? ( 
                                        <UserRound 
                                          size={12} 
                                        /> 
                                      ) : ( 
                                        <Users 
                                          size={12} 
                                        /> 
                                      )} 
 
                                      { 
                                        notification.recipientType 
                                      } 
 
                                    </span> 
 
                                    <span className="text-xs text-gray-500 font-medium"> 
 
                                      { 
                                        notification.recipientId 
                                      } 
 
                                    </span> 
 
                                  </div> 
 
                                </div> 
 
                              </div> 
 
                              <p className="text-sm text-gray-600 leading-6 mt-3 whitespace-pre-wrap"> 
 
                                { 
                                  notification.message 
                                } 
 
                              </p> 
 
                              <div className="flex flex-wrap items-center justify-between gap-3 mt-4"> 
 
                                <div className="flex items-center gap-1.5 text-xs text-gray-400"> 
 
                                  <Clock3 
                                    size={14} 
                                  /> 
 
                                  { 
                                    formatDate( 
                                      notification.createdAt 
                                    ) 
                                  } 
 
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
                                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-lime-700 bg-lime-50 hover:bg-lime-100 transition" 
                                    > 
                                      Mark as read 
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
                  ) 
 
                )} 
 
              </div> 
 
            </div> 
 
          </div> 
 
        </div> 
 
      </div> 
 
    </div> 
  ); 
} 