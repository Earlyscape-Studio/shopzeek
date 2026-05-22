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
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Text block centers on mobile, left-aligns on large screens */}
          <div className="text-center lg:text-left space-y-1">
            <p className="text-white text-xl font-bold">
              Subscribe & Get 10% OFF for first order
            </p>
            <p className="text-orange-100 text-sm">
              Get latest beauty tips when you subscribe
            </p>
          </div>
          
          {/* Input block handles width fluidly across mobile views */}
          <div className="flex items-center gap-2 w-full max-w-md lg:w-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="bg-white rounded-full w-full lg:w-80 h-12 px-5 text-black focus-visible:ring-0 focus-visible:ring-offset-0 border-none placeholder:text-gray-400"
            />
            <Button className="bg-black text-white hover:bg-gray-800 rounded-full h-12 px-6 font-semibold tracking-wide shrink-0 transition-colors">
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
            <div className="text-sm text-gray-500 mt-2">
              <p>Landmark House</p> 
              <p>No. 52-54 Isaac John Street</p> 
              <p>Ikeja GRA </p>
              <p>Lagos</p>
            </div>
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