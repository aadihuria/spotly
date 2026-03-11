import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ReviewProvider } from "@/components/ReviewProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spotly – Discover study spots around Ann Arbor",
  description: "Discover, review, and share study spots around Ann Arbor.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ReviewProvider>
            {children}
          </ReviewProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
