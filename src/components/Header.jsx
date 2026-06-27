'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);

  const toggleNav = () => {
    setNavOpen((current) => !current);
  };

  const closeNav = () => {
    setNavOpen(false);
  };

  return (
    <header className={`${styles.header} ${navOpen ? styles.open : ''}`}>
      <div className={styles.topRow}>
        <div className={styles.brand}>
          <Link href="/">
            <Image
              src="/LOGO no bg.png"
              alt="IN Ketering - Ketering by Pekarica"
              width={600}
              height={600}
              className={styles.logoImage}
            />
          </Link>
        </div>

        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            Početna
          </Link>
          <Link href="/poruci" className={styles.navLink}>
            Naruči
          </Link>
          <Link href="/ketering" className={styles.navLink}>
            Ketering
          </Link>
          <Link href="/o-nama" className={styles.navLink}>
            O nama
          </Link>
        </nav>

        <button
          type="button"
          className={`${styles.hamburger} ${navOpen ? styles.active : ''}`}
          onClick={toggleNav}
          aria-label="Otvori navigaciju"
          aria-expanded={navOpen}
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <nav className={`${styles.mobileNav} ${navOpen ? styles.open : ''}`}>
        <Link href="/" className={styles.mobileNavLink} onClick={closeNav}>
          Početna
        </Link>
        <Link href="/poruci" className={styles.mobileNavLink} onClick={closeNav}>
          Naruči
        </Link>
        <Link href="/ketering" className={styles.mobileNavLink} onClick={closeNav}>
          Ketering
        </Link>
        <Link href="/o-nama" className={styles.mobileNavLink} onClick={closeNav}>
          O nama
        </Link>
        <Link href="/placanje" className={styles.mobileNavLink} onClick={closeNav}>
          Plaćanje
        </Link>
      </nav>
    </header>
  );
}
