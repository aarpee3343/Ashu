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
    duration?: number;
    locationType?: string; // 'CLINIC', 'VIDEO', 'HOME'
  };
  user: {
    name: string;
    email: string;
    phone?: string;
  };
}

export const generateInvoice = async ({ booking, user }: InvoiceProps) => {
  const balance = booking.totalPrice - booking.amountPaid;
  const today = new Date();
  
  // Determine quantity based on location type
  let quantityText = "1 Session";
  let unitPrice = booking.totalPrice;
  
  if (booking.locationType === 'HOME' && booking.duration && booking.duration > 1) {
    quantityText = `${booking.duration} Sessions`;
    unitPrice = booking.totalPrice / booking.duration;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
${invoiceStyles}
</style>
</head>

<body>
  <div class="invoice-container">

    <div class="invoice-header">
      <div class="logo-container">
        <img src="/icon.png" class="logo-img" alt="ReviveHub Logo" />
        <div>
          <div class="company-name">ReviveHub</div>
          <div class="company-tagline">Healthcare Reimagined</div>
        </div>
      </div>
      <div class="invoice-title">
        <h1>INVOICE</h1>
        <div class="invoice-number">#RHINV${booking.id}</div>
      </div>
    </div>

    <!-- Invoice Info - Consolidated as requested -->
    <div class="invoice-details-consolidated">
      <div class="invoice-info-box">
        <h3>Invoice Details</h3>
        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">Invoice No:</span>
            <span class="detail-value">RHINV${booking.id}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Date Issued:</span>
            <span class="detail-value">${format(today, "dd MMM yyyy")}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Service Status:</span>
            <span class="status-badge ${booking.status?.toLowerCase() || 'upcoming'}">${booking.status || "UPCOMING"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Terms:</span>
            <span class="detail-value">7 Days</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Billing Section - Better space utilization -->
    <div class="billing-section-enhanced">
      <h3 class="section-title"><strong>BILL TO :</strong></h3>
      <div class="billing-grid">
        <div class="bill-to-info">
          <h4>Client Information</h4>
          <div class="client-details">
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            ${user.phone ? `<p><strong>Phone:</strong> ${user.phone}</p>` : ""}
          </div>
        </div>
        <div class="company-info">
          <h4><strong>From ReviveHub</strong></h4>
          <p><strong>Address:</strong> 160, Islampur Sector 38, Gurgaon, Haryana</p>
          <p><strong>Email:</strong> support@revivehub.com</p>
          <p><strong>Phone:</strong> +91 12345 67890</p>
        </div>
      </div>
    </div>

    <!-- Services -->
    <div class="services-section">
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
                Speciality: ${booking.specialist.category || "-"} <br>
                ${format(new Date(booking.date), "dd MMM yyyy")} ${booking.slotTime || ""} |
                ${booking.locationType ? `${booking.locationType.charAt(0) + booking.locationType.slice(1).toLowerCase()} Visit` : "Clinic Visit"}
              </span>
            </td>
            <td>${quantityText}</td>
            <td>₹${unitPrice.toFixed(2)}</td>
            <td class="amount">₹${booking.totalPrice.toFixed(2)}</td>
          </tr>
          ${booking.platformFee && booking.platformFee > 0 ? `
          <tr>
            <td>
              <span class="service-description">
                Platform Service Fee
              </span>
              <span class="service-specialty">
                Booking facilitation, customer support, payment processing
              </span>
            </td>
            <td>1</td>
            <td>₹${booking.platformFee.toFixed(2)}</td>
            <td class="amount">₹${booking.platformFee.toFixed(2)}</td>
          </tr>
          ` : ''}
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
        ${booking.platformFee && booking.platformFee > 0 ? `
        <tr>
          <td class="summary-label">Platform Fee:</td>
          <td class="summary-value">₹${booking.platformFee.toFixed(2)}</td>
        </tr>
        ` : ''}
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

    <!-- Footer Section as requested -->
    <div class="invoice-footer-section">
      <div class="footer-content">
        <div class="thank-you-message">
          <p><strong>Thank you for choosing ReviveHub.</strong></p>
          <p>We are committed to providing exceptional healthcare services.</p>
          <p class="generated-note">This is a computer-generated invoice. No signature required.</p>
        </div>
        <div class="terms-section">
          <p><strong>Terms & Conditions:</strong></p>
          <p>Payment is due within 30 days of invoice date.</p>
          <p>Your Health, Revived.</p>
        </div>
      </div>
    </div>

    <!-- Page Footer -->
    <div class="page-footer">
      <p>ReviveHub Healthcare • 160, Islampur Sector 38, Gurgaon, Haryana • support@revivehub.com</p>
      <p class="page-number">Page 1 of 1</p>
    </div>

  </div>
</body>
</html>
`;

  const options = {
    filename: `Invoice-INVO${booking.id}.pdf`,
    margin: [10, 10, 10, 10],
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      width: 800,
      height: 1120,
      letterRendering: true
    },
    jsPDF: { 
      unit: "mm", 
      format: "a4", 
      orientation: "portrait"
    }
  };

  await html2pdf()
    .set(options)
    .from(html)
    .save();
};

/* ----------------------------- YOUR ORIGINAL CSS + MINIMAL UPDATES ----------------------------- */
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
  width: 210mm;
  min-height: 297mm;
  margin: auto;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  padding-bottom: 40px;
}

/* Header */
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

/* Invoice Details Section */
.invoice-details-consolidated {
  padding: 25px 40px 15px 40px;
}

.invoice-info-box {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #57cc99;
}

.invoice-info-box h3 {
  font-size: 18px;
  color: #1a5f7a;
  margin-bottom: 15px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.completed {
  background: #d1f7c4;
  color: #166534;
}

.status-badge.upcoming {
  background: #c7d2fe;
  color: #3730a3;
}

.status-badge.ongoing {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.cancelled {
  background: #fecaca;
  color: #991b1b;
}

/* Billing Section */
.billing-section-enhanced {
  padding: 15px 40px;
}

.section-title {
  font-size: 16px;
  color: #1a5f7a;
  margin-bottom: 15px;
}

.billing-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.bill-to-info h4, .company-info h4 {
  color: #1a5f7a;
  margin-bottom: 10px;
  font-size: 16px;
}

.client-details p, .company-info p {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.4;
}

/* Services Table */
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
  text-align: left;
}

.service-description {
  font-weight: 600;
  color: #1a5f7a;
  display: block;
  margin-bottom: 5px;
}

.service-specialty {
  font-size: 12px;
  color: #666;
  display: block;
}

/* Payment Summary */
.payment-summary {
  padding: 25px 40px;
  background: #f8fafc;
}

.summary-table {
  max-width: 400px;
  margin-left: auto;
}

.summary-label {
  text-align: right;
  padding: 8px 0;
  font-weight: 500;
}

.summary-value {
  text-align: right;
  padding: 8px 0;
  font-weight: 600;
  padding-left: 20px;
}

.total-row td {
  font-weight: 700;
  color: #1a5f7a;
  border-top: 2px solid #1a5f7a;
  padding-top: 10px;
}

/* Footer Section */
.invoice-footer-section {
  padding: 20px 40px;
  margin-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.thank-you-message p {
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.4;
  color: #555;
}

.generated-note {
  font-style: italic;
  color: #777;
  font-size: 12px;
  margin-top: 10px;
}

.terms-section p {
  margin-bottom: 8px;
  font-size: 13px;
  color: #555;
  line-height: 1.4;
}

/* Page Footer */
.page-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #f8f9fa;
  padding: 10px 40px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
  font-size: 11px;
  color: #666;
}

.page-footer p {
  margin-bottom: 4px;
}

.page-number {
  font-weight: 600;
  color: #1a5f7a;
}

/* Print styles for multi-page support */
@media print {
  body {
    margin: 0;
    padding: 0;
  }
  
  .invoice-container {
    width: 100%;
    min-height: 100vh;
    margin: 0;
    border-radius: 0;
  }
  
  .page-footer {
    position: fixed;
    bottom: 0;
  }
}
`;