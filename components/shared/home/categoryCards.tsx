// components/storefront/home/CategoryCards.tsx
import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    title: "Get Radiant\nSkin!",
    desc: "glow like never before with our best selling skincare products.",
    href: "/shop?category=Skin+Care",
    bg: "bg-[#F4F6F8]",
    image: "/skin_img.png",
  },
  {
    title: "Enhance Your\nBeauty",
    desc: "Discover you hair's potential with our best selling haircare products",
    href: "/shop?category=Hair+Care",
    bg: "bg-[#FFF0E6]",
    image: "/beauty_img.png",
  },
  {
    title: "Get Great\nFragrances",
    desc: "Discover your signature scent with our best selling fragrances",
    href: "/shop?category=Fragrances",
    bg: "bg-[#FDECEE]",
    image: "/fragrance_img.jpg",
  },
];


//TODO: there should be shop now buttons that take us to the shop section with it's category selected

//TODO: Also need to work on categories dropdown.

export function CategoryCards() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map(({ title, desc, href, bg, image }) => (
          <Link
            key={title}
            href={href}
            className={`${bg} rounded-3xl overflow-hidden flex flex-col h-[450px] relative group transition-transform hover:-translate-y-1`}
          >
            {/* Text at the top */}
            <div className="p-8 pb-0 z-10">
              <h3 className="text-3xl font-bold text-gray-900 whitespace-pre-line leading-tight">
                {title}
              </h3>
              <p className="text-xs text-gray-600 mt-4 leading-relaxed max-w-[200px]">
                {desc}
              </p>
            </div>
            
            {/* Image at the bottom */}
            <div className="relative flex-1 w-full mt-4">
              <Image 
                src={image} 
                alt={title.replace("\n", " ")}
                fill
                className="object-contain object-bottom group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}