'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ThemeController() {
  const pathname = usePathname();

  useEffect(() => {
    const authPaths = ['/', '/register', '/forgot-password', '/reset-password'];
    
    if (authPaths.includes(pathname)) {
      document.documentElement.classList.remove('dark');
    } else {
      if (localStorage.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [pathname]);

  return null;
}