import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CHURCH_NAME } from "@/lib/config";
import { NavLinks } from "./NavLinks";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCross } from "@fortawesome/free-solid-svg-icons";

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
      <body className="flex min-h-screen">

        {/* Sidebar Navigation */}
        <nav className="sidebar fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col no-print"
          style={{
            background: 'rgba(10, 14, 26, 0.95)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Logo / Church Name */}
          <div className="px-6 py-8 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                <FontAwesomeIcon icon={faCross} className="text-white w-4.5 h-4.5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-tight">{CHURCH_NAME}</h1>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Management System</p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <NavLinks />

          {/* Footer */}
          <div className="px-6 py-4 mt-auto border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              © {new Date().getFullYear()} {CHURCH_NAME}
            </p>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8 relative z-10 min-h-screen">
          <div className="max-w-6xl mx-auto fade-in">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

