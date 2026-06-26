import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CHURCH_NAME } from "@/lib/config";
import { SidebarLayout } from "./SidebarLayout";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

config.autoAddCss = false;

export const metadata: Metadata = {
  title: `${CHURCH_NAME} — Management System`,
  description: `Church management system for ${CHURCH_NAME}. Manage members, services, attendance, offerings, and generate monthly reports.`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: CHURCH_NAME,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0e1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) { console.log('PWA ServiceWorker registered. Scope:', reg.scope); },
                    function(err) { console.warn('PWA ServiceWorker registration failed:', err); }
                  );
                });
              }
            `
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}


