"use client";
import React, { createContext, useContext, useState } from "react";
import { Activity } from "lucide-react";

type LoaderContextType = {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
};

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const GlobalLoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ isLoading, setLoading: setIsLoading }}>
      {children}
      
      {/* --- LOADER UI --- */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center w-24 h-24 mb-4">
               <div className="absolute inset-0 rounded-full border-4 border-teal-100 animate-ping opacity-75"></div>
               <div className="relative bg-teal-50 rounded-full p-5 border-2 border-teal-100 shadow-xl">
                 <Activity size={48} className="text-teal-600 animate-bounce" />
               </div>
            </div>
            <h3 className="text-xl font-bold text-teal-800 tracking-tight">ReviveHub</h3>
            <p className="text-sm font-medium text-teal-600 animate-pulse">Processing...</p>
          </div>
        </div>
      )}
    </LoaderContext.Provider>
  );
};

export const useGlobalLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) throw new Error("useGlobalLoader must be used within GlobalLoaderProvider");
  return context;
};