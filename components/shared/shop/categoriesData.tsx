export const categories = [
  { name: "All Products", slug: "", icon: "/product.svg" },
  { name: "Skin Care", slug: "Skin Care", icon: "/skin-care.svg" },
  { name: "Hair Care", slug: "Hair Care", icon: "/hair-care.svg" },
  { name: "Fragrance", slug: "Fragrance", icon: "/fragrance.svg" },
] as const;

export type CategoryItem = (typeof categories)[number];