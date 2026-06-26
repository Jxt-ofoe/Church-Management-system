"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark, faCross } from "@fortawesome/free-solid-svg-icons";
import { NavLinks } from "./NavLinks";
import { CHURCH_NAME } from "@/lib/config";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/90 border-b border-white/5 backdrop-blur-md z-40 flex items-center justify-between px-4 no-print">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
            <FontAwesomeIcon icon={faCross} className="text-white w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-white leading-tight truncate">
            {CHURCH_NAME}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-white shrink-0"
        >
          <FontAwesomeIcon icon={isOpen ? faXmark : faBars} className="w-4 h-4" />
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 z-50 flex flex-col no-print transition-transform duration-300 transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: 'rgba(10, 14, 26, 0.98)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header / Logo */}
        <div className="px-6 py-6 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
              <FontAwesomeIcon icon={faCross} className="text-white w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white leading-tight truncate">{CHURCH_NAME}</h1>
              <p className="text-xs text-slate-500 mt-0.5">Management System</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Links */}
        <div onClick={() => setIsOpen(false)} className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 mt-auto border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {CHURCH_NAME}
          </p>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen pt-20 lg:pt-8 lg:ml-64 p-4 md:p-8 relative z-10 w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
