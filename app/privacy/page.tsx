export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto p-8 py-20">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">Last Updated: {new Date().getFullYear()}</p>
      
      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-bold text-black mb-2">1. Information We Collect</h2>
          <p>We collect personal information such as name, email, phone number, and medical details provided during booking.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-black mb-2">2. How We Use Your Data</h2>
          <p>Your data is used solely for:</p>
          <ul className="list-disc pl-5">
            <li>Facilitating appointments with specialists.</li>
            <li>Processing payments and refunds.</li>
            <li>Sending appointment reminders.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black mb-2">3. Data Security</h2>
          <p>We use industry-standard encryption to protect your personal and medical data. We do not sell your data to third parties.</p>
        </section>
      </div>
    </div>
  );
}