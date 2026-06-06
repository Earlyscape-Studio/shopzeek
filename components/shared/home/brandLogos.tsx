import Image from "next/image";
import Link from "next/link"

const brands = [
  { name: "The Cosmetic Republic", logo: "/cosmetic_img.png", href:"/shop?brand=The+Cosmetic+Republic" },
  { name: "ORS", logo: "/ors_img.jpg", href: "/shop?brand=ORS" },
  { name: "Bio Oil", logo: "/biooillogo.jpg", href: "/shop?brand=Bio-Oil" },
  { name: "The Cosmetic Republic 2", logo: "/cosmetic_img.png", href:"/shop?brand=The+Cosmetic+Republic" },
  { name: "ORS 2", logo: "/ors_img.jpg", href: "/shop?brand=ORS" },
  { name: "Bio Oil 2", logo: "/biooillogo.jpg", href: "/shop?brand=Bio-Oil" },
];

export function BrandLogos() {
  return (
    <section className="py-12 border-y border-gray-100 bg-white w-screen">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center gap-8 md:gap-10 opacity-60">
          {brands.map((brand, index) => {
            const isVersion2 = brand.name.endsWith(" 2");
            return(
            <Link href={brand.href} 
              key={index} 
              className={`relative h-12 w-18 md:w-32 grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer ${isVersion2 ? "hidden md:block" : "block"}`}
            >
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-contain"
              />
            </Link>
            )})}
        </div>
      </div>
    </section>
  );
}