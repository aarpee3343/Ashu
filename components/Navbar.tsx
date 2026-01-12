// components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  User,
  Video,
  Pill,
  Home,
  Calendar,
  LogOut,
  ChevronDown,
  TestTube,
  StretchVertical,
  IndianRupee,
} from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  /* Scroll effect */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Close mobile menu on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      const mobileMenu = document.querySelector(".mobile-menu");
      const menuButton = document.querySelector(".menu-button");
      
      if (isMenuOpen && mobileMenu && !mobileMenu.contains(target) && 
          menuButton && !menuButton.contains(target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  /* Prevent body scroll */
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  /* NAV LINKS - FIXED: Find Specialists now uses Link */
  const navLinks = [
    { 
      href: "/specialists", 
      label: "Find Specialists", 
      icon: <User size={20} />,
      internal: true 
    },
    {
      href: "/video-consultation",
      label: "Video Consult",
      icon: <Video size={20} />,
      onClick: () => alert("Video Consult coming soon!"),
      internal: true
    },
    {
      href: "https://waytolab.com/",
      label: "Lab Test",
      icon: <TestTube size={20} />,
      external: true,
      internal: false
    },
    {
      href: "#",
      label: "Yoga",
      icon: <span className="text-xl">🧘</span>, // Direct emoji
      onClick: () => alert("Yoga classes coming soon!"),
      internal: false
    },
    {
      href: "#",
      label: "Medicines",
      icon: <Pill size={20} />,
      onClick: () => alert("Medicine delivery coming soon!"),
      internal: false
    },
  ];

  return (
    <>
      <nav
        className={`fixed w-full z-50 top-0 transition-all duration-300 ${
          scrolled || isMenuOpen
            ? "bg-white/95 backdrop-blur-lg shadow-lg"
            : "bg-white/90 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            
            {/* LOGO - Smaller and cleaner */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8">
                <Image
                  src="/icon.png"
                  alt="ReviveHub"
                  width={32}
                  height={32}
                  className="object-contain group-hover:scale-105 transition-transform"
                  priority
                />
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ReviveHub
              </span>
              <span className="text-[11px] text-gray-500 tracking-wide">
                Healthcare Reimagined
              </span>
            </div>
            </Link>

            {/* DESKTOP NAV - FIXED: Now Find Specialists works */}
            <div className="hidden lg:flex items-center justify-center flex-1 max-w-2xl mx-8">
              <div className="flex items-center space-x-1 bg-gray-100/50 rounded-full p-1">
                {navLinks.map((link) => {
                  if (link.internal) {
                    return (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-white transition-all duration-200 flex items-center gap-2 hover:shadow-sm whitespace-nowrap"                      >
                        {link.icon}
                        {link.label}
                      </Link>
                    );
                  } else if (link.external) {
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-white transition-all duration-200 flex items-center gap-2 hover:shadow-sm whitespace-nowrap"                      >
                        {link.icon}
                        {link.label}
                      </a>
                    );
                  } else {
                    return (
                      <button
                        key={link.label}
                        onClick={link.onClick}
                        className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-white transition-all duration-200 flex items-center gap-2 hover:shadow-sm whitespace-nowrap"                      >
                        {link.icon}
                        {link.label}
                      </button>
                    );
                  }
                })}
              </div>
            </div>

            {/* DESKTOP AUTH - Improved */}
            <div className="hidden lg:flex items-center gap-3">
              {session?.user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                      {session.user.name?.charAt(0) || "U"}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-900 leading-none">
                        {session.user.name?.split(' ')[0] || 'User'}
                      </p>
                      <p className="text-[10px] text-gray-500 capitalize">
                        {(session.user as any).role?.toLowerCase() || 'patient'}
                      </p>
                    </div>
                    <ChevronDown 
                      size={14} 
                      className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} 
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-5">
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="font-semibold text-gray-900 text-sm">{session.user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                        </div>
                        
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-gray-700 transition-colors text-sm"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Home size={16} />
                          <span>Dashboard</span>
                        </Link>
                        
                        <Link
                          href="/appointments"
                          className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-gray-700 transition-colors text-sm"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Calendar size={16} />
                          <span>Appointments</span>
                        </Link>

                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              signOut({ callbackUrl: "/" });
                            }}
                            className="flex items-center gap-2 px-3 py-2 w-full text-red-600 hover:bg-red-50 transition-colors rounded-lg mx-1 text-sm"
                          >
                            <LogOut size={16} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-md shadow-blue-200/50 hover:shadow-lg hover:shadow-blue-300/50 transition-all duration-300"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* MOBILE BUTTON - Fixed with proper class */}
            <button
              className="lg:hidden menu-button p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY - Fixed positioning and styles */}
      {isMenuOpen && (
        <div className="lg:hidden mobile-menu fixed inset-0 z-40 bg-white pt-14 h-screen overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {/* Mobile User Info */}
            {session?.user && (
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  {session.user.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-sm">{session.user.name}</h3>
                  <p className="text-xs text-gray-600 truncate">{session.user.email}</p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {(session.user as any).role || "Patient"}
                  </span>
                </div>
              </div>
            )}

            {/* Mobile Navigation Links - FIXED: Find Specialists works */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                if (link.internal) {
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="text-blue-600">{link.icon}</div>
                      <span className="font-medium text-gray-900">{link.label}</span>
                    </Link>
                  );
                } else if (link.external) {
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="text-blue-600">{link.icon}</div>
                      <span className="font-medium text-gray-900">{link.label}</span>
                    </a>
                  );
                } else {
                  return (
                    <button
                      key={link.label}
                      onClick={() => {
                        link.onClick?.();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
                    >
                      <div className="text-blue-600">{link.icon}</div>
                      <span className="font-medium text-gray-900">{link.label}</span>
                    </button>
                  );
                }
              })}
            </div>

            {/* Mobile Auth Links */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              {session?.user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700 font-semibold text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home size={18} />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link
                    href="/appointments"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Calendar size={18} />
                    <span>Appointments</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center justify-center gap-2 w-full p-3 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 rounded-lg font-semibold hover:from-red-100 hover:to-pink-100 transition-colors text-sm"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block p-3 text-center font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="block p-3 text-center font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Footer */}
            <div className="pt-8 border-t border-gray-200 text-center">
              <div className="flex justify-center mb-3">
                <Image
                  src="/icon.png"
                  alt="ReviveHub"
                  width={40}
                  height={40}
                  className="opacity-80"
                />
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ReviveHub
              </h3>
              <p className="text-xs text-gray-500 mt-1">Your Health, Revived</p>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/30 z-30" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      {/* Spacer for fixed navbar */}
      <div className="h-14"></div>
    </>
  );
}