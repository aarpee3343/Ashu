"use client";

import { useGlobalLoader } from "@/context/GlobalLoader";
import { useState } from "react";

interface AsyncButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // ✅ FIX: Changed return type from 'void' to 'any' to accept toast/signIn returns
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<any> | any;
  children: React.ReactNode;
}

export default function AsyncButton({ onClick, children, className, ...props }: AsyncButtonProps) {
  const { setLoading } = useGlobalLoader();
  const [localLoading, setLocalLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // If no onClick is passed, just behave like a normal button
    if (!onClick) return;

    // Start Loaders
    setLoading(true); 
    setLocalLoading(true);

    try {
      // We await the function regardless of what it returns
      await onClick(e);
    } catch (error) {
      console.error("AsyncButton Error:", error);
    } finally {
      // Stop Loaders
      setLoading(false);
      setLocalLoading(false);
    }
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={localLoading || props.disabled}
      className={`${className} ${localLoading ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {localLoading ? "Reviving..." : children}
    </button>
  );
}