"use client";
import React, { createContext, useContext, useState } from "react";
import { Loader2 } from "lucide-react"; // Or use any spinner icon

type LoaderContextType = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return (
    <LoaderContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {/* GLOBAL SPINNER UI */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
             <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
             <p className="text-sm font-bold text-gray-700">Processing...</p>
          </div>
        </div>
      )}
    </LoaderContext.Provider>
  );
};

// Custom Hook to use it easily anywhere
export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) throw new Error("useLoader must be used within a LoaderProvider");
  return context;
};