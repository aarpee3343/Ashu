"use client";
import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import AsyncButton from "@/components/ui/AsyncButton";

export default function GeoLocationInput({ onLocationSelect }: any) {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");

  const handleGetLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      
      // Optional: Use Google Maps/Mapbox API here to get actual text address
      // For now, we simulate finding the address
      setAddress(`Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`);
      
      onLocationSelect({ latitude, longitude, address: "Detected Location" });
      setLoading(false);
      toast.success("Location Detected!");
    }, () => {
      setLoading(false);
      toast.error("Location permission denied");
    });
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase text-gray-500">Service Location</label>
      <div className="flex gap-2">
        <AsyncButton 
          onClick={handleGetLocation}
          className="bg-blue-50 text-blue-600 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-100 transition"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <MapPin size={18} />}
          {address ? "Update Location" : "Use My Location"}
        </AsyncButton>
        <input 
          value={address} 
          disabled 
          placeholder="GPS Coordinates" 
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-medium"
        />
      </div>
    </div>
  );
}