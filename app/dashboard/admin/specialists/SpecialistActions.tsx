"use client";

import { useState } from "react";
import AsyncButton from "@/components/ui/AsyncButton";
import { Eye, Edit, Trash2, CheckCircle, XCircle, Star, X } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SpecialistActions({ specialist }: { specialist: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
      name: specialist.name,
      price: specialist.price,
      category: specialist.category,
      experience: specialist.experience
  });

  // 1. Actions
  const handleAction = async (action: string, data?: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/specialists", {
        method: "PATCH",
        body: JSON.stringify({ id: specialist.id, action, data })
      });
      if(res.ok) {
        toast.success("Updated Successfully");
        router.refresh();
        setIsEditOpen(false); // Close modal if open
      } else {
        toast.error("Action Failed");
      }
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if(!confirm("Are you sure? This will delete the doctor profile permanently.")) return;
    setLoading(true);
    await fetch(`/api/admin/specialists?id=${specialist.id}`, { method: "DELETE" });
    toast.success("Doctor Deleted");
    router.refresh();
    setLoading(false);
  };

  return (
    <>
        <div className="flex items-center gap-2">
        {/* Verify */}
        <AsyncButton 
            onClick={() => handleAction("VERIFY")} 
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${specialist.isVerified ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
            title={specialist.isVerified ? "Verified (Click to revoke)" : "Click to Verify"}
        >
            {specialist.isVerified ? <CheckCircle size={16} /> : <XCircle size={16} />}
        </AsyncButton>

        {/* Feature */}
        <AsyncButton 
            onClick={() => handleAction("FEATURE")}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${specialist.isFeatured ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-50 text-gray-300 hover:text-yellow-400'}`}
            title="Toggle Featured"
        >
            <Star size={16} fill={specialist.isFeatured ? "currentColor" : "none"} />
        </AsyncButton>

        <div className="w-px h-6 bg-gray-200 mx-1"></div>

        {/* View */}
        <Link 
            href={`/specialists/${specialist.id}`} 
            target="_blank"
            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="View Public Profile"
        >
            <Eye size={16} />
        </Link>

        {/* Edit Button - Opens Modal */}
        <button 
            onClick={() => setIsEditOpen(true)}
            className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            title="Edit Details"
        >
            <Edit size={16} />
        </button>

        {/* Delete */}
        <AsyncButton 
            onClick={handleDelete}
            disabled={loading}
            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="Delete Specialist"
        >
            <Trash2 size={16} />
        </AsyncButton>
        </div>

        {/* --- EDIT MODAL --- */}
        {isEditOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                    <button onClick={() => setIsEditOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                        <X size={20} />
                    </button>
                    
                    <h3 className="text-xl font-bold mb-4">Edit Specialist</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                            <input 
                                value={editForm.name} 
                                onChange={e => setEditForm({...editForm, name: e.target.value})}
                                className="w-full p-3 border rounded-xl"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Fee (₹)</label>
                                <input 
                                    type="number"
                                    value={editForm.price} 
                                    onChange={e => setEditForm({...editForm, price: Number(e.target.value)})}
                                    className="w-full p-3 border rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Experience (Yrs)</label>
                                <input 
                                    type="number"
                                    value={editForm.experience} 
                                    onChange={e => setEditForm({...editForm, experience: Number(e.target.value)})}
                                    className="w-full p-3 border rounded-xl"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                            <select 
                                value={editForm.category}
                                onChange={e => setEditForm({...editForm, category: e.target.value})}
                                className="w-full p-3 border rounded-xl bg-white"
                            >
                                <option value="PHYSIOTHERAPIST">Physiotherapist</option>
                                <option value="NUTRITIONIST">Nutritionist</option>
                                <option value="SPEECH_THERAPIST">Speech Therapist</option>
                                <option value="DIETITIAN">Dietitian</option>
                            </select>
                        </div>

                        <AsyncButton 
                            onClick={() => handleAction("UPDATE", editForm)}
                            className="w-full bg-black text-white py-3 rounded-xl font-bold mt-2"
                        >
                            Save Changes
                        </AsyncButton>
                    </div>
                </div>
            </div>
        )}
    </>
  );
}