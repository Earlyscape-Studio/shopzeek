export const categories = [
  { name: "All Products", slug: "", icon: "/product.svg" },
  { name: "Skin Care", slug: "Skincare", icon: "/skin-care.svg" },
  { name: "Hair Care", slug: "Haircare", icon: "/hair-care.svg" },
  { name: "Fragrance", slug: "Fragrance", icon: "/fragrance.svg" },
] as const;

export type CategoryItem = (typeof categories)[number];