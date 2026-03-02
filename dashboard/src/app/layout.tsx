import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brewnet Dashboard",
  description: "Meta-dashboard for managing Brewnet boilerplate stacks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
