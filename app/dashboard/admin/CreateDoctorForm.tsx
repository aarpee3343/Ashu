"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CreateDoctorForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    category: "PHYSIOTHERAPIST",
    price: "",
    experience: "",
    bio: "",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d" // Default placeholder
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/create-specialist", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Doctor Created Successfully!");
      setFormData({ ...formData, name: "", email: "", password: "" }); // Reset
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        required placeholder="Full Name (e.g. Dr. Smith)"
        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
        className="w-full p-2 border rounded-lg text-sm"
      />
      <input
        required type="email" placeholder="Login Email"
        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
        className="w-full p-2 border rounded-lg text-sm"
      />
      <input
        required type="password" placeholder="Login Password"
        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
        className="w-full p-2 border rounded-lg text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
          className="w-full p-2 border rounded-lg text-sm"
        >
          <option value="PHYSIOTHERAPIST">Physiotherapist</option>
          <option value="NUTRITIONIST">Nutritionist</option>
          <option value="SPEECH_THERAPIST">Speech Therapist</option>
          <option value="DIETITIAN">Dietitian</option>
        </select>
        <input
          required type="number" placeholder="Fee (₹)"
          value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}
          className="w-full p-2 border rounded-lg text-sm"
        />
      </div>
      <input
        required type="number" placeholder="Experience (Years)"
        value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })}
        className="w-full p-2 border rounded-lg text-sm"
      />
      <textarea
        required placeholder="Short Bio"
        value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
        className="w-full p-2 border rounded-lg text-sm" rows={2}
      />
      <button 
        disabled={loading}
        className="w-full bg-gray-900 text-white font-bold py-2 rounded-lg hover:bg-black transition disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Specialist"}
      </button>
    </form>
  );
}