"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Clock, PhoneOff } from "lucide-react";
import toast from "react-hot-toast";

export default function VideoRoom({ params }: { params: { roomId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const roomID = params.roomId;
  
  // Refs
  const zpRef = useRef<any>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 Mins Countdown
  const [isJoined, setIsJoined] = useState(false);

  // 1. TIMER LOGIC
  useEffect(() => {
    if (!isJoined) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoDisconnect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isJoined]);

  // 2. ZEGO INITIALIZATION
  useEffect(() => {
    let zpInstance: any = null;

    const initVideo = async () => {
      if (!session?.user || !videoContainerRef.current) return;

      // Dynamic import to avoid SSR issues
      const { ZegoUIKitPrebuilt } = await import("@zegocloud/zego-uikit-prebuilt");

      const appID = 2076410495; 
      const serverSecret = "56fdfab53961f61f87096fddffaafc22";

      // Generate Token
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        String(roomID), 
        String((session.user as any).id), 
        session.user.name || "User"
      );

      // Create Instance
      zpInstance = ZegoUIKitPrebuilt.create(kitToken);
      zpRef.current = zpInstance;

      // Join Room
      zpInstance.joinRoom({
        container: videoContainerRef.current,
        sharedLinks: [
          { name: 'Copy Link', url: window.location.href }
        ],
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
        showScreenSharingButton: true,
        showLeavingView: false, // We handle leaving manually
        onJoinRoom: () => {
           setIsJoined(true);
           toast.success("Connected! Timer started.");
        },
        onLeaveRoom: () => {
           // Just navigate away. The useEffect cleanup will handle destruction.
           router.push('/dashboard/user');
        }
      });
    };

    if (session) initVideo();

    // CLEANUP: This runs ONLY when component unmounts
    return () => {
      if (zpRef.current) {
        try {
            zpRef.current.destroy();
        } catch (error) {
            console.warn("Zego cleanup warning:", error);
        }
        zpRef.current = null;
      }
    };
  }, [session, roomID, router]);

  // 3. HANDLERS
  const handleAutoDisconnect = () => {
    toast("Time's up! Session ending...", { icon: '⌛' });
    router.push("/dashboard/user");
  };

  const handleManualDisconnect = () => {
    // Only navigate. Do NOT call destroy() here.
    router.push('/dashboard/user');
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!session) return <div className="p-10 text-center">Please log in.</div>;

  return (
    <div className="w-full h-screen bg-black relative">
      
      {/* OVERLAY: Timer */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-gray-700 flex items-center gap-3 shadow-2xl">
        <Clock size={16} className={timeLeft < 60 ? "text-red-500 animate-pulse" : "text-green-500"} />
        <span className={`font-mono text-xl font-bold ${timeLeft < 60 ? "text-red-500" : "text-white"}`}>
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* OVERLAY: End Button */}
      <button 
        onClick={handleManualDisconnect}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110"
      >
        <PhoneOff size={24} />
      </button>

      {/* VIDEO CONTAINER */}
      <div ref={videoContainerRef} className="w-full h-full" />
    </div>
  );
}