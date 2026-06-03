import Hero from '../components/Hero';
import FeatureCards from '../components/FeatureCards';
import styles from './page.module.css';

export default function Home() {
  return (
    <main>
      <Hero />
      <FeatureCards />

      {/* Animated background shapes */}
      <div className={styles.shape1}></div>
      <div className={styles.shape2}></div>
      <div className={styles.shape3}></div>
      
      {/* Decorative leaves */}
      <svg className={styles.leaf1} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5 Q80 20 85 50 Q80 80 50 95 Q20 80 15 50 Q20 20 50 5 M50 15 Q50 50 50 85 M50 30 L35 40 M50 30 L65 40 M50 45 L30 50 M50 45 L70 50 M50 60 L35 65 M50 60 L65 65" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M50 5 Q80 20 85 50 Q80 80 50 95 Q20 80 15 50 Q20 20 50 5" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
      
      <svg className={styles.leaf2} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5 Q80 20 85 50 Q80 80 50 95 Q20 80 15 50 Q20 20 50 5 M50 15 Q50 50 50 85 M50 30 L35 40 M50 30 L65 40 M50 45 L30 50 M50 45 L70 50 M50 60 L35 65 M50 60 L65 65" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M50 5 Q80 20 85 50 Q80 80 50 95 Q20 80 15 50 Q20 20 50 5" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
      
      <svg className={styles.leaf3} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5 Q80 20 85 50 Q80 80 50 95 Q20 80 15 50 Q20 20 50 5 M50 15 Q50 50 50 85 M50 30 L35 40 M50 30 L65 40 M50 45 L30 50 M50 45 L70 50 M50 60 L35 65 M50 60 L65 65" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M50 5 Q80 20 85 50 Q80 80 50 95 Q20 80 15 50 Q20 20 50 5" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
      
      <svg className={styles.leaf4} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5 Q80 20 85 50 Q80 80 50 95 Q20 80 15 50 Q20 20 50 5 M50 15 Q50 50 50 85 M50 30 L35 40 M50 30 L65 40 M50 45 L30 50 M50 45 L70 50 M50 60 L35 65 M50 60 L65 65" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M50 5 Q80 20 85 50 Q80 80 50 95 Q20 80 15 50 Q20 20 50 5" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
      
      
    </main>
  );
}
