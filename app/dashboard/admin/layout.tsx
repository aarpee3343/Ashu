"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import AsyncButton from "@/components/ui/AsyncButton";
import { signOut, useSession } from "next-auth/react";
// ✅ FIX: Changed UserMd -> Stethoscope, BarChart2 -> BarChart3
import { 
  LayoutDashboard, Stethoscope, Calendar, Users, 
  Clock, BarChart3, Settings, LogOut, Menu, ChevronLeft 
} from "lucide-react"; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 1. SECURITY CHECK
  if (status === "loading") return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  if (!session || (session.user as any).role !== "ADMIN") {
     // If not admin, redirect safely
     if (typeof window !== "undefined") router.push("/login");
     return null;
  }

  const menuItems = [
    { path: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/dashboard/admin/specialists", label: "Specialists", icon: Stethoscope }, // ✅ Updated Icon
    { path: "/dashboard/admin/bookings", label: "Bookings", icon: Calendar },
    { path: "/dashboard/admin/patients", label: "Patients", icon: Users },
    { path: "/dashboard/admin/slots", label: "Time Slots", icon: Clock },
    { path: "/dashboard/admin/reports", label: "Reports", icon: BarChart3 }, // ✅ Updated Icon
    { path: "/dashboard/admin/settings", label: "Settings", icon: Settings }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed h-full z-10`}>
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
           {!sidebarCollapsed && <span className="text-xl font-bold text-blue-600">ReviveAdmin</span>}
           <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
              {sidebarCollapsed ? <Menu size={20}/> : <ChevronLeft size={20}/>}
           </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
           {menuItems.map((item) => (
             <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${pathname === item.path ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-600 hover:bg-gray-50"}`}>
                <item.icon size={20} />
                {!sidebarCollapsed && <span>{item.label}</span>}
             </Link>
           ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
           <AsyncButton onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-3 w-full px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
              <LogOut size={20} />
              {!sidebarCollapsed && <span className="font-medium">Logout</span>}
           </AsyncButton>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
         {children}
      </main>
    </div>
  );
}