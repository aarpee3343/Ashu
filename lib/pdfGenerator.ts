import jsPDF from "jspdf";

export const generatePrescriptionPDF = (booking: any, prescriptionData: string) => {
  const doc = new jsPDF();
  
  // 1. Parse Data
  let rxObj = { diagnosis: "", advice: "", medicines: "", file: "" };
  try {
    // Attempt to parse JSON. If fails, treat as simple string (legacy compatibility)
    rxObj = JSON.parse(prescriptionData);
  } catch (e) {
    rxObj.advice = prescriptionData; // Fallback for old bookings
  }

  // 2. Header
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text("ReviveHub Medical Report", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.text(`Booking ID: #${booking.id}`, 180, 30, { align: "right" });

  doc.setLineWidth(0.5);
  doc.line(10, 35, 200, 35);

  // 3. Patient & Doctor Info
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Dr. ${booking.specialist?.name}`, 14, 45);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(booking.specialist?.category || "", 14, 50);

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Patient: ${booking.familyMember?.name || booking.user?.name}`, 120, 45);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Age/Gender: ${booking.user?.age || "N/A"} / ${booking.user?.gender || "N/A"}`, 120, 50);

  // 4. Clinical Details
  let y = 70;

  if (rxObj.diagnosis) {
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Diagnosis", 14, y);
    doc.setFontSize(11);
    doc.text(rxObj.diagnosis, 14, y + 7);
    y += 20;
  }

  if (rxObj.medicines) {
    doc.setFontSize(14);
    doc.text("Rx / Medicines", 14, y);
    doc.setFontSize(11);
    const meds = doc.splitTextToSize(rxObj.medicines, 180);
    doc.text(meds, 14, y + 7);
    y += (meds.length * 5) + 15;
  }

  if (rxObj.advice) {
    doc.setFontSize(14);
    doc.text("Advice & Instructions", 14, y);
    doc.setFontSize(11);
    const adv = doc.splitTextToSize(rxObj.advice, 180);
    doc.text(adv, 14, y + 7);
  }

  // 5. Link to File (if exists)
  if (rxObj.file) {
    doc.setTextColor(0, 0, 255);
    doc.textWithLink("Click here to view attached document", 14, 250, { url: rxObj.file });
  }

  doc.save(`Prescription_${booking.id}.pdf`);
};