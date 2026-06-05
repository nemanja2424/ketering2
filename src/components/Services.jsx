'use client';

import styles from './Services.module.css';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

const services = [
  {
    id: 1,
    number: '01',
    title: 'Poslovni ketering',
    description: 'Ketering za sastanke, konferencije, seminare i poslovne ručkove.',
    image: '/01card.webp'
  },
  {
    id: 2,
    number: '02',
    title: 'Privatni događaji',
    description: 'Hrana za rođendane, okupljanja i kućne proslave po vašoj meri.',
    image: '/02card.webp'
  },
  {
    id: 3,
    number: '03',
    title: 'Proslave',
    description: 'Ketering za sve vrste proslava uz raznovrsna jela i posluženje.',
    image: '/03card.webp'
  },
  {
    id: 4,
    number: '04',
    title: 'Prijemi',
    description: 'Lagano posluženje za svečane prijeme, otvaranja i događaje.',
    image: '/04card.webp'
  }
];

export default function Services() {
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
    <section className={styles.servicesSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>NAŠE USLUGE</span>
          <h2 className={styles.title}>Ketering prilagođen svakom događaju</h2>
          <p className={styles.subtitle}>
            Bez obzira da li organizujete poslovni skup, privatnu proslavu ili svečani događaj, 
            pripremamo meni i uslugu prema vašim potrebama.
          </p>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {services.map((service, index) => (
            <div
              key={service.id}
              ref={(el) => cardsRef.current[index] = el}
              className={styles.card}
              style={{
                backgroundImage: `url(${service.image})`
              }}
            >
              <div className={styles.overlay}></div>
              
              <div className={styles.number}>{service.number}</div>
              
              <div className={styles.content}>
                <h3 className={styles.cardTitle}>{service.title}</h3>
                <p className={styles.cardDescription}>{service.description}</p>
                <a href={service.link} className={styles.link}>
                  Saznaj više →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
