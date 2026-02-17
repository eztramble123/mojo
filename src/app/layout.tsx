import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-cursive",
});

export const metadata: Metadata = {
  title: "MojoMan - Bet on your best self.",
  description: "Stake on workouts, compete with friends, track streaks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${dancingScript.variable}`}>
        <Providers>
          <div className="studio-backdrop">
            <Navbar />
            <main className="relative z-10 min-h-screen">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
