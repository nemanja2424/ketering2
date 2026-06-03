'use client';

import styles from './FeatureCards.module.css';
import { FaBolt, FaCrown, FaCheckCircle } from 'react-icons/fa';

const features = [
  {
    id: 1,
    icon: <FaBolt />,
    title: 'Brzo i jednostavno',
    description: 'Naručite za manje od minut kroz jednostavan proces bez komplikacija. Sve je optimizovano da u par klikova dobijete profesionalnu ponudu prilagođenu vašim potrebama.'
    },
    {
    id: 2,
    icon: <FaCrown />,
    title: 'Premium iskustvo',
    description: 'Koristimo pažljivo odabrane sirovine i standardizovan proces rada kako bismo obezbedili dosledan kvalitet i vrhunski servis od početka do kraja.'
    },
    {
    id: 3,
    icon: <FaCheckCircle />,
    title: 'Garantovano',
    description: 'Više od 10 godina iskustva u industriji garantuje pouzdanost, preciznost i profesionalan pristup svakom projektu, bez kompromisa.'
    }
];

export default function FeatureCards() {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Zašto izabrati nas</h2>
          <p className={styles.subtitle}>
            Sve što trebaš za uspešan event
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature) => (
            <div key={feature.id} className={styles.card}>
              <div className={styles.icon}>
                {feature.icon}
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}