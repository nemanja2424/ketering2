'use client';

import styles from './CTA.module.css';
import { useEffect, useRef } from 'react';

export default function CTA() {
  const ctaRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
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
          <h2 className={styles.title}>Spreman za pravi ketering?</h2>
          <p className={styles.subtitle}>
            Izaberite iz naših kurisnih menija ili kreirajte vlastiti.
          </p>
          <p className={styles.description}>
            Naši stručnjaci će vas voditi kroz ceo proces. Bilo da volite klasiku ili tražite nešto sasvim novo, imamo rešenje za vas.
          </p>

          <div className={styles.buttons}>
            <button className={`${styles.button} ${styles.primary}`}>
              Kreiraj prilagođeni meni
            </button>
            <a href="#" className={`${styles.button} ${styles.secondary}`}>
              Pogledaj naše menije
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
