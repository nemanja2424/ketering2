'use client';
import { useState } from 'react';
import styles from './Header.module.css';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);

  const toggleNav = () => {
    setNavOpen(!navOpen);
  };

  const closeNav = () => {
    setNavOpen(false);
  };

  return (
    <header className={`${styles.header} ${navOpen ? styles.open : ''}`}>
      <div className={styles.topRow}>
        {/* Logo / Brand */}
        <div className={styles.brand}>
          <Link href="/">
            <Image 
              src="/LOGO no bg.png" 
              alt="Ketering Logo" 
              width={60} 
              height={60}
              className={styles.logoImage}
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            Početna
          </Link>
          <Link href="#narucivanje" className={styles.navLink}>
            Naruči
          </Link>
          <Link href="#onama" className={styles.navLink}>
            O nama
          </Link>
        </nav>

        {/* Hamburger Menu */}
        <div
          className={`${styles.hamburger} ${navOpen ? styles.active : ''}`}
          onClick={toggleNav}
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className={`${styles.mobileNav} ${navOpen ? styles.open : ''}`}>
        <Link href="/" className={styles.mobileNavLink} onClick={closeNav}>
          Početna
        </Link>
        <Link href="#narucivanje" className={styles.mobileNavLink} onClick={closeNav}>
          Naruči
        </Link>
        <Link href="#onama" className={styles.mobileNavLink} onClick={closeNav}>
          O nama
        </Link>
      </nav>
    </header>
  );
}
