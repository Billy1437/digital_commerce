import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GG Mart — ML Diamonds, PUBG UC & Game Accounts in Myanmar",
    template: "%s · GG Mart",
  },
  description:
    "Buy Mobile Legends diamonds, PUBG UC and ranked game accounts in Myanmar. Pay with KBZPay, Wave Money or PromptPay — verified by a real admin, delivered fast.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
