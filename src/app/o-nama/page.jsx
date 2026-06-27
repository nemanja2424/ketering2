import Image from 'next/image';
import CTA from '@/components/CTA';
import styles from './page.module.css';
import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'IN Ketering | Ketering by Pekarica',
  description:
    'Upoznajte IN Ketering i Ketering by Pekarica tim sa više od 20 godina iskustva u pripremi hrane i organizaciji događaja.',
  path: '/o-nama',
  images: ['/onamaHero.webp'],
});

export default function AboutPage() {
  return (
    <>
      <main>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>O nama</h1>
            <p className={styles.heroSubtitle}>Profesionalni ketering sa srcem za savršenstvo</p>
          </div>
        </section>

        {/* Main Content */}
        <section className={styles.contentSection}>
          <div className={styles.container}>
            {/* Introduction */}
            <div className={styles.introduction}>
              <h2>Naša priča</h2>
              <p>
                Ketering je više od pripremanja hrane - to je umetnost kombinovanja kvalitete, 
                kreativnosti i profesionalizma. Naša priča počela je pre više od dve decenije kada smo odlučili
                da unapredimo kako se događaji doživljavaju kroz hranu.
              </p>
              <p>
                Sa iskustvom i strastima kao vodičima, transformisali smo skromne početke u 
                prepoznatljiv ketering servis koji je pouzdana izbor za stotine zadovoljnih klijenata.
              </p>
            </div>

            {/* Values Grid */}
            <div className={styles.valuesGrid}>
              <div className={styles.valueCard}>
                <h3>Kvalitet bez kompromisa</h3>
                <p>
                  Koristimo samo najbolje sirovine i najsvežije namirnice. 
                  Svaka jela je pripremljena sa pažnjom i ljubavlju.
                </p>
              </div>
              <div className={styles.valueCard}>
                <h3>Kreativnost i inovacija</h3>
                <p>
                  Naši kuvari neprestano eksperimentuju sa novim receptima 
                  i ukusima kako bi vas iznenanadili.
                </p>
              </div>
              <div className={styles.valueCard}>
                <h3>Fleksibilnost i prilagođenost</h3>
                <p>
                  Razumemo da je svaki događaj jedinstven. Prilagođavamo se 
                  vašim željama, budžetu i specifičnim zahtevima.
                </p>
              </div>
              <div className={styles.valueCard}>
                <h3>Profesionalna usluga</h3>
                <p>
                  Naš tim je obučen da brine o svakom detalju, od pripreme 
                  do servisa i čišćenja.
                </p>
              </div>
            </div>

            {/* Story Section */}
            <div className={styles.story}>
              <div className={styles.storyContent}>
                <h2>Kako je sve počelo</h2>
                <p>
                  Ketering by Pekarica je nastao iz jednostavne ideje - da dobra hrana i pažljivo organizovan servis mogu svaki događaj da pretvore u prijatno i bezbrižno iskustvo.
                </p>
                <p>
                  Od samog početka fokus je bio na kvaliteti, svežim namirnicama i pažljivo pripremljenim jelima, bez kompromisa.
                </p>
                <p>
                  Vremenom smo proširili ponudu i uslugu kako bismo mogli da odgovorimo na različite potrebe - od manjih privatnih okupljanja do većih poslovnih i svečanih događaja.
                </p>
                <p>
                  Danas radimo kao tim koji objedinjuje iskustvo u pripremi hrane i organizaciji keteringa, sa ciljem da svaki događaj bude jednostavan za domaćina, a kvalitetan i prijatan za goste.
                </p>
                <p>
                  Svaki novi upit posmatramo kao priliku da isporučimo pouzdanu uslugu, dobar ukus i iskustvo koje ostavlja pozitivan utisak.
                </p>
              </div>
              <div className={styles.storyImage}>
                <div className={styles.imagePlaceholder}>
                  <Image
                    src="/onamaHero.webp"
                    alt="IN Ketering by Pekarica tim"
                    width={500}
                    height={400}
                  />
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <h3>20+</h3>
                <p>Godina iskustva</p>
              </div>
              <div className={styles.statItem}>
                <h3>500+</h3>
                <p>Zadovoljnih klijenata</p>
              </div>
              <div className={styles.statItem}>
                <h3>2000+</h3>
                <p>Događaja organizovano</p>
              </div>
              <div className={styles.statItem}>
                <h3>100%</h3>
                <p>Stopa zadovoljstva</p>
              </div>
            </div>

            {/* Mission & Vision */}
            <div className={styles.missionSection}>
              <div className={styles.missionCard}>
                <h3>Naša misija</h3>
                <p>
                  Biti vodeći ketering servis koji kombinuje inovaciju, kvalitet i 
                  autentičnost. Želimo da svaki događaj bude poseban kroz našu strast 
                  za hrani i servisom.
                </p>
              </div>
              <div className={styles.missionCard}>
                <h3>Naša vizija</h3>
                <p>
                  Stvaranje okruženja gde je hrana most između ljudi, gde se radost 
                  i zahvalnost dele kroz zajedničke obroke. Težimo da budemo poznat 
                  po integraciji, pouzdanosti i neprekidnom poboljšanju.
                </p>
              </div>
            </div>

            {/* Team Section */}
            <div className={styles.teamSection}>
              <h2>Naš tim</h2>
              <p>
                Naš tim se sastoji od stručnjaka iz raznih oblasti - iskusnih kuvara 
                sa međunarodnom treningom, event managera sa oštrim okom za detalje, 
                i profesionalnih servera koji znaju kako da učini događaj besprekoran.
              </p>
              <p>
                Svaki član tima je posvećen da pruži najbolju moguću uslugu i da se 
                uklopi sa vašim vizijom za događaj. Možete biti sigurni da vašim 
                događajem upravljaju stručnjaci koji se brinu o svakom detalju.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <CTA />
        
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


