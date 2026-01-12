"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

// SVG Icons Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.52-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.82 3.44-.74 1.45.09 2.53.68 3.32 1.65-3.26 1.76-2.5 5.96.6 7.15-.65 1.87-1.68 3.54-2.44 4.17zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

export default function Login() {
  const router = useRouter();
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [step, setStep] = useState<"INPUT" | "PASSWORD" | "OTP">("INPUT");
  const [loading, setLoading] = useState(false);

  // Social Login
  const handleSocial = (provider: string) => signIn(provider, { callbackUrl: "/dashboard/user" });

  // Determine Next Step based on Input
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const isEmail = identifier.includes("@");
    const isPhone = /^\d{10}$/.test(identifier);

    if (isEmail) {
      setStep("PASSWORD");
    } else if (isPhone) {
      const mock = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(mock);
      setStep("OTP");
      toast.success(`OTP Sent: ${mock}`);
    } else {
      toast.error("Enter a valid Email or 10-digit Phone");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (step === "OTP" && otp !== generatedOtp) {
       setLoading(false);
       return toast.error("Invalid OTP");
    }

    const loginType = step === "PASSWORD" ? "EMAIL" : "PHONE";
    
    const res = await signIn("credentials", {
      redirect: false,
      loginType,
      email: loginType === "EMAIL" ? identifier : undefined,
      password: loginType === "EMAIL" ? password : undefined,
      phone: loginType === "PHONE" ? identifier : undefined,
      otp: loginType === "PHONE" ? otp : undefined,
    });

    if (res?.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success("Login Successful!");
      router.push("/dashboard/user");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome Back</h1>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Google Button */}
          <button 
            onClick={() => handleSocial('google')} 
            className="flex items-center justify-center gap-2 border border-gray-300 p-2.5 rounded-xl hover:bg-gray-50 font-semibold text-gray-700 transition-all"
          >
            <GoogleIcon />
            <span>Google</span>
          </button>
          
          {/* Apple Button (Disabled) */}
          <button 
            disabled 
            className="flex items-center justify-center gap-2 border border-gray-200 p-2.5 rounded-xl bg-gray-100 text-gray-400 font-semibold cursor-not-allowed opacity-60"
            title="Coming Soon"
          >
            <AppleIcon />
            <span>Apple</span>
          </button>
        </div>

        <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t"></div></div>
            <span className="relative bg-white px-2 text-xs text-gray-500 uppercase">Or login with</span>
        </div>

        <form onSubmit={step === "INPUT" ? handleNext : handleSubmit} className="space-y-4">
           {step === "INPUT" && (
             <div>
               <label className="block text-xs font-bold text-gray-600 mb-1">Email or Mobile Number</label>
               <input 
                 autoFocus
                 value={identifier}
                 onChange={e => setIdentifier(e.target.value)}
                 placeholder="name@example.com OR 9876543210"
                 className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
               />
             </div>
           )}

           {step === "PASSWORD" && (
             <div className="animate-fade-in">
               <div className="flex justify-between items-center mb-1">
                 <label className="text-xs font-bold text-gray-600">Password for {identifier}</label>
                 <button type="button" onClick={() => setStep("INPUT")} className="text-xs text-blue-600 underline">Change</button>
               </div>
               <input 
                 type="password"
                 autoFocus
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 placeholder="••••••••"
                 className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
               />
             </div>
           )}

           {step === "OTP" && (
             <div className="animate-fade-in">
               <div className="flex justify-between items-center mb-1">
                 <label className="text-xs font-bold text-gray-600">OTP sent to {identifier}</label>
                 <button type="button" onClick={() => setStep("INPUT")} className="text-xs text-blue-600 underline">Change</button>
               </div>
               <div className="bg-blue-50 p-2 mb-2 rounded text-center text-xs text-green-700">Simulated OTP: <strong>{generatedOtp}</strong></div>
               <input 
                 autoFocus
                 value={otp}
                 onChange={e => setOtp(e.target.value)}
                 placeholder="Enter 4-digit OTP"
                 className="w-full p-3 border rounded-lg text-center text-lg tracking-widest focus:ring-2 focus:ring-black outline-none"
                 maxLength={4}
               />
             </div>
           )}

           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-all"
           >
             {loading ? "Processing..." : step === "INPUT" ? "Continue" : "Login"}
           </button>
        </form>
        
        <p className="text-center text-sm text-gray-500 mt-6">
           New here? <Link href="/register" className="text-blue-600 font-bold hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}