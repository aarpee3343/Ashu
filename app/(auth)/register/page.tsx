"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";

// --- ICONS ---
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.52-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.82 3.44-.74 1.45.09 2.53.68 3.32 1.65-3.26 1.76-2.5 5.96.6 7.15-.65 1.87-1.68 3.54-2.44 4.17zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
);

export default function Register() {
  const router = useRouter();
  
  // States
  const [method, setMethod] = useState<"EMAIL" | "PHONE">("EMAIL");
  const [loading, setLoading] = useState(false);
  
  // OTP States
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Form Data
  const [form, setForm] = useState({ 
    name: "", 
    age: "", 
    gender: "Male",
    email: "", 
    phone: "", 
    password: "" 
  });

  // Reset OTP state when switching methods
  const handleMethodChange = (newMethod: "EMAIL" | "PHONE") => {
    setMethod(newMethod);
    setOtpInput("");
    setGeneratedOtp("");
    setIsOtpSent(false);
    setIsOtpVerified(false);
  };

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  // 1. Send OTP (Works for both Email & Phone)
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = method === "EMAIL" ? form.email : form.phone;
    
    if (!identifier || identifier.length < 5) return toast.error(`Valid ${method.toLowerCase()} required`);
    
    const mock = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(mock);
    setIsOtpSent(true);
    setIsOtpVerified(false); // Reset verification if resending
    toast.success("OTP Sent!");
  };

  // 2. Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === generatedOtp) {
      setIsOtpVerified(true);
      toast.success("Verified successfully!");
    } else {
      toast.error("Invalid OTP");
    }
  };

  // 3. Register & Auto-Login
  const handleRegister = async () => {
    if (!isOtpVerified) return toast.error("Please verify OTP first");
    
    setLoading(true);

    try {
      // A. Create User in Database
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, method }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // B. Auto-Login (Direct to Dashboard)
      const loginResult = await signIn("credentials", {
        redirect: false,
        loginType: method,
        email: method === "EMAIL" ? form.email : undefined,
        password: method === "EMAIL" ? form.password : undefined,
        phone: method === "PHONE" ? form.phone : undefined,
        otp: "skip", // Skipped because we verified it above locally
      });

      if (loginResult?.error) {
         toast.error("Account created but login failed. Please log in manually.");
         router.push("/login");
      } else {
         toast.success("Welcome!");
         router.push("/dashboard/user"); 
      }

    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    signIn(provider, { callbackUrl: "/dashboard/user" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button 
            onClick={() => handleSocialLogin('google')} 
            className="flex items-center justify-center gap-2 border border-gray-300 p-2.5 rounded-xl hover:bg-gray-50 font-semibold text-gray-700 transition-all"
          >
            <GoogleIcon />
            <span>Google</span>
          </button>
          <button 
            disabled 
            className="flex items-center justify-center gap-2 border border-gray-200 p-2.5 rounded-xl bg-gray-100 text-gray-400 font-semibold cursor-not-allowed opacity-60"
          >
            <AppleIcon />
            <span>Apple</span>
          </button>
        </div>

        <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t"></div></div>
            <span className="relative bg-white px-2 text-xs text-gray-500 uppercase">Or register with</span>
        </div>

        {/* Method Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
           <button onClick={() => handleMethodChange("EMAIL")} className={`flex-1 py-1 text-sm font-bold rounded-md transition-all ${method === "EMAIL" ? "bg-white shadow text-black" : "text-gray-500"}`}>Email</button>
           <button onClick={() => handleMethodChange("PHONE")} className={`flex-1 py-1 text-sm font-bold rounded-md transition-all ${method === "PHONE" ? "bg-white shadow text-black" : "text-gray-500"}`}>Phone</button>
        </div>

        {/* Form */}
        <div className="space-y-3">
           {/* Basic Details */}
           <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" />
           <div className="flex gap-3">
              <input name="age" type="number" placeholder="Age" onChange={handleChange} className="w-1/3 p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" />
              <select name="gender" onChange={handleChange} className="w-2/3 p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-100 outline-none">
                 <option value="Male">Male</option>
                 <option value="Female">Female</option>
                 <option value="Other">Other</option>
              </select>
           </div>

           {/* Identifier Input (Email or Phone) */}
           <div className="flex gap-2">
             <input 
                name={method === "EMAIL" ? "email" : "phone"} 
                type={method === "EMAIL" ? "email" : "tel"}
                placeholder={method === "EMAIL" ? "Email Address" : "Mobile Number"} 
                onChange={handleChange} 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                disabled={isOtpVerified} // Lock after verification
             />
             {!isOtpSent && !isOtpVerified && (
               <button onClick={handleSendOtp} className="bg-black text-white px-4 rounded-lg text-sm font-bold hover:bg-gray-800 whitespace-nowrap">
                 Verify
               </button>
             )}
             {isOtpVerified && (
                <span className="flex items-center justify-center px-3 text-green-600 font-bold bg-green-50 rounded-lg border border-green-200">
                  ✓
                </span>
             )}
           </div>

           {/* OTP Section (Visible if sent but not verified) */}
           {isOtpSent && !isOtpVerified && (
             <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                   <p className="text-xs text-blue-700">OTP sent to your {method.toLowerCase()}</p>
                   <p className="text-xs text-green-600 font-mono">Code: <strong>{generatedOtp}</strong></p>
                </div>
                <div className="flex gap-2">
                   <input 
                     value={otpInput}
                     onChange={e => setOtpInput(e.target.value)}
                     placeholder="Enter 4-digit OTP" 
                     className="w-full p-2 border border-blue-200 rounded text-center text-lg tracking-widest outline-none focus:border-blue-500" 
                     maxLength={4}
                   />
                   <div className="text-[10px] text-gray-500 mb-4">
                    By continuing, you agree to our <a href="/terms" target="_blank" className="underline">Terms</a> and <a href="/privacy-policy" target="_blank" className="underline">Privacy Policy</a>.
                  </div>
                   <button onClick={handleVerifyOtp} className="bg-blue-600 text-white px-4 rounded text-sm font-bold hover:bg-blue-700">
                     Submit
                   </button>
                </div>
             </div>
           )}

           {/* Password (Only for Email Method, shown AFTER verification) */}
           {method === "EMAIL" && isOtpVerified && (
             <div className="animate-fade-in">
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Set Password" 
                  onChange={handleChange} 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" 
                />
             </div>
           )}

           {/* Submit Button */}
           <button 
             onClick={handleRegister} 
             disabled={loading || !isOtpVerified}
             className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 mt-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-100"
           >
             {loading ? "Creating Profile..." : "Complete Registration"}
           </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
           Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}