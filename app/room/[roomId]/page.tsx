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
  const zpRef = useRef<any>(null);

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
    const initVideo = async () => {
      if (!session?.user) return;

      const { ZegoUIKitPrebuilt } = await import("@zegocloud/zego-uikit-prebuilt");

      const appID = 2076410495; 
      const serverSecret = "56fdfab53961f61f87096fddffaafc22";

      // ⚠️ CRITICAL FIX: Zego requires UserID and RoomID to be STRINGS
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        String(roomID), 
        String((session.user as any).id), 
        session.user.name || "User"
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpRef.current = zp;

      zp.joinRoom({
        container: document.getElementById("video-container"),
        sharedLinks: [
          { name: 'Copy Link', url: window.location.href }
        ],
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
        showScreenSharingButton: true,
        showLeavingView: false, 
        onJoinRoom: () => {
           setIsJoined(true);
           toast.success("Connected! Timer started.");
        },
        onLeaveRoom: () => {
           router.push('/dashboard/user');
        }
      });
    };

    if (session) initVideo();

    return () => {
      if (zpRef.current) zpRef.current.destroy();
    };
  }, [session, roomID]);

  // 3. DISCONNECT LOGIC
  const handleAutoDisconnect = () => {
    toast("Time's up! Session ending...", { icon: '⌛' });
    if(zpRef.current) {
        zpRef.current.destroy();
    }
    router.push("/dashboard/user");
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
        onClick={() => { zpRef.current?.destroy(); router.push('/dashboard/user'); }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110"
      >
        <PhoneOff size={24} />
      </button>

      {/* VIDEO CONTAINER */}
      <div id="video-container" className="w-full h-full" />
    </div>
  );
}