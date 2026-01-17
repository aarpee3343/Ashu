import jsPDF from "jspdf";
import { format } from "date-fns";

// Helper to load image from public folder
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
};

export const generatePrescriptionPDF = async (booking: any, prescriptionData: string) => {
  const doc = new jsPDF();

  // --- Theme Colors ---
  const themeColor: [number, number, number] = [13, 148, 136];
  const lightThemeColor: [number, number, number] = [240, 253, 250];
  const slateDark: [number, number, number] = [30, 41, 59];
  const slateGray: [number, number, number] = [100, 116, 139];


  // --- Dimensions ---
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let yPos = 0;

  // --- Load Logo ---
  let logoImg = null;
  try {
    logoImg = await loadImage("/icon.png");
  } catch (e) {
    console.warn("Logo not found, skipping");
  }

  // --- Header & Footer Function ---
  const drawHeaderFooter = (pageNo: number) => {
    // 1. Colorful Header Background (Height: 50)
    doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
    doc.rect(0, 0, pageWidth, 50, "F");

    // 2. Logo
    if (logoImg) {
      // Add image (x, y, w, h) - adjust w/h to maintain aspect ratio if needed
      doc.addImage(logoImg, "PNG", margin, 10, 15, 15);
    } else {
        // Fallback placeholder if logo fails
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, 10, 15, 15, 2, 2, "F");
    }

    // 3. Clinic Details (White Text)
    const headerTextX = margin + 20;
    
    // Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("ReviveHub Healthcare", headerTextX, 18);
    
    // Tagline
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(204, 251, 241); // Teal-100
    doc.text("Healthcare Reimagined", headerTextX, 24);

    // Contact Details (Small)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    
    const address = "160, Islampur Sector 38, Gurgaon, Haryana";
    const contact = "Phone: +91 98765 43210 • Email: contact@revivehub.co.in";
    const reg = "Reg. No.: MED-2024-RH-001 • revivehub.co.in";

    doc.text(address, headerTextX, 32);
    doc.text(contact, headerTextX, 37);
    doc.text(reg, headerTextX, 42);

    // 4. "PRESCRIPTION" Label (Right aligned)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("PRESCRIPTION", pageWidth - margin, 18, { align: "right" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`ID: ${booking.id}`, pageWidth - margin, 24, { align: "right" });
    doc.text(`${format(new Date(), "dd MMM yyyy")}`, pageWidth - margin, 29, { align: "right" });


    // 5. Footer
    const footerY = pageHeight - 20;
    doc.setFillColor(245, 247, 250); 
    doc.rect(0, footerY, pageWidth, 20, "F");
    
    doc.setFontSize(8);
    doc.setTextColor(...slateGray);
    doc.text("Important: This is an electronic prescription. Keep this document for reference.", margin, footerY + 8);
    doc.text("revivehub.co.in", pageWidth - margin, footerY + 8, { align: "right" });
    
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${pageNo}`, pageWidth / 2, footerY + 15, { align: "center" });
  };

  // --- Check Page Break ---
  const checkPageBreak = (y: number, neededSpace: number) => {
    if (y + neededSpace > pageHeight - 25) {
      doc.addPage();
      yPos = 60; 
      drawHeaderFooter(doc.getNumberOfPages());
      return yPos;
    }
    return y;
  };

  // === START GENERATION ===
  drawHeaderFooter(1);
  yPos = 60; // Start below header

  // 1. Parse Data
  let rxObj = { diagnosis: "", advice: "", medicines: "", file: "" };
  try {
    if (prescriptionData) rxObj = JSON.parse(prescriptionData);
  } catch (e) {
    rxObj.advice = prescriptionData || "";
  }

  // Format Doctor Name
  const formatDocName = (name: string) => {
    const clean = name.replace(/^(dr\.?\s*)/i, '').trim();
    return `Dr. ${clean.charAt(0).toUpperCase() + clean.slice(1)}`;
  };
  const docName = booking.specialist?.name ? formatDocName(booking.specialist.name) : "Dr. Specialist";

  // ==================== PATIENT & DOCTOR CARD ====================
  // Compact Background
  doc.setFillColor(...lightThemeColor);
  doc.setDrawColor(themeColor[0], themeColor[1], themeColor[2]);
  doc.roundedRect(margin, yPos, contentWidth, 40, 2, 2, "FD"); // Fill and Draw

  // Labels
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...themeColor);
  doc.text("PATIENT INFORMATION", margin + 5, yPos + 8);
  doc.text("PRESCRIBING DOCTOR", margin + (contentWidth/2) + 5, yPos + 8);

  // Divider Line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin + (contentWidth/2), yPos + 5, margin + (contentWidth/2), yPos + 35);

  // Content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  // Patient Data
  let pY = yPos + 16;
  const pName = booking.familyMember?.name || booking.user?.name || "N/A";
  const pAge = booking.familyMember?.age || booking.user?.age || "--";
  const pGender = booking.familyMember?.gender || booking.user?.gender || "--";
  
  doc.text(`Name: ${pName}`, margin + 5, pY);
  doc.text(`Age/Gender: ${pAge} yrs / ${pGender}`, margin + 5, pY + 5);
  doc.text(`Phone: ${booking.user?.phone || "N/A"}`, margin + 5, pY + 10);
  doc.text(`Email: ${booking.user?.email || "N/A"}`, margin + 5, pY + 15);

  // Doctor Data
  doc.setFont("helvetica", "bold");
  doc.text(docName, margin + (contentWidth/2) + 5, pY);
  doc.setFont("helvetica", "normal");
  doc.text(`Specialty: ${booking.specialist?.category?.toUpperCase() || "General Medicine"}`, margin + (contentWidth/2) + 5, pY + 5);
  doc.text("Qualification: MBBS, MD", margin + (contentWidth/2) + 5, pY + 10);
  doc.text("Reg. No.: MED/12345/2023", margin + (contentWidth/2) + 5, pY + 15);

  yPos += 50; // Move past card

  // ==================== DIAGNOSIS ====================
  if (rxObj.diagnosis) {
    yPos = checkPageBreak(yPos, 20);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...themeColor);
    doc.text("DIAGNOSIS / PROBLEM", margin, yPos);
    
    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const diagLines = doc.splitTextToSize(rxObj.diagnosis, contentWidth);
    doc.text(diagLines, margin, yPos);
    yPos += (diagLines.length * 5) + 10;
  }

  // ==================== MEDICINES ====================
  if (rxObj.medicines) {
    yPos = checkPageBreak(yPos, 40);

    // Rx Symbol
    doc.setFont("times", "bolditalic");
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text("Rx", margin, yPos);
    
    yPos += 8;

    // Table Header
    doc.setFillColor(...slateDark);
    doc.rect(margin, yPos, contentWidth, 8, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("MEDICINE", margin + 5, yPos + 5.5);
    doc.text("DOSAGE", margin + 95, yPos + 5.5);
    doc.text("DURATION", margin + 145, yPos + 5.5);

    yPos += 8;
    
    // Rows
    const medList = rxObj.medicines.split('\n').filter(m => m.trim());
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);

    medList.forEach((med, index) => {
        yPos = checkPageBreak(yPos, 8);
        
        // Zebra striping
        if (index % 2 === 0) {
             doc.setFillColor(248, 250, 252);
             doc.rect(margin, yPos, contentWidth, 8, "F");
        }

        const parts = med.split('|');
        const name = parts[0]?.trim() || med;
        const dosage = parts[1]?.trim() || "-";
        const duration = parts[2]?.trim() || "-";

        doc.text(name, margin + 5, yPos + 5.5);
        doc.text(dosage, margin + 95, yPos + 5.5);
        doc.text(duration, margin + 145, yPos + 5.5);

        yPos += 8;
    });
    
    yPos += 10;
  }

  // ==================== ADVICE ====================
  if (rxObj.advice) {
    yPos = checkPageBreak(yPos, 30);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...themeColor);
    doc.text("ADVICE / INSTRUCTIONS", margin, yPos);
    
    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    const adviceLines = rxObj.advice.split('\n');
    adviceLines.forEach(line => {
        if (!line.trim()) return;
        const bullet = "• ";
        const textArr = doc.splitTextToSize(bullet + line.trim(), contentWidth);
        yPos = checkPageBreak(yPos, textArr.length * 5);
        
        doc.text(textArr, margin, yPos);
        yPos += (textArr.length * 5) + 2;
    });
  }

  // ==================== SIGNATURE (Bottom Right) ====================
  // Check if there is enough space left on page, else add page
  if (yPos > pageHeight - 50) {
     doc.addPage();
     drawHeaderFooter(doc.getNumberOfPages());
     yPos = 60;
  }

  const signY = pageHeight - 45; // Fixed position near bottom
  const signX = pageWidth - margin - 50;
  
  doc.setDrawColor(...slateGray);
  doc.line(signX, signY, signX + 40, signY); 
  doc.setFontSize(8);
  doc.setTextColor(...slateGray);
  doc.text("Doctor's Signature", signX + 20, signY + 5, { align: "center" });

  // Save
  doc.save(`Prescription_RX${booking.id}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};