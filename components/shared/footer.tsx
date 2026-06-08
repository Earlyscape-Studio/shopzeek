import Link from "next/link";
import Image from "next/image"
import { Mail, Phone, MapPin } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faFacebookF, faInstagram } from "@fortawesome/free-brands-svg-icons";

const footerLinks = {
  Company: [
    { label: "About Zeek", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Shop All", href: "/shop" },
  ],
  "Help Center": [
    { label: "FAQs", href: "/faqs" },
    { label: "Return Policy", href: "/policy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
  Partner: [
    { label: "Become Seller", href: "/seller" },
    { label: "Affiliate Program", href: "/affiliate" },
    { label: "Partnerships & Advertising", href: "/partenershipsandadvertising" },
  ],
};

export function Footer() {
  return (
    <footer className="w-full bg-white border-t-2 border-gray-300 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12 md:gap-8">
          
          {/* Brand & Info Section */}
          <div className="col-span-1 md:col-span-2 space-y-6 flex flex-col items-start md:items-start text-left md:text-left">
            <Link href="/">
              <Image src="/zeek2.svg" alt="Zeek Logo" width={120} height={40} className="object-contain" />
            </Link>
            
            <div className="space-y-3 text-sm text-gray-500">
              <div className="flex items-start justify-start md:justify-start gap-3">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <p>Landmark House, No. 52-54 Isaac John Street,<br />Ikeja GRA, Lagos, Nigeria.</p>
              </div>
              <div className="flex items-start justify-start md:justify-start gap-3">
                <Phone className="w-4 h-4 text-orange-500" />
                <p>+(+234) 911 049 7316</p>
              </div>
              <div className="flex items-start justify-start md:justify-start gap-3">
                <Mail className="w-4 h-4 text-orange-500" />
                <p>hello@zeek.you</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 pt-2">
              <a href="https://x.com/zeekonline" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-all">
                <FontAwesomeIcon icon={faXTwitter} className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-all">
                <FontAwesomeIcon icon={faFacebookF} className="w-4 h-4" />
              </a>
              <a href="https://instagram.com/zeek.you" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-all">
                <FontAwesomeIcon icon={faInstagram} className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading} className="col-span-1 md:col-span-1 flex flex-col items-start md:items-start text-left md:text-left">
              <h4 className="font-bold text-gray-900 text-sm tracking-wider uppercase mb-5">
                {heading}
              </h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* New Column: Newsletter Hint/App Store (Optional) */}
          {/* <div className="col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="font-bold text-gray-900 text-sm tracking-wider uppercase mb-5">
              Newsletter
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              Get the latest updates on new products and upcoming sales.
            </p>
            <Link href="/signup" className="text-sm font-bold text-orange-500 hover:underline">
              Join Zeek Now →
            </Link>
          </div> */}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-50 bg-gray-50/50 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Zeek. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Privacy
            </Link>
            <Link href="/cookies" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}