'use client';

import styles from './Footer.module.css';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaFacebook } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.content}>
          {/* Company Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>O nama</h3>
            <p className={styles.description}>
              Profesionalni ketering servis sa više od 10 godina iskustva. Specialisovani smo za sve vrste događaja.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <FaFacebook />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Brzi linkovi</h3>
            <ul className={styles.links}>
              <li><a href="#services">Usluge</a></li>
              <li><a href="#reviews">Recenzije</a></li>
              <li><a href="#meni">Meni</a></li>
              <li><a href="#contact">Kontakt</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Kontakt</h3>
            <div className={styles.contactItem}>
              <FaPhone className={styles.icon} />
              <a href="tel:+381123456789">+381 (0)1 234-5678</a>
            </div>
            <div className={styles.contactItem}>
              <FaEnvelope className={styles.icon} />
              <a href="mailto:info@ketering.rs">info@ketering.rs</a>
            </div>
            <div className={styles.contactItem}>
              <FaMapMarkerAlt className={styles.icon} />
              <span>Niš, Srbija</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Bottom Footer */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {currentYear} Ketering. Sva prava zadržana.
          </p>
          
        </div>
      </div>
    </footer>
  );
}
