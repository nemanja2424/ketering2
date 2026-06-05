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
          {/* Eyebrow Text */}
          <span className={styles.eyebrow}>PREMIUM KETERING</span>

          {/* Main Heading */}
          <h1 className={styles.heading}>Menije koji oslikavaju vašu viziju</h1>

          {/* Subheading */}
          <p className={styles.subheading}>
            Birajte iz našeg repertoara ili kreirajte potpuno personalizovani meni. Savršena kombinacija kvaliteta, kreativnosti i fleksibilnosti.
          </p>

          {/* Buttons */}
          <div className={styles.buttons}>
            <button className={`${styles.button} ${styles.primary}`}>
              Kreiraj svoj meni
            </button>
            <button className={`${styles.button} ${styles.secondary}`}>
              Vidi spremne menije
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
