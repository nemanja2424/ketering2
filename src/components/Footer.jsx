'use client';

import styles from './Footer.module.css';
import Link from 'next/link';
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
              Profesionalni ketering servis sa više od 20 godina iskustva. Specijalizovani smo za sve vrste događaja.
            </p>
            <div className={styles.socials}>
              <a
                href="https://www.instagram.com/pekarica2003?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                className={styles.socialLink}
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.facebook.com/PekaricaNis"
                className={styles.socialLink}
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
              >
                <FaFacebook />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Navigacija</h3>
            <ul className={styles.links}>
              <li><Link href="/">Početna</Link></li>
              <li><Link href="/poruci">Naruči</Link></li>
              <li><Link href="/ketering">Ketering</Link></li>
              <li><Link href="/o-nama">O nama</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Kontakt</h3>
            <div className={styles.contactItem}>
              <FaPhone className={styles.icon} />
              <a href="tel:+381641963677">+381 64 196 36 77</a>
            </div>
            <div className={styles.contactItem}>
              <FaEnvelope className={styles.icon} />
              <a href="mailto:pekarica03@gmail.com">Posalji email</a>
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
