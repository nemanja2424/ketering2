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
          <h1 className={styles.heading}>Ukusi koji ostavljaju utisak</h1>

          {/* Subheading */}
          <p className={styles.subheading}>
            Profesionalni ketering za poslovne događaje, proslave, venčanja i privatne događaje.
          </p>

          {/* Buttons */}
          <div className={styles.buttons}>
            <button className={`${styles.button} ${styles.primary}`}>
              Zatraži ponudu
            </button>
            <button className={`${styles.button} ${styles.secondary}`}>
              Pogledaj meni
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
