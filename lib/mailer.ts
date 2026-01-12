import sgMail from "@sendgrid/mail";

// Initialize with API Key
if (process.env.SENDGRID_API) {
  sgMail.setApiKey(process.env.SENDGRID_API);
}

export const sendBookingConfirmation = async (booking: any, user: any, doctor: any) => {
  if (!process.env.SENDGRID_API) return console.log("⚠️ No SendGrid API Key found");

  const subject = `Appointment Confirmed: ${booking.slotTime} with Dr. ${doctor.name}`;
  const meetLink = booking.locationType === 'VIDEO' ? `https://revivehub.co.in/room/${booking.id}` : 'N/A';
  
  // 1. Email to User
  const userMsg = {
    to: user.email,
    from: 'notification@revivehub.co.in', // Your verified sender
    subject: subject,
    html: `
      <div style="font-family: sans-serif; color: #333;">
        <h1>Booking Confirmed! ✅</h1>
        <p>Hi ${user.name},</p>
        <p>Your appointment for <strong>${booking.locationType}</strong> is confirmed.</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
          <p><strong>Time:</strong> ${new Date(booking.date).toDateString()} at ${booking.slotTime}</p>
          <p><strong>Location:</strong> ${booking.locationType}</p>
          ${booking.locationType === 'VIDEO' ? `<p><strong>Join Link:</strong> <a href="${meetLink}">Click to Join</a></p>` : ''}
        </div>
        <p>Need help? Reply to care@revivehub.co.in</p>
      </div>
    `,
  };

  // 2. Email to Doctor (Optional)
  // You can add a separate send call here if needed

  try {
    await sgMail.send(userMsg);
    console.log("📧 Email sent to", user.email);
  } catch (error) {
    console.error("❌ SendGrid Error:", error);
  }
};