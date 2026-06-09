'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import InstallButton from './InstallButton';
import { useLanguage } from '@/context/LanguageContext'; // Importăm contextul

export default function Navbar() {
  const { language, t, toggleLanguage } = useLanguage(); // Hook-ul de limbă
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Meniul folosește acum cheile traduse din t
  const navItems = [
    {
      href: '/home', label: t.dashboard, icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      href: '/tests', label: t.myTests, icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      href: '/analytics', label: t.analytics, icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Side Menu */}
      <div
        className={`fixed left-0 top-0 z-40 h-full w-72 transform bg-card border-r border-border shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Image src="/logo.svg" alt="VitaCheck Logo" width={140} height={32} priority />
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Links */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
                  }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Menu Footer Mobile */}
          <div className="border-t border-border p-4 flex items-center justify-between gap-2 bg-transparent">
            <Link
              href="/profile"
              onClick={() => setIsMenuOpen(false)}
              className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/profile'
                  ? 'bg-primary text-primary-foreground justify-center relative'
                  : 'text-foreground hover:bg-muted justify-start'
                }`}
            >
              <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center transition-all ${pathname === '/profile' ? 'absolute left-4 bg-primary-foreground/20' : 'bg-primary/20'
                }`}>
                <svg className={`w-4 h-4 ${pathname === '/profile' ? 'text-primary-foreground' : 'text-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="font-medium truncate">{t.profile}</span>
            </Link>

            <div className="md:hidden flex-shrink-0">
              <InstallButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Menu Button + Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors lg:hidden"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link href="/home" className="flex items-center">
                <Image src="/logo.svg" alt="VitaCheck Logo" width={140} height={32} priority />
              </Link>
            </div>

            {/* Center Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right: Language, Theme Toggle & Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {mounted && (
                <>
                  {/* LANGUAGE TOGGLE BUTTON */}
                  <button
                    onClick={toggleLanguage}
                    className="w-9 h-9 text-xs font-bold rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center justify-center uppercase tracking-wider focus:outline-none"
                    title={language === 'ro' ? 'Switch to English' : 'Schimbă în Română'}
                  >
                    {language}
                  </button>

                  {/* Dark Mode Button */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none"
                    aria-label="Toggle Dark Mode"
                  >
                    {isDarkMode ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </button>
                </>
              )}

              {/* Profile Desktop */}
              <Link href="/profile" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className={`hidden sm:block text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${pathname === '/profile'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground group-hover:text-foreground group-hover:bg-muted'
                  }`}
                >
                  {t.profile}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}