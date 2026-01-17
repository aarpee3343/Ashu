// app/loading.tsx
import { Activity } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center animate-in fade-in duration-200">
        <div className="relative flex items-center justify-center w-24 h-24 mb-4">
           <div className="absolute inset-0 rounded-full border-4 border-teal-100 animate-ping opacity-75"></div>
           <div className="relative bg-teal-50 rounded-full p-5 border-2 border-teal-100 shadow-xl">
             <Activity size={48} className="text-teal-600 animate-bounce" />
           </div>
        </div>
        <h3 className="text-xl font-bold text-teal-800 tracking-tight">Reviving</h3>
        {/* <p className="text-sm font-medium text-teal-600 animate-pulse">Loading...</p> */}
      </div>
    </div>
  );
}