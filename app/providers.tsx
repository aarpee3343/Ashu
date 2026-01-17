"use client";

import { SessionProvider } from "next-auth/react";
import { GlobalLoaderProvider } from "@/context/GlobalLoader"; // Import the loader
import { Toaster } from "react-hot-toast"; // Good place to keep Toaster too

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <GlobalLoaderProvider>
        {children}
        {/* The Toaster handles the toast.success/error popups globally */}
        <Toaster position="top-center" />
      </GlobalLoaderProvider>
    </SessionProvider>
  );
}