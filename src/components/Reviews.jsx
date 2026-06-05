'use client';

import styles from './Reviews.module.css';
import { useEffect, useRef } from 'react';

const reviews = [
  {
    id: 1,
    text: 'Hrana je bila odlična, sve je stiglo na vreme i prezentacija je bila na visokom nivou. Sve preporuke.',
    clientName: 'Marko Jovanović',
    eventType: 'Poslovni događaj'
  },
  {
    id: 2,
    text: 'Profesionalna usluga od početka do kraja. Gosti su bili oduševljeni kvalitetom hrane.',
    clientName: 'Ana Nikolić',
    eventType: 'Privatna proslava'
  },
  {
    id: 3,
    text: 'Sve je prošlo bez greške, komunikacija laka i brza, a hrana izuzetno ukusna.',
    clientName: 'Petar Marković',
    eventType: 'Venčanje'
  }
];

export default function Reviews() {
  const cardsRef = useRef([]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add(styles.visible);
          }, index * 100);
        }
      });
    }, observerOptions);

    cardsRef.current.forEach(card => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.reviewsSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Recenzije klijenata</h2>
          <p className={styles.subtitle}>Iskustva naših zadovoljnih klijenata</p>
        </div>

        {/* Reviews Grid */}
        <div className={styles.grid}>
          {reviews.map((review, index) => (
            <div
              key={review.id}
              ref={(el) => cardsRef.current[index] = el}
              className={styles.reviewCard}
            >
              <div className={styles.stars}>★★★★★</div>
              <p className={styles.reviewText}>{review.text}</p>
              <div className={styles.clientInfo}>
                <p className={styles.clientName}>{review.clientName}</p>
                <p className={styles.eventType}>{review.eventType}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
