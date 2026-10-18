import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { FeedbackButton } from "@/components/FeedbackButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jinx",
  description: "Sleep better with Jinx.",
};

// Mobile-first viewport — prevent zoom on input focus on iOS
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      {/*
       * max-w-md centers a phone-width column on large screens.
       * The app is mobile-first; desktop is a phone-width card.
       */}
      <body className="min-h-full bg-gray-50 text-gray-900">
        <div className="mx-auto min-h-full max-w-md flex flex-col">
          {children}
        </div>
        <FeedbackButton />
      </body>
    </html>
  );
}
