"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCity } from "@/hooks/useCity";

const CITY_LABELS: Record<string, string> = {
  delhi: "Delhi",
  mumbai: "Mumbai",
  bangalore: "Bangalore",
  chennai: "Chennai",
  hyderabad: "Hyderabad",
  pune: "Pune",
  ahmedabad: "Ahmedabad",
  kolkata: "Kolkata",
  jaipur: "Jaipur",
  lucknow: "Lucknow",
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/advisor", label: "Advisor" },
  { href: "/compare", label: "Compare" },
];

export function Header() {
  const pathname = usePathname();
  const { city } = useCity();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <span className="text-xl font-bold text-brand-navy tracking-tight">Auto</span>
            <span className="text-xl font-bold text-brand-red tracking-tight">Sage</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  pathname === href
                    ? "text-brand-navy"
                    : "text-gray-500 hover:text-brand-navy"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* City badge + mobile hamburger */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
              <svg className="w-3 h-3 text-brand-red" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {CITY_LABELS[city] ?? city}
            </span>

            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-64 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="font-bold text-brand-navy">
            Auto<span className="text-brand-red">Sage</span>
          </span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-50"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col p-4 gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setDrawerOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-brand-navy text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-3 h-3 text-brand-red" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Prices for {CITY_LABELS[city] ?? city}
          </div>
        </div>
      </div>
    </>
  );
}
