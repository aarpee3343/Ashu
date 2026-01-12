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
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d",
    isVideoAvailable: false,
    videoConsultationFee: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/admin/create-specialist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Specialist Created Successfully!");
      setFormData({
        name: "",
        email: "",
        password: "",
        category: "PHYSIOTHERAPIST",
        price: "",
        experience: "",
        bio: "",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d",
        isVideoAvailable: false,
        videoConsultationFee: ""
      });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Error creating specialist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Add New Specialist</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              required
              placeholder="Dr. John Smith"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              required
              type="email"
              placeholder="doctor@healthcare.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <input
              required
              type="password"
              placeholder="Create secure password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none transition-all"
            >
              <option value="PHYSIOTHERAPIST">Physiotherapist</option>
              <option value="NUTRITIONIST">Nutritionist</option>
              <option value="SPEECH_THERAPIST">Speech Therapist</option>
              <option value="DIETITIAN">Dietitian</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Fee (₹) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                required
                type="number"
                placeholder="500"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none transition-all"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years) *</label>
            <input
              required
              type="number"
              placeholder="5"
              value={formData.experience}
              onChange={e => setFormData({ ...formData, experience: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image URL</label>
            <input
              value={formData.image}
              onChange={e => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none transition-all"
              placeholder="https://example.com/profile.jpg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio *</label>
          <textarea
            required
            placeholder="Brief professional background, qualifications, and expertise..."
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none transition-all min-h-[100px] resize-y"
            rows={3}
          />
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={formData.isVideoAvailable}
              onChange={e => setFormData({ ...formData, isVideoAvailable: e.target.checked })}
              className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-purple-700">Enable Video Consultations</span>
          </label>
          
          {formData.isVideoAvailable && (
            <div className="ml-8">
              <label className="block text-sm font-medium text-purple-700 mb-2">Video Consultation Fee (₹ per 15 mins)</label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-600">₹</span>
                <input
                  type="number"
                  placeholder="400"
                  value={formData.videoConsultationFee}
                  onChange={e => setFormData({ ...formData, videoConsultationFee: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-purple-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}
        </div>

        <button
          disabled={loading}
          className={`
            w-full py-3 rounded-lg font-medium transition-all duration-300
            ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 hover:-translate-y-0.5 hover:shadow-lg'
            }
            text-white relative
          `}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <span>Creating...</span>
              <div className="ml-3 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : "Create Specialist"}
        </button>
      </form>
    </div>
  );
}