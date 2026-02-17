"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletButton from "./WalletButton";
import { clsx } from "clsx";

const navLinks = [
  { href: "/", label: "Challenges" },
  { href: "/exercise", label: "Exercise" },
  { href: "/arena", label: "Arena" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-wii-glass/60 bg-white/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-semibold text-studio-blue">
              MojoMan
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-studio-blue/10 text-studio-blue"
                      : "text-wii-muted hover:text-wii-ink hover:bg-wii-mist/60"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
