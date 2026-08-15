import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { LanguageProvider } from "@/components/LanguageProvider";

export const metadata: Metadata = {
  title: "AI TONKEEPER",
  description: "Secure Crypto Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}