"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const PAGES = [
  { label: "Dashboard", href: "/" },
  { label: "Philosophy", href: "/philosophy" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-card border-b-4 border-foreground">
      <div className="w-full px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="flex items-center justify-center px-2 py-2 bg-white dark:bg-card font-bold text-sm sm:text-base border-foreground hover:bg-foreground/5 transition-colors"
              style={{ borderWidth: "3px" }}
              aria-label="Home"
            >
              <Image
                src="/nt-logo.png"
                alt="Nameless Trading Logo"
                width={24}
                height={24}
                className="w-5 h-5 sm:w-6 sm:h-6"
              />
            </Link>

            <div className="flex items-center gap-3">
              {PAGES.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                      isActive
                        ? "bg-foreground text-background border-foreground"
                        : "bg-white dark:bg-card text-foreground border-foreground hover:bg-foreground/5"
                    }`}
                    style={{ borderWidth: "3px" }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
