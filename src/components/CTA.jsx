'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import styles from './CTA.module.css';

export default function CTA() {
  const ctaRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (ctaRef.current) {
      observer.observe(ctaRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={styles.ctaSection}
      ref={ctaRef}
      style={{
        backgroundImage: 'url(/bgCTA.webp)',
      }}
    >
      <div className={styles.overlay}></div>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>Spreman za sledeci obrok?</h2>
          <p className={styles.subtitle}>
            Izaberi personalizovani meni, mesecni plan ili ketering za dogadjaj.
          </p>
          <p className={styles.description}>
            Slozi obrok po meri, poruci pripremljeni plan ili posalji upit za veci dogadjaj.
          </p>

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
