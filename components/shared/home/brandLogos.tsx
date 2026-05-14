

const brands = [
  "THE COSMETIC REPUBLIC",
  "ORS",
  "THE COSMETIC REPUBLIC",
  "ORS",
  "THE COSMETIC REPUBLIC",
  "ORS",
];

export function BrandLogos() {
  return (
    <div className="border-y border-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4 overflow-x-auto">
        {brands.map((brand, i) => (
          <span
            key={i}
            className="text-xs font-bold text-gray-400 shrink-0 tracking-wider"
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
}