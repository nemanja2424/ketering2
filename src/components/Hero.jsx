'use client';

import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* Background Image with Overlay */}
      <div
        className={styles.background}
        style={{
          backgroundImage: 'url(/bgHero.webp)',
        }}
      >
        <div className={styles.overlay}></div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.contentInner}>
          {/* Main Heading */}
          <h1 className={styles.heading}>Meniji koji oslikavaju vašu viziju</h1>

          {/* Subheading */}
          <p className={styles.subheading}>
            Birajte iz našeg repertoara ili kreirajte potpuno personalizovani meni. Savršena kombinacija kvaliteta, kreativnosti i fleksibilnosti.
          </p>

          {/* Buttons */}
          <div className={styles.buttons}>
            <Link href="/poruci?tip=personalizovani" className={`${styles.button} ${styles.primary}`}>
              Fuel builder
            </Link>
            <Link href="/poruci" className={`${styles.button} ${styles.secondary}`}>
              Daily fuel
            </Link>
            <Link href="/ketering" className={`${styles.button} ${styles.secondary}`}>
              Ketering
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
