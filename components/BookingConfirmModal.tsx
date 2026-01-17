"use client";
import AsyncButton from "@/components/ui/AsyncButton";

export default function BookingConfirmModal({
  open,
  onClose,
  specialist,
  startDate,
  days,
}: any) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          width: "90%",
          maxWidth: "420px",
          padding: "20px",
        }}
      >
        <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>
          Confirm Booking
        </h3>

        <p><strong>Specialist:</strong> {specialist.name}</p>
        <p><strong>Category:</strong> {specialist.category}</p>
        <p><strong>Start Date:</strong> {startDate || "-"}</p>
        <p><strong>Days:</strong> {days}</p>

        <p style={{ marginTop: "8px", fontWeight: 600 }}>
          Total: ₹{specialist.price * days}
        </p>

        <p
          style={{
            marginTop: "12px",
            fontSize: "13px",
            color: "#666",
          }}
        >
          Login is required to complete booking.
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "16px",
          }}
        >
          <AsyncButton
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: "#fff",
            }}
          >
            Cancel
          </AsyncButton>

          <a
            href="/login"
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              background: "#2563eb",
              color: "#fff",
              textAlign: "center",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
