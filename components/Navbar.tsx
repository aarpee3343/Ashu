"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed w-full z-50 top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg font-bold text-xl group-hover:bg-blue-700 transition">HP</div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">HealthPlatform</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/specialists" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
              Find Doctors
            </Link>
            <button onClick={() => alert("Video Consult feature coming soon!")} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
              Video Consult
            </button>
            <button onClick={() => alert("Medicine delivery coming soon!")} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
              Medicines
            </button>
            
            {/* Dashboard Link */}
            {session?.user && (
               <Link 
                 href="/dashboard" // <--- CHANGE THIS to just "/dashboard"
                 className="text-sm font-medium text-gray-600 hover:text-blue-600 transition"
               >
                 Dashboard
               </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-sm font-bold text-gray-900 leading-none">{session.user.name}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                    {(session.user as any).role || "Patient"}
                  </span>
                </div>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-blue-600 px-3 py-2">
                  Log in
                </Link>
                <Link 
                  href="/register" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-blue-200 transition-all hover:scale-105"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}