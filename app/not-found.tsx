// app/not-found.tsx
import Link from "next/link";
import Image from "next/image";
import { Home, Search, Activity, Heart, ArrowRight, Sparkles } from "lucide-react";

export const metadata = {
  title: "Page Not Found | ReviveHub",
  description: "Oops! The page you're looking for doesn't exist. Return to ReviveHub for healthcare services.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
          <div className="relative w-14 h-14">
            <Image
              src="/icon.png"
              alt="ReviveHub"
              width={56}
              height={56}
              className="object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ReviveHub
            </h1>
            <p className="text-sm text-gray-500">Healthcare Reimagined</p>
          </div>
        </Link>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 mb-12">
          {/* 404 Number */}
          <div className="relative mb-8">
            <div className="text-9xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              404
            </div>
            <div className="absolute -top-4 -right-4">
              <Sparkles className="w-8 h-8 text-yellow-500 animate-spin-slow" />
            </div>
            <div className="absolute -bottom-4 -left-4">
              <Heart className="w-8 h-8 text-red-500 animate-bounce" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h2>
          
          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            It looks like you've ventured into uncharted territory. Don't worry - 
            even the healthiest journeys sometimes take unexpected turns. Let's get you back on track!
          </p>

          {/* Health Icons */}
          <div className="flex justify-center gap-6 mb-10">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Activity</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Wellness</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Search</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              Return Home
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/specialists"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Activity className="w-5 h-5" />
              Find Specialists
            </Link>
          </div>

          {/* Search Suggestion */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Can't find what you're looking for?
            </h3>
            <p className="text-gray-600 mb-4">
              Try searching for healthcare specialists, services, or browse our popular categories:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Physiotherapy', 'Nutritionist', 'Yoga', 'Lab Tests', 'Medicines', 'Video Consult'].map((item) => (
                <Link
                  key={item}
                  href={`/search?q=${item.toLowerCase()}`}
                  className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-200"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Stats/Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-700 mb-2">100+</div>
            <div className="text-gray-700 font-medium">Healthcare Specialists</div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-700 mb-2">24/7</div>
            <div className="text-gray-700 font-medium">Support Available</div>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-700 mb-2">5000+</div>
            <div className="text-gray-700 font-medium">Happy Patients</div>
          </div>
        </div>

        {/* Fun Message */}
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3">
            <Heart className="w-6 h-6 text-pink-600 animate-pulse" />
            <p className="text-lg text-gray-700">
              <span className="font-bold text-pink-600">Health Tip:</span> 
              {" "}Even when you're lost online, remember to take deep breaths and stay hydrated! 💧
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-12 flex flex-wrap justify-center gap-6">
          <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
            About Us
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
            Contact Support
          </Link>
          <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
            Terms of Service
          </Link>
        </div>

        {/* Copyright */}
        <p className="mt-8 text-gray-500 text-sm">
          © {new Date().getFullYear()} ReviveHub. Your health, revived. 🩺
        </p>
      </div>

      {/* Floating Elements */}
      <div className="hidden md:block">
        <div className="fixed top-20 left-10 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-float"></div>
        <div className="fixed bottom-20 right-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-float-delayed"></div>
        <div className="fixed top-1/3 right-1/4 w-12 h-12 bg-green-200 rounded-full opacity-15 animate-float-slow"></div>
      </div>
    </div>
  );
}