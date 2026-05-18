import Image from "next/image";

const brands = [
  { name: "The Cosmetic Republic", logo: "/cosmetic_img.png" },
  { name: "ORS", logo: "/ors_img.jpg" },
  { name: "Bio Oil", logo: "/biooillogo.jpg" },
  { name: "The Cosmetic Republic 2", logo: "/cosmetic_img.png" },
  { name: "ORS 2", logo: "/ors_img.jpg" },
  { name: "Bio Oil 2", logo: "/biooillogo.jpg" },
];

export function BrandLogos() {
  return (
    <section className="py-12 border-y border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-10 opacity-60">
          {brands.map((brand, index) => (
            <div 
              key={index} 
              className="relative h-12 w-32 md:w-40 grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
            >
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}