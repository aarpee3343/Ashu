"use client";

import { useGlobalLoader } from "@/context/GlobalLoader";
import { useState } from "react";

interface AsyncButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void;
  children: React.ReactNode;
}

export default function AsyncButton({ onClick, children, className, ...props }: AsyncButtonProps) {
  const { setLoading } = useGlobalLoader();
  const [localLoading, setLocalLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // If there is no onClick provided, act like a normal button
    if (!onClick) return;

    // Start Loaders
    setLoading(true); 
    setLocalLoading(true);

    try {
      // Wait for the action to finish
      await onClick(e);
    } catch (error) {
      console.error(error);
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
      {localLoading ? "Please wait..." : children}
    </button>
  );
}