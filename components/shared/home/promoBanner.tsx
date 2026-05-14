import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PromoBanner() {
  return (
    <div className="bg-orange-500 mx-4 md:mx-8 my-10 rounded-2xl px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="text-white text-2xl font-bold">
          Free Samples on orders starting from ₦50,000 only
        </h3>
        <p className="text-orange-100 text-sm mt-1">
          Only on The Cosmetic Republic products
        </p>
      </div>
      <Button
        asChild
        className="bg-white text-orange-500 hover:bg-orange-50 rounded-full px-8 shrink-0"
      >
        <Link href="/shop">Get Deal Now</Link>
      </Button>
    </div>
  );
}