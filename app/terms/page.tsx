export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto p-8 py-20">
      <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
      
      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-bold text-black mb-2">1. Introduction</h2>
          <p>Welcome to ReviveHub. By using our platform, you agree to these terms.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-black mb-2">2. Medical Advice Disclaimer</h2>
          <p>ReviveHub is an intermediary platform. We do not provide medical advice. Always consult with a qualified specialist for medical concerns.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black mb-2">3. Payments & Refunds</h2>
          <p>Payments made online are held securely. Refunds are processed within 5-7 working days for cancellations made 24 hours prior to the appointment.</p>
        </section>
      </div>
    </div>
  );
}