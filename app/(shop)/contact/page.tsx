import Link from "next/link";
import Image from "next/image"
import { Phone, Mail, MapPin } from "lucide-react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXTwitter, faFacebookF, faInstagram, faYoutube} from "@fortawesome/free-brands-svg-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumbs */}
      <div className="mb-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#FF5A00]">Contact</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#FF5A00] mb-4">Contact Us</h1>
        <p className="text-gray-600 font-medium">Any question or remarks? Just write us a message!</p>
      </div>

      <div className="bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2 md:p-4 border border-gray-100 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Orange Block */}
        <div className="bg-[#FF5A00] text-white p-10 rounded-lg lg:w-[400px] flex flex-col relative overflow-hidden shrink-0">
          <h3 className="text-2xl font-bold mb-2 z-10">Contact Information</h3>
          <p className="text-orange-100 mb-12 z-10">Say something to start a live chat!</p>

          <div className="space-y-8 z-10 flex-1">
            <div className="flex items-center gap-4">
              <Phone className="h-5 w-5 text-orange-200" />
              <span>+(+234) 911 049 7316</span>
            </div>
            <div className="flex items-center gap-4">
              <Mail className="h-5 w-5 text-orange-200" />
              <span>info@zeek.you</span>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-orange-200 shrink-0" />
              <p>Landmark House</p> 
              <p>No. 52-54 Isaac John Street</p> 
              <p>Ikeja GRA </p>
              <p>Lagos</p>
            </div>
          </div>

         <div className="flex items-center gap-4 mt-12 z-10">
            <a href="#" className="h-10 w-10 rounded-full bg-orange-400 hover:bg-white hover:text-[#FF5A00] flex items-center justify-center transition-colors">
              <FontAwesomeIcon icon={faXTwitter} className="w-5 h-5" />
            </a>
            <a href="#" className="h-10 w-10 rounded-full bg-orange-400 hover:bg-white hover:text-[#FF5A00] flex items-center justify-center transition-colors">
              <FontAwesomeIcon icon={faFacebookF} className="w-5 h-5" />
            </a>
            <a href="#" className="h-10 w-10 rounded-full bg-orange-400 hover:bg-white hover:text-[#FF5A00] flex items-center justify-center transition-colors">
              <FontAwesomeIcon icon={faInstagram} className="w-5 h-5" />
            </a>
            <a href="#" className="h-10 w-10 rounded-full bg-orange-400 hover:bg-white hover:text-[#FF5A00] flex items-center justify-center transition-colors">
              <FontAwesomeIcon icon={faYoutube} className="w-5 h-5" />
            </a>
          </div>

          {/* Decorative Circles */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500 rounded-full opacity-50 z-0"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-orange-400 rounded-full opacity-50 z-0"></div>
        </div>

        {/* Right Form Block */}
        <div className="p-8 md:p-12 flex-1">
          <form className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">First Name</label>
                <Input className="border-0 border-b border-gray-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#FF5A00] bg-transparent" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Last Name</label>
                <Input defaultValue="" className="border-0 border-b border-gray-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#FF5A00] bg-transparent" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Email</label>
                <Input type="email" className="border-0 border-b border-gray-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#FF5A00] bg-transparent" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Phone Number</label>
                <Input type="tel" defaultValue="" className="border-0 border-b border-gray-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#FF5A00] bg-transparent text-gray-900 font-medium" />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <label className="text-sm font-bold text-gray-900">Select Subject?</label>
              <RadioGroup defaultValue="general1" className="flex flex-wrap gap-6">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="flex items-center space-x-2">
                    <RadioGroupItem value={`general${num}`} id={`general${num}`} className="border-gray-300 text-[#FF5A00]" />
                    <label htmlFor={`general${num}`} className="text-sm font-medium text-gray-600 cursor-pointer">
                      General Inquiry
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2 pt-4">
              <label className="text-xs font-bold text-gray-500">Message</label>
              <Textarea 
                placeholder="Write your message.." 
                className="border-0 border-b border-gray-300 rounded-none px-0 resize-none min-h-[60px] focus-visible:ring-0 focus-visible:border-[#FF5A00] bg-transparent" 
              />
            </div>

            <div className="flex justify-end pt-4 relative">
              <Button type="submit" className="bg-[#FF5A00] hover:bg-orange-600 text-white font-bold h-12 px-10 rounded-sm">
                Send Message
              </Button>
              
              {/* Paper Airplane Decorative SVG (Optional aesthetic touch from your design) */}
              <div className="absolute bottom-0 right-48 top-10 hidden md:block opacity-20 pointer-events-none">
                 <Image
                      src="/paper_plane.png"
                      alt="paper plane image"
                      width={200}
                      height={300}
                      className="object-contain -rotate-30"
                   />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}