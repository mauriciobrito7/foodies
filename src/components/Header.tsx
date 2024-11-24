'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function Header() {
  const path = usePathname();
  return (
    <header className="flex flex-col items-center justify-between gap-4 px-4 py-8 text-white sm:flex-row sm:px-8">
      <Link href="/">
        <Image
          src="/images/logo.png"
          width={96}
          height={96}
          alt="NextLevel Food"
          className="h-24 w-24 object-contain drop-shadow-lg"
        />
      </Link>
      <nav className="flex gap-4 sm:gap-8">
        <Link href="/meals" className={path.startsWith('/meals') ? 'text-orange-200' : ''}>
          Browse Meals
        </Link>
        <Link href="/community" className={path.startsWith('/community') ? 'text-orange-200' : ''}>
          Foodies Community
        </Link>
      </nav>
    </header>
  );
}
