import SpecialistCard from "@/components/SpecialistCard";
import SkeletonCard from "@/components/SkeletonCard";
import { getSpecialists } from "@/lib/getSpecialists";
import Link from "next/link";
import Footer from "@/components/Footer";

export default async function Home() {
  const specialists = await getSpecialists();
  // Show top 3 featured doctors
  const featured = specialists.filter((s: any) => s.isFeatured).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 pt-2">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-white pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            #1 Trusted Health Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-[1.1]">
            Your Health, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Simplified.
            </span>
          </h1>
          
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Instant appointments with top doctors, nutritionists, and therapists. 
            Guaranteed confirmed bookings.
          </p>

          {/* REAL SEARCH FORM */}
          <form action="/specialists" method="GET" className="bg-white p-2 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input 
                name="query" // This name sends the data to the next page
                type="text" 
                placeholder="Search doctors, specialties..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 font-medium transition-all"
              />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-200">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* 2. CATEGORIES (Working Links) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900">Find by Specialty</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Physiotherapist", dbValue: "PHYSIOTHERAPIST", icon: "🦴", bg: "bg-orange-100", text: "text-orange-600" },
            { label: "Nutritionist", dbValue: "NUTRITIONIST", icon: "🥗", bg: "bg-green-100", text: "text-green-600" },
            { label: "Speech Therapist", dbValue: "SPEECH_THERAPIST", icon: "🗣️", bg: "bg-purple-100", text: "text-purple-600" },
            { label: "Dietitian", dbValue: "DIETITIAN", icon: "🍎", bg: "bg-red-100", text: "text-red-600" },
          ].map((item, i) => (
            // LINK PASSES THE CATEGORY TO THE FILTER PAGE
            <Link 
              key={i} 
              href={`/specialists?category=${item.dbValue}`}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all group"
            >
              <div className={`w-12 h-12 rounded-lg ${item.bg} ${item.text} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <span className="font-semibold text-gray-900">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED DOCTORS */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Top Rated Specialists</h2>
              <p className="text-gray-500 mt-2">Book confirmed appointments with our best doctors.</p>
            </div>
            <Link href="/specialists" className="hidden sm:block text-blue-600 font-bold hover:underline">
              View All Doctors &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              featured.map((s: any) => <SpecialistCard key={s.id} specialist={s} />)
            )}
          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
           <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">
             Ready to prioritize your health?
           </h2>
           <Link 
             href="/register" 
             className="relative z-10 inline-block bg-white text-blue-700 font-bold py-4 px-10 rounded-full hover:bg-gray-50 transition transform hover:scale-105 shadow-xl"
           >
             Get Started Now
           </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}