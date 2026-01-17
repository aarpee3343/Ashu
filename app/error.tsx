"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import AsyncButton from "@/components/ui/AsyncButton";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
        <AlertTriangle size={32} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
      <p className="text-gray-500 max-w-sm mb-8">
        We encountered an unexpected error. Our team has been notified.
      </p>
      
      <div className="flex gap-4">
        <AsyncButton
          onClick={() => window.location.href = "/"}
          className="px-6 py-3 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-100 transition"
        >
          Go Home
        </AsyncButton>
        <AsyncButton
          onClick={() => reset()}
          className="px-6 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition flex items-center gap-2"
        >
          <RefreshCcw size={18} /> Try Again
        </AsyncButton>
      </div>
      
      {/* Dev Info (Optional: Hide in Production) */}
      <p className="mt-8 text-xs text-gray-400 font-mono">
        Error Digest: {error.digest}
      </p>
    </div>
  );
}