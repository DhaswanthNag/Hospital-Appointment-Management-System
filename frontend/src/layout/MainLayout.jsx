import Navbar from "../components/Navbar";
import AdminSidebar from "../sidebar/AdminSidebar";

export default function MainLayout({ children, role }) {
  return (
    <div>
      <Navbar />

      {/* Role Based Sidebar */}
      {role === "ADMIN" && <AdminSidebar />}

      {/* Add more roles here */}
      {/* {role === "DOCTOR" && <DoctorSidebar />} */}

      <div className="pt-16 ml-64 p-6">
        {children}
      </div>
    </div>
  );
}
