// components/storefront/Footer.tsx
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const footerLinks = {
  Products: [
    "Hair Care", "Skin Care Oil", "Body Oil",
    "Fragrance", "Body Lotion", "Beauty Soap", "Hair Mask",
  ],
  Company: ["About Shop Zeek", "Shop", "Blog", "Store Locations"],
  "Help Center": [
    "Customer Service", "Policy", "Terms & Conditions",
    "Track Order", "FAQs", "My Account", "Product Support",
  ],
  Partner: ["Become Seller", "Affiliate", "Advertise", "Partnership"],
};

export function Footer() {
  return (
    <footer>
      {/* Newsletter */}
      <div className="bg-orange-500 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white text-xl font-bold">
              Subscribe & Get 10% OFF for first order
            </p>
            <p className="text-orange-100 text-sm">
              Get latest beauty tips when you subscribe
            </p>
          </div>
          <div className="flex gap-2 p-8 sm:w-auto">
            <Input
              placeholder="Enter your email address"
              className="bg-white rounded-full w-lg max-w-lg p-5"
            />
            <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-5">
              SUBSCRIBE
            </Button>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <span className="text-2xl font-bold text-orange-500">Zeek.</span>
            <p className="text-sm text-orange-500 font-semibold mt-2">
              HOTLINE 24/7
            </p>
            <p className="text-sm font-bold">(+234) 911 049 7316</p>
            <p className="text-sm text-gray-500 mt-2">
              257 Thatcher Road St, Brooklyn, Manhattan, NY 10092
            </p>
            <p className="text-sm text-gray-500">contactcenter@shopzeek.com</p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-semibold text-sm mb-3">{heading}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        Zeek © 2026.
      </div>
    </footer>
  );
}