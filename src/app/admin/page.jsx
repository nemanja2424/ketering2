'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function AdminPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [narudzbine, setNarudzbine] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    // Proveravamo da li je korisnik već ulogovan (iz session storage-a)
    const loggedIn = sessionStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
      fetchNarudzbine();
    }
    setLoading(false);
  }, []);

  const fetchNarudzbine = async () => {
    setLoadingData(true);
    try {
      const response = await fetch('/api/narudzbine');
      if (response.ok) {
        const data = await response.json();
        setNarudzbine(data);
      }
    } catch (err) {
      console.error('Greška pri učitavanju narudžbina:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        setIsLoggedIn(true);
        setEmail('');
        setPassword('');
        fetchNarudzbine();
      } else {
        setError(data.message || 'Greška pri autentifikaciji');
      }
    } catch (err) {
      setError('Greška pri autentifikaciji');
      console.error(err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
    setNarudzbine([]);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Učitavanje...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h1>Admin Panel</h1>
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Unesite email"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Šifra</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Unesite šifru"
                required
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.loginButton}>
              Prijava
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Admin Panel - Narudžbine</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Odjava
        </button>
      </div>

      <div className={styles.container}>
        {loadingData ? (
          <p>Učitavanje narudžbina...</p>
        ) : narudzbine.length === 0 ? (
          <p>Nema narudžbina</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ime</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th>Datum</th>
                  <th>Vreme</th>
                  <th>Mesto</th>
                  <th>Cena</th>
                  <th>Meni</th>
                  <th>Br. osoba</th>
                  <th>Plaćeno</th>
                </tr>
              </thead>
              <tbody>
                {narudzbine.map((narudzbina) => (
                  <tr key={narudzbina.id}>
                    <td>{narudzbina.id}</td>
                    <td>{narudzbina.ime}</td>
                    <td>{narudzbina.email || '-'}</td>
                    <td>{narudzbina.br_tel || '-'}</td>
                    <td>{new Date(narudzbina.datum).toLocaleDateString('sr-RS')}</td>
                    <td>{narudzbina.vreme}</td>
                    <td>{narudzbina.mesto || '-'}</td>
                    <td>{(narudzbina.cena).toLocaleString('sr-RS', { style: 'currency', currency: 'RSD' })}</td>
                    <td>{narudzbina.porudzbina.meni || '-'}</td>
                    <td>{narudzbina.porudzbina.brOsoba || '-'}</td>
                    <td className={narudzbina.placeno ? styles.paid : styles.unpaid}>
                      {narudzbina.placeno ? '✓ DA' : 'NE'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
