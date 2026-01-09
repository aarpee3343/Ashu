export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white text-lg font-bold mb-4">HealthPlatform</h3>
          <p className="text-sm leading-relaxed">
            Connecting patients with trusted specialists for a better tomorrow. Secure, private, and fast.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Specialties</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-400">Physiotherapy</a></li>
            <li><a href="#" className="hover:text-blue-400">Nutrition</a></li>
            <li><a href="#" className="hover:text-blue-400">Speech Therapy</a></li>
            <li><a href="#" className="hover:text-blue-400">Mental Health</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-400">Help Center</a></li>
            <li><a href="#" className="hover:text-blue-400">Terms of Service</a></li>
            <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-blue-400">Contact Us</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Newsletter</h4>
          <p className="text-sm mb-4">Subscribe to get health tips.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Email" className="bg-gray-800 border-none rounded px-3 py-2 text-sm w-full" />
            <button className="bg-blue-600 px-4 py-2 rounded text-sm text-white font-medium">Go</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-sm">
        © {new Date().getFullYear()} HealthPlatform. All rights reserved.
      </div>
    </footer>
  );
}