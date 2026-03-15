import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { BugProvider } from "@/lib/bug-context";

export const metadata: Metadata = {
  title: "RageOS — The World's Most Helpful Operating System",
  description: "Experience computing at its finest. (Results may vary.)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <BugProvider>
            {children}
          </BugProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
