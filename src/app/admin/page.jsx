'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaCalendarAlt,
  FaClock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaReceipt,
  FaSignOutAlt,
  FaSyncAlt,
  FaUser,
} from 'react-icons/fa';
import styles from './page.module.css';

const STATUS_LABELS = {
  new: 'Novo',
  confirmed: 'Potvrdjeno',
  in_preparation: 'U pripremi',
  ready: 'Spremno',
  completed: 'Zavrseno',
  cancelled: 'Otkazano',
};

const PAYMENT_LABELS = {
  not_started: 'Nije pokrenuto',
  pending: 'Na cekanju',
  paid: 'Placeno',
  failed: 'Neuspesno',
  refunded: 'Refundirano',
};

const TYPE_LABELS = {
  meal_order: 'Pripremljen meni',
  custom_meal_order: 'Personalizovan meni',
  catering_inquiry: 'Ketering',
  manual_order: 'Rucni unos',
};

function formatRsd(value) {
  return `${Number(value || 0).toLocaleString('sr-RS')} RSD`;
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('sr-RS');
}

function formatTime(value) {
  if (!value) {
    return '-';
  }

  return String(value).slice(0, 5);
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function normalizeItems(porudzbina) {
  if (Array.isArray(porudzbina?.items)) {
    return porudzbina.items;
  }

  if (Array.isArray(porudzbina?.stavke)) {
    return porudzbina.stavke.map((item, index) => ({
      id: `legacy-${index}`,
      name: typeof item === 'string' ? item : item?.name || `Stavka ${index + 1}`,
      category: item?.category || 'Stavka',
      quantity: Number(item?.quantity || 1),
      unitPriceRsd: Number(item?.unitPriceRsd || item?.priceRsdPerPerson || 0),
      totalPriceRsd: Number(item?.totalPriceRsd || item?.priceRsdPerPerson || 0),
      meta: item?.meta || {},
    }));
  }

  if (Array.isArray(porudzbina?.sadrzaj)) {
    return porudzbina.sadrzaj.map((name, index) => ({
      id: `legacy-content-${index}`,
      name,
      category: 'Sadrzaj',
      quantity: 1,
      unitPriceRsd: 0,
      totalPriceRsd: 0,
      meta: {},
    }));
  }

  return [];
}

function normalizeOrder(narudzbina) {
  const porudzbina = narudzbina.porudzbina || {};
  const isStandard = porudzbina.schemaVersion === 1;
  const items = normalizeItems(porudzbina);
  const totalRsd = Number(porudzbina.totals?.totalRsd || narudzbina.cena || 0);
  const paymentStatus = porudzbina.payment?.status || (narudzbina.placeno ? 'paid' : 'not_started');

  return {
    id: narudzbina.id,
    title:
      porudzbina.title ||
      porudzbina.naslov ||
      porudzbina.ponuda ||
      porudzbina.meni ||
      'Narudzbina',
    type: porudzbina.type || porudzbina.tip || 'manual_order',
    status: porudzbina.status || 'new',
    source: porudzbina.source || porudzbina.kanal || 'legacy',
    items,
    totalRsd,
    paymentStatus,
    customerNote: porudzbina.customerNote || porudzbina.napomena || '',
    internalNote: porudzbina.internalNote || '',
    fulfillment: porudzbina.fulfillment || { method: 'delivery', status: 'pending' },
    raw: porudzbina,
    isStandard,
  };
}

export default function AdminPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [narudzbine, setNarudzbine] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const fetchNarudzbine = useCallback(async () => {
    setLoadingData(true);
    try {
      const response = await fetch('/api/narudzbine', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setNarudzbine(data);
      }
    } catch (err) {
      console.error('Greska pri ucitavanju narudzbina:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoggedIn(sessionStorage.getItem('adminLoggedIn') === 'true');
      setCheckingSession(false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const timeoutId = window.setTimeout(() => {
        fetchNarudzbine();
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    return undefined;
  }, [fetchNarudzbine, isLoggedIn]);

  const normalizedOrders = useMemo(
    () => narudzbine.map((narudzbina) => ({ ...narudzbina, details: normalizeOrder(narudzbina) })),
    [narudzbine]
  );

  const stats = useMemo(() => {
    const total = normalizedOrders.length;
    const unpaid = normalizedOrders.filter((order) => order.details.paymentStatus !== 'paid').length;
    const revenue = normalizedOrders.reduce((sum, order) => sum + order.details.totalRsd, 0);

    return { total, unpaid, revenue };
  }, [normalizedOrders]);

  const handleLogin = async (event) => {
    event.preventDefault();
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
      } else {
        setError(data.message || 'Greska pri autentifikaciji');
      }
    } catch (err) {
      setError('Greska pri autentifikaciji');
      console.error(err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
    setNarudzbine([]);
  };

  if (checkingSession) {
    return (
      <main className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <p className={styles.emptyState}>Ucitavanje admin panela...</p>
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h1>Admin Panel</h1>
          <form onSubmit={handleLogin} className={styles.form}>
            <label className={styles.formGroup}>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Unesite email"
                required
              />
            </label>

            <label className={styles.formGroup}>
              Sifra
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Unesite sifru"
                required
              />
            </label>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.loginButton}>
              Prijava
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <span>Admin</span>
          <h1>Narudzbine</h1>
        </div>
        <div className={styles.headerActions}>
          <button type="button" onClick={fetchNarudzbine} className={styles.refreshButton}>
            <FaSyncAlt aria-hidden="true" />
            Osvezi
          </button>
          <button type="button" onClick={handleLogout} className={styles.logoutButton}>
            <FaSignOutAlt aria-hidden="true" />
            Odjava
          </button>
        </div>
      </header>

      <section className={styles.statsGrid} aria-label="Pregled narudzbina">
        <div>
          <span>Ukupno</span>
          <strong>{stats.total}</strong>
        </div>
        <div>
          <span>Nije placeno</span>
          <strong>{stats.unpaid}</strong>
        </div>
        <div>
          <span>Ukupan iznos</span>
          <strong>{formatRsd(stats.revenue)}</strong>
        </div>
      </section>

      <section className={styles.container}>
        {loadingData ? (
          <p className={styles.emptyState}>Ucitavanje narudzbina...</p>
        ) : normalizedOrders.length === 0 ? (
          <p className={styles.emptyState}>Nema narudzbina.</p>
        ) : (
          <div className={styles.ordersList}>
            {normalizedOrders.map((narudzbina) => (
              <OrderCard key={narudzbina.id} narudzbina={narudzbina} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function OrderCard({ narudzbina }) {
  const details = narudzbina.details;
  const paymentLabel = PAYMENT_LABELS[details.paymentStatus] || details.paymentStatus;
  const typeLabel = TYPE_LABELS[details.type] || details.type;

  return (
    <article className={styles.orderCard}>
      <div className={styles.orderTop}>
        <div>
          <span className={styles.orderType}>{typeLabel}</span>
          <h2>{details.title}</h2>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <InfoItem icon={<FaUser />} label="Kupac" value={narudzbina.ime} />
        <InfoItem icon={<FaPhoneAlt />} label="Telefon" value={narudzbina.br_tel || '-'} />
        <InfoItem icon={<FaEnvelope />} label="Email" value={narudzbina.email || '-'} />
        <InfoItem icon={<FaCalendarAlt />} label="Datum" value={formatDate(narudzbina.datum)} />
        <InfoItem icon={<FaClock />} label="Vreme" value={formatTime(narudzbina.vreme)} />
        <InfoItem icon={<FaMapMarkerAlt />} label="Mesto" value={narudzbina.mesto || '-'} />
      </div>

      <div className={styles.orderBody}>
        <div className={styles.itemsPanel}>
          <div className={styles.sectionTitle}>
            <FaReceipt aria-hidden="true" />
            Stavke
          </div>
          {details.items.length > 0 ? (
            <ul className={styles.itemsList}>
              {details.items.map((item) => (
                <li key={item.id || item.name}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      {item.category || 'Stavka'}
                      {item.variant ? ` / ${item.variant}` : ''}
                      {item.meta?.mealLabel ? ` / ${item.meta.mealLabel}` : ''}
                    </span>
                    {Array.isArray(item.meta?.dishes) && item.meta.dishes.length > 0 && (
                      <p>{item.meta.dishes.join(', ')}</p>
                    )}
                  </div>
                  <em>{formatRsd(item.totalPriceRsd)}</em>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptySmall}>Nema stavki za prikaz.</p>
          )}
        </div>

        <aside className={styles.sidePanel}>
          <div className={styles.totalBox}>
            <span>Ukupno</span>
            <strong>{formatRsd(details.totalRsd)}</strong>
          </div>
          <div className={styles.noteBox}>
            <span>Napomena kupca</span>
            <p>{details.customerNote || 'Nema napomene.'}</p>
          </div>
          <div className={styles.noteBox}>
            <span>Naruceno</span>
            <p>{formatDateTime(narudzbina.created_at)}</p>
          </div>
          <div className={styles.noteBox}>
            <span>Placanje</span>
            <p>{paymentLabel}</p>
          </div>
        </aside>
      </div>
    </article>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className={styles.infoItem}>
      {icon}
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
