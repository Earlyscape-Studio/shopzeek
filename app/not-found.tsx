import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold tracking-widest text-orange-500 uppercase mb-3">
        404
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
        We couldn&apos;t find that page
      </h1>
      <p className="text-gray-500 max-w-md mb-8">
        The page you&apos;re looking for may have been moved, renamed, or no
        longer exists. Let&apos;s get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Link href="/">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/shop">
            <Search className="w-4 h-4" /> Browse Products
          </Link>
        </Button>
      </div>
    </div>
  );
}