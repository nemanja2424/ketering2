import Hero from '../components/Hero';
import FeatureCards from '../components/FeatureCards';
import Services from '../components/Services';
import Reviews from '../components/Reviews';
import CTA from '../components/CTA';
import styles from './page.module.css';
import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Ketering by Pekarica 03 | IN Ketering',
  description:
    'Profesionalni ketering by Pekarica za Nis i okolinu, proslave, poslovne dogadjaje i dnevne obroke. Izaberite gotove menije ili obrok po meri.',
  path: '/',
});

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <FeatureCards />

        <section className={styles.howItWorks}>
          <div className={styles.container}>
            
            <span className={styles.eyebrow}>Kako funkcioniše</span>
            <h2 className={styles.title}>Proces je jednostavan i fleksibilan</h2>
            <p className={styles.description}>
              Organizujemo ketering za sve vrste događaja - od poslovnih sastanaka i manjih privatnih okupljanja, do većih proslava i svečanih prijema.
              Naša ponuda je fleksibilna i prilagođena vama. Možete izabrati jedan od postojećih menija ili zajedno sa nama kreirati potpuno personalizovan meni prema vašim željama, broju gostiju i tipu događaja.
              Proces naručivanja je jednostavan - pošaljete upit, mi vam predložimo rešenje i dogovaramo sve detalje kako bi hrana, količina i stil posluženja savršeno odgovarali vašem događaju.
            </p>

          </div>
        </section>

        {/*
        <Services />
        */}
        
        <Reviews />

        <CTA />







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
    </>
  );
}
