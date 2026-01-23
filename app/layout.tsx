import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nameless Trading",
    template: "%s | Nameless Trading",
  },
  description: "Nameless Trading Portfolio Overview",
  metadataBase: new URL("https://namelesstrading.com"),
  applicationName: "Nameless Trading",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/nt.png",
  },
  openGraph: {
    title: "Nameless Trading",
    description: "Nameless Trading Portfolio Overview",
    url: "https://namelesstrading.com",
    siteName: "Nameless Trading",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
