"use client";

import { useState } from "react";
import { usePathname } from "next/navigation"; // Import this
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Get current URL path
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    {
      path: "/dashboard/admin",
      label: "Dashboard",
      icon: "📊",
      description: "Overview & Analytics"
    },
    {
      path: "/dashboard/admin/specialists",
      label: "Specialists",
      icon: "👨‍⚕️",
      description: "Manage Healthcare Providers"
    },
    {
      path: "/dashboard/admin/bookings",
      label: "Bookings",
      icon: "📅",
      description: "Appointments & Scheduling"
    },
    {
      path: "/dashboard/admin/patients",
      label: "Patients",
      icon: "👥",
      description: "Patient Management"
    },
    {
      path: "/dashboard/admin/reports",
      label: "Reports",
      icon: "📈",
      description: "Analytics & Insights"
    },
    {
      path: "/dashboard/admin/settings",
      label: "Settings",
      icon: "⚙️",
      description: "System Configuration"
    }
  ];

  // Helper to find current page details
  const currentPage = menuItems.find(item => item.path === pathname) || menuItems[0];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-brand-50 to-white font-sans">
      {/* Sidebar */}
      <aside 
        className={`
          ${sidebarCollapsed ? 'w-20' : 'w-72'}
          bg-gradient-to-b from-blue-900 to-gray-900
          text-white p-6
          transition-all duration-300 ease-in-out
          shadow-xl relative flex flex-col z-50
        `}
      >
        {/* Sidebar Header */}
        <div className="pb-6 border-b border-white/10 mb-6">
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl font-semibold">H</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    HealthPro
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">Admin Portal</p>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:rotate-180 ml-auto"
            >
              {sidebarCollapsed ? "→" : "←"}
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`
                    flex items-center ${sidebarCollapsed ? 'justify-center p-3' : 'p-3'}
                    rounded-xl transition-all duration-200
                    ${pathname === item.path 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }
                    relative
                  `}
                >
                  <span className={`${sidebarCollapsed ? 'text-xl' : 'text-lg mr-3'}`}>
                    {item.icon}
                  </span>
                  
                  {!sidebarCollapsed && (
                    <div className="flex-1">
                      <span className="block text-sm font-semibold">
                        {item.label}
                      </span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">
                        {item.description}
                      </span>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-white/10 mt-auto">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">AD</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Admin User</p>
                  <p className="text-xs text-gray-400">admin@healthcare.com</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg flex items-center justify-center text-sm transition-all duration-200"
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full h-10 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg flex items-center justify-center text-xl"
            >
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8 p-5 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div>
            {/* FIXED: Using currentPage variable instead of activeLink */}
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {currentPage.icon} {currentPage.label}
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              {currentPage.description}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* FIX: Suppress hydration warning for date */}
            <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border" suppressHydrationWarning>
                Today: {new Date().toLocaleDateString('en-IN')}
            </div>
          </div>
        </div>

        {/* Dynamic Page Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[calc(100vh-200px)]">
          {children}
        </div>

      </main>
    </div>
  );
}