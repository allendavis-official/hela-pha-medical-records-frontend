import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../lib/auth";
import {
  FaHome,
  FaUsers,
  FaStethoscope,
  FaNotesMedical,
  FaFlask,
  FaXRay,
  FaChartBar,
  FaExclamationTriangle,
  FaFolder,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaHospital,
  FaUser,
  FaUserCog,
  FaUserShield,
} from "react-icons/fa";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const router = useRouter();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: FaHome },
    { name: "Patients", href: "/patients", icon: FaUsers },
    { name: "Encounters", href: "/encounters", icon: FaStethoscope },
    { name: "Clinical Notes", href: "/clinical-notes", icon: FaNotesMedical },
    { name: "Lab Orders", href: "/orders/lab", icon: FaFlask },
    { name: "Radiology", href: "/orders/radiology", icon: FaXRay },
    { name: "Analytics", href: "/analytics", icon: FaChartBar },
    {
      name: "Data Quality",
      href: "/data-quality",
      icon: FaExclamationTriangle,
    },
    { name: "Records", href: "/records", icon: FaFolder },
  ];

  // Admin-only navigation items
  const adminNavigation = [
    { name: "User Management", href: "/users", icon: FaUserCog },
  ];

  // Check if user is admin
  const isAdmin = user?.role?.name === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 text-white transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 bg-primary-900">
          <div className="flex items-center space-x-3">
            <FaHospital className="text-2xl" />
            <span className="text-xl font-bold">Hela PHA</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* User Info */}
        {/* User Info with Profile Image */}
        <Link href="/profile">
          <div className="px-6 py-4 bg-primary-900 border-b border-primary-700 cursor-pointer hover:bg-primary-800 transition-colors">
            <div className="flex items-center space-x-3">
              {/* Profile Image */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-600 flex-shrink-0">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUser className="text-white" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-primary-300 capitalize truncate">
                  {user?.position || user?.role?.name}
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1 overflow-y-auto h-[calc(100vh-240px)]">
          {/* Regular Navigation */}
          {navigation.map((item) => {
            const isActive =
              router.pathname === item.href ||
              router.pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary-700 text-white"
                    : "text-primary-100 hover:bg-primary-700 hover:text-white"
                }`}
              >
                <item.icon className="text-lg" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Admin-only Navigation */}
          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <div className="px-4 text-xs font-semibold text-primary-400 uppercase tracking-wider">
                  Administration
                </div>
              </div>
              {adminNavigation.map((item) => {
                const isActive =
                  router.pathname === item.href ||
                  router.pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-red-700 text-white"
                        : "text-primary-100 hover:bg-red-700 hover:text-white"
                    }`}
                  >
                    <item.icon className="text-lg" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-primary-900">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-primary-100 hover:bg-primary-700 hover:text-white rounded-lg transition-colors"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : ""
        }`}
      >
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            <FaBars className="text-xl" />
          </button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
