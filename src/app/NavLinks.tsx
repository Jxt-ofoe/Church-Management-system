"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faUsers,
  faChurch,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

const links = [
  { href: "/", label: "Dashboard", icon: faChartLine },
  { href: "/members", label: "Members", icon: faUsers },
  { href: "/services", label: "Services", icon: faChurch },
  { href: "/report", label: "Reports", icon: faClipboardList },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex-1 py-6 px-3">
      <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-widest"
        style={{ color: 'var(--text-muted)' }}>
        Navigation
      </p>
      <ul className="space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || 
            (link.href !== "/" && pathname.startsWith(link.href));

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-white"
                    : "hover:bg-white/[0.04]"
                }`}
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.1))',
                        borderLeft: '3px solid #8b5cf6',
                        color: '#e2e8f0',
                      }
                    : { color: 'var(--text-muted)' }
                }
              >
                <div className="flex items-center justify-center w-5 h-5 text-sm shrink-0">
                  <FontAwesomeIcon icon={link.icon} className="w-4.5 h-4.5" />
                </div>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

