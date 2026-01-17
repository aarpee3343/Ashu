// components/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Services: [
      { label: "Find Specialists", href: "/specialists" },
      { label: "Video Consultation", href: "#" },
      { label: "Medicine Delivery", href: "#" },
      { label: "Home Visits", href: "#" },
    ],
    Company: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Press", href: "/press" },
    ],
    Support: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image
                  src="/logo.png"
                  alt="ReviveHub Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  ReviveHub
                </h2>
                <p className="text-gray-400 text-sm">Healthcare Reimagined</p>
              </div>
            </div>
            
            <p className="text-gray-300 max-w-md">
              Connecting patients with trusted healthcare specialists for online consultations, 
              home visits, and comprehensive medical care.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4 text-white">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3 text-gray-300">
            <Phone size={18} className="text-blue-400" />
            <div>
              <p className="text-sm">Call us</p>
              <p className="font-semibold">+91 12345 67890</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <Mail size={18} className="text-blue-400" />
            <div>
              <p className="text-sm">Email us</p>
              <p className="font-semibold">support@revivehub.co.in</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <MapPin size={18} className="text-blue-400" />
            <div>
              <p className="text-sm">Visit us</p>
              <p className="font-semibold">Mumbai, Maharashtra</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} ReviveHub. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-white text-sm">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}