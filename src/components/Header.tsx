import Link from 'next/link';
import Image from 'next/image';

export function Header() {
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
        <Link href="/meals">Meals</Link>
        <Link href="/meals/share">Share</Link>
        <Link href="/community">Community</Link>
      </nav>
    </header>
  );
}
