"use client";

import html2pdf from "html2pdf.js";
import { format } from "date-fns";

interface InvoiceProps {
  booking: {
    id: number;
    specialist: {
      name: string;
      category?: string;
    };
    date: string;
    slotTime?: string;
    totalPrice: number;
    amountPaid: number;
    platformFee?: number;
    status?: string;
  };
  user: {
    name: string;
    email: string;
    phone?: string;
  };
}

export const generateInvoice = async ({ booking, user }: InvoiceProps) => {
  const balance = booking.totalPrice - booking.amountPaid;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
${invoiceStyles}
</style>
</head>

<body>
  <div class="invoice-container">

    <!-- Header -->
    <div class="invoice-header">
      <div class="logo-container">
        <img src="/icon.png" class="logo-img" />
        <div>
          <div class="company-name">ReviveHub</div>
          <div class="company-tagline">Healthcare Reimagined</div>
        </div>
      </div>
      <div class="invoice-title">
        <h1>INVOICE</h1>
        <div class="invoice-number">#INVO${booking.id}</div>
      </div>
    </div>

    <!-- Invoice Info -->
    <div class="invoice-info">
      <div class="company-info">
        <p><strong>Company:</strong> ReviveHub Healthcare</p>
        <p><strong>Address:</strong> 160, Islampur Sector 38, Gurgaon, Haryana</p>
        <p><strong>Email:</strong> support@revivehub.com</p>
        <p><strong>Phone:</strong> +91 12345 67890</p>
      </div>

      <div class="invoice-details">
        <div class="invoice-details-box">
          <h3>Invoice Details</h3>
          <div class="detail-row">
            <span>Date Issued:</span>
            <span>${format(new Date(booking.date), "dd MMM yyyy")}</span>
          </div>
          <div class="detail-row">
            <span>Status:</span>
            <span class="status-upcoming">${booking.status || "UPCOMING"}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Billing -->
    <div class="billing-section">
      <h3 class="section-title">BILL TO</h3>
      <div class="bill-to">
        <div class="bill-to-info">
          <h4>Client Information</h4>
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          ${user.phone ? `<p><strong>Phone:</strong> ${user.phone}</p>` : ""}
        </div>

        <div class="bill-to-info">
          <h4>Invoice Summary</h4>
          <p><strong>Invoice No:</strong> INVO${booking.id}</p>
          <p><strong>Payment Terms:</strong> 30 Days</p>
        </div>
      </div>
    </div>

    <!-- Services -->
    <div class="services-section">
      <h3 class="section-title">SERVICES RENDERED</h3>
      <table class="services-table">
        <thead>
          <tr>
            <th>DESCRIPTION</th>
            <th>QTY</th>
            <th>UNIT PRICE</th>
            <th>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span class="service-description">
                Medical Consultation with ${booking.specialist.name}
              </span>
              <span class="service-specialty">
                Speciality: ${booking.specialist.category || "-"} |
                ${format(new Date(booking.date), "dd MMM yyyy")} ${booking.slotTime || ""}
              </span>
            </td>
            <td>1 Session</td>
            <td>₹${booking.totalPrice.toFixed(2)}</td>
            <td class="amount">₹${booking.totalPrice.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Payment Summary -->
    <div class="payment-summary">
      <h3 class="section-title">PAYMENT SUMMARY</h3>
      <table class="summary-table">
        <tr>
          <td class="summary-label">Consultation Fee:</td>
          <td class="summary-value">₹${booking.totalPrice.toFixed(2)}</td>
        </tr>
        <tr>
          <td class="summary-label">Platform Fee:</td>
          <td class="summary-value">₹${(booking.platformFee || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td class="summary-label">Amount Paid:</td>
          <td class="summary-value">₹${booking.amountPaid.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td class="summary-label total-label">BALANCE DUE:</td>
          <td class="summary-value total-value">₹${balance.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <div class="invoice-footer">
      <div class="thank-you">
        <strong>Thank you for choosing ReviveHub.</strong>
        We are committed to providing exceptional healthcare services.
        <p class="generated-note">
          This is a computer-generated invoice. No signature required.
        </p>
      </div>
      <div class="terms">
        <p><strong>Terms & Conditions:</strong></p>
        <p>Payment is due within 30 days of invoice date.</p>
        <p>Your Health, Revived.</p>
      </div>
    </div>

  </div>
</body>
</html>
`;

  await html2pdf()
    .set({
      filename: `Invoice-INVO${booking.id}.pdf`,
      margin: 10,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(html)
    .save();
};

/* ----------------------------- FULL CSS (UNCHANGED) ----------------------------- */
const invoiceStyles = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background: #f8f9fa;
  padding: 20px;
}

.invoice-container {
  max-width: 800px;
  margin: auto;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.invoice-header {
  background: linear-gradient(135deg, #1a5f7a 0%, #2d8da3 100%);
  padding: 30px 40px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-img {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  background: rgba(255,255,255,0.2);
  padding: 5px;
}

.company-name {
  font-size: 28px;
  font-weight: 700;
}

.company-tagline {
  font-size: 14px;
  opacity: 0.9;
}

.invoice-title h1 {
  font-size: 32px;
}

.invoice-number {
  background: rgba(255,255,255,0.15);
  padding: 5px 15px;
  border-radius: 20px;
  display: inline-block;
}

.invoice-info {
  padding: 30px 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.invoice-details-box {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #57cc99;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed #e0e0e0;
  margin-bottom: 10px;
  padding-bottom: 6px;
}

.billing-section,
.payment-summary {
  padding: 25px 40px;
  background: #f8fafc;
}

.services-section {
  padding: 25px 40px;
}

.services-table {
  width: 100%;
  border-collapse: collapse;
}

.services-table thead {
  background: #1a5f7a;
  color: white;
}

.services-table th,
.services-table td {
  padding: 15px;
}

.service-description {
  font-weight: 600;
  color: #1a5f7a;
}

.summary-table {
  max-width: 400px;
  margin-left: auto;
}

.total-row td {
  font-weight: 700;
  color: #1a5f7a;
}

.invoice-footer {
  padding: 25px 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}
`;
