// components/SessionDebug.tsx
"use client";

import { useSession } from "next-auth/react";

export default function SessionDebug() {
  const { data: session, status } = useSession();

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs z-50">
      <h3 className="font-bold text-sm mb-2">Session Debug</h3>
      <p className="text-xs">
        <strong>Status:</strong> {status}
      </p>
      <p className="text-xs">
        <strong>Role:</strong> {(session?.user as any)?.role || "No role"}
      </p>
      <p className="text-xs truncate">
        <strong>ID:</strong> {(session?.user as any)?.id || "No ID"}
      </p>
      <p className="text-xs truncate">
        <strong>Email:</strong> {session?.user?.email || "No email"}
      </p>
    </div>
  );
}