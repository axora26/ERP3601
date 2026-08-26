import type { Metadata } from "next";
import "./globals.css";

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "AXORA ONE";

export const metadata: Metadata = {
  title: appName,
  description: `${appName} — enterprise operating system for construction and engineering.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#axora-main-content" className="axora-skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
