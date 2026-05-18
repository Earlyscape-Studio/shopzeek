import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from '@/components/ui/sonner'

const soraSans = Sora({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "The Zeek Fashion Co. | Your One Stop Shop",
  description: "Premium Quality Products - Hair Care, Skin Care, Fragrances and more.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", soraSans.variable, "font-sans")}
      suppressHydrationWarning
    >
      <body className={soraSans.className}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
