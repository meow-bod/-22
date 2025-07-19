'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: '首頁' },
  { href: '/search', label: '尋找保姆' },
  { href: '/profile', label: '個人資料' },
  { href: '/pets', label: '我的寵物' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-primary">
            Pawdner
          </Link>
          <div className="hidden md:flex space-x-6">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={`text-text-subtle hover:text-primary transition-colors ${pathname === link.href ? 'text-primary font-semibold' : ''}`}>
                  {link.label}
              </Link>
            ))}
          </div>
          {/* Mobile menu button can be added here */}
        </div>
      </div>
    </nav>
  );
}