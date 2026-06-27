'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaChevronDown,
  FaClock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaReceipt,
  FaSignOutAlt,
  FaSyncAlt,
  FaUser,
} from 'react-icons/fa';
import styles from '../page.module.css';

const PAYMENT_LABELS = {
  not_started: 'Nije pokrenuto',
  pending: 'Na cekanju',
  paid: 'Plaćeno',
  failed: 'Neuspesno',
  refunded: 'Refundirano',
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

function getLocalDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function normalizeItems(porudzbina) {
  return Array.isArray(porudzbina?.items) ? porudzbina.items : [];
}

function normalizeSubscription(narudzbina) {
  const porudzbina = narudzbina.porudzbina || {};
  const items = normalizeItems(porudzbina);
  const deliveryDates = items
    .map((item) => item.meta?.deliveryDate)
    .filter(Boolean)
    .sort((first, second) => first.localeCompare(second));
  const paymentStatus = porudzbina.payment?.status || (narudzbina.placeno ? 'paid' : 'not_started');

  return {
    id: narudzbina.id,
    title: porudzbina.title || 'Pretplata',
    items,
    totalRsd: Number(porudzbina.totals?.totalRsd || narudzbina.cena || 0),
    customerNote: porudzbina.customerNote || '',
    paymentStatus,
    firstDelivery: deliveryDates[0] || narudzbina.datum,
    lastDelivery: deliveryDates.at(-1) || narudzbina.datum,
    daysCount: items.filter((item) => item.category === 'Pretplata').length || deliveryDates.length,
    raw: porudzbina,
  };
}

function getSearchText(subscription) {
  const details = subscription.details;
  const itemText = details.items
    .map((item) => `${item.name} ${item.variant || ''} ${item.meta?.formattedDate || ''}`)
    .join(' ');

  return [
    subscription.id,
    subscription.ime,
    subscription.email,
    subscription.br_tel,
    subscription.mesto,
    details.title,
    details.customerNote,
    itemText,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export default function PretplateAdminPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [narudzbine, setNarudzbine] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNarudzbine = useCallback(async () => {
    setLoadingData(true);
    try {
      const response = await fetch('/api/narudzbine', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setNarudzbine(data);
      }
    } catch (err) {
      console.error('Greška pri učitavanju pretplata:', err);
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
    if (!isLoggedIn) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      fetchNarudzbine();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchNarudzbine, isLoggedIn]);

  const subscriptions = useMemo(
    () =>
      narudzbine
        .filter((narudzbina) => narudzbina.porudzbina?.type === 'subscription_order')
        .map((narudzbina) => ({
          ...narudzbina,
          details: normalizeSubscription(narudzbina),
        })),
    [narudzbine]
  );

  const visibleSubscriptions = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return subscriptions
      .filter((subscription) => {
        if (paymentFilter !== 'all' && subscription.details.paymentStatus !== paymentFilter) {
          return false;
        }

        if (normalizedSearch && !getSearchText(subscription).includes(normalizedSearch)) {
          return false;
        }

        return true;
      })
      .sort((first, second) =>
        first.details.firstDelivery.localeCompare(second.details.firstDelivery)
      );
  }, [paymentFilter, searchQuery, subscriptions]);

  const stats = useMemo(() => {
    const total = visibleSubscriptions.length;
    const unpaid = visibleSubscriptions.filter(
      (subscription) => subscription.details.paymentStatus !== 'paid'
    ).length;
    const revenue = visibleSubscriptions.reduce(
      (sum, subscription) => sum + subscription.details.totalRsd,
      0
    );
    const deliveries = visibleSubscriptions.reduce(
      (sum, subscription) => sum + subscription.details.daysCount,
      0
    );

    return { total, unpaid, revenue, deliveries };
  }, [visibleSubscriptions]);

  const todayDeliveries = useMemo(() => {
    const todayKey = getLocalDateKey();

    return subscriptions
      .flatMap((subscription) =>
        subscription.details.items
          .filter(
            (item) => item.category === 'Pretplata' && item.meta?.deliveryDate === todayKey
          )
          .map((item) => ({
            id: `${subscription.id}-${item.id || item.name}`,
            subscriptionId: subscription.id,
            customerName: subscription.ime,
            phone: subscription.br_tel,
            address: subscription.mesto,
            item,
          }))
      )
      .sort((first, second) =>
        String(first.item.meta?.mealNumber || '').localeCompare(
          String(second.item.meta?.mealNumber || '')
        )
      );
  }, [subscriptions]);

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

  if (checkingSession) {
    return (
      <main className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <p className={styles.emptyState}>Učitavanje pretplata...</p>
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
                placeholder="Unesite šifru"
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
          <h1>Pretplate</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin" className={styles.refreshButton}>
            <FaArrowLeft aria-hidden="true" />
            Narudžbine
          </Link>
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

      <section className={styles.statsGrid} aria-label="Pregled pretplata">
        <div>
          <span>Pretplate</span>
          <strong>{stats.total}</strong>
        </div>
        <div>
          <span>Isporuke</span>
          <strong>{stats.deliveries}</strong>
        </div>
        <div>
          <span>Nije plaćeno</span>
          <strong>{stats.unpaid}</strong>
        </div>
        <div>
          <span>Ukupan iznos</span>
          <strong>{formatRsd(stats.revenue)}</strong>
        </div>
      </section>

      <section className={styles.productionPanel} aria-label="Danasnji obroci iz pretplata">
        <div className={styles.productionHeader}>
          <div>
            <span>Danas se pravi</span>
            <h2>{formatDate(getLocalDateKey())}</h2>
          </div>
          <strong>{todayDeliveries.length} obroka</strong>
        </div>

        {todayDeliveries.length === 0 ? (
          <p className={styles.emptySmall}>Za danas nema obroka iz pretplata.</p>
        ) : (
          <div className={styles.productionList}>
            {todayDeliveries.map((delivery) => (
              <article key={delivery.id} className={styles.productionCard}>
                <div>
                  <span>
                    Pretplata #{delivery.subscriptionId}
                    {delivery.item.meta?.mealNumber
                      ? ` / Obrok ${delivery.item.meta.mealNumber}`
                      : ''}
                  </span>
                  <h3>{delivery.item.name}</h3>
                  <p>
                    {delivery.item.variant || 'Varijanta nije uneta'}
                    {delivery.item.meta?.serviceDay ? ` / ${delivery.item.meta.serviceDay}` : ''}
                  </p>
                </div>
                <aside>
                  <strong>{delivery.customerName}</strong>
                  <span>{delivery.phone || 'Bez telefona'}</span>
                  <span>{delivery.address || 'Bez adrese'}</span>
                </aside>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.filtersPanel} aria-label="Filteri pretplata">
        <div className={styles.filtersTitle}>
          <FaReceipt aria-hidden="true" />
          <span>Filteri</span>
        </div>

        <div className={styles.subscriptionFiltersGrid}>
          <label>
            Plaćanje
            <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
              <option value="all">Sva plaćanja</option>
              <option value="not_started">Nije pokrenuto</option>
              <option value="pending">Na cekanju</option>
              <option value="paid">Plaćeno</option>
              <option value="failed">Neuspesno</option>
              <option value="refunded">Refundirano</option>
            </select>
          </label>

          <label>
            Pretraga
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Kupac, telefon, datum, obrok..."
            />
          </label>
        </div>
      </section>

      <section className={styles.container}>
        {loadingData ? (
          <p className={styles.emptyState}>Učitavanje pretplata...</p>
        ) : visibleSubscriptions.length === 0 ? (
          <p className={styles.emptyState}>Nema pretplata.</p>
        ) : (
          <div className={styles.ordersList}>
            {visibleSubscriptions.map((subscription) => (
              <SubscriptionCard key={subscription.id} subscription={subscription} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function SubscriptionCard({ subscription }) {
  const [isOpen, setIsOpen] = useState(true);
  const details = subscription.details;
  const paymentLabel = PAYMENT_LABELS[details.paymentStatus] || details.paymentStatus;

  return (
    <article className={styles.orderCard}>
      <div className={styles.orderTop}>
        <div>
          <span className={styles.orderType}>Pretplata</span>
          <h2>{details.title}</h2>
        </div>
        <button
          type="button"
          className={`${styles.collapseButton} ${isOpen ? styles.collapseButtonOpen : ''}`}
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
        >
          <span>{isOpen ? 'Skupi' : 'Otvori'}</span>
          <FaChevronDown aria-hidden="true" />
        </button>
      </div>

      <div
        className={`${styles.collapsibleContent} ${isOpen ? styles.collapsibleContentOpen : ''}`}
        aria-hidden={!isOpen}
      >
          <div className={styles.infoGrid}>
            <InfoItem icon={<FaUser />} label="Kupac" value={subscription.ime} />
            <InfoItem icon={<FaPhoneAlt />} label="Telefon" value={subscription.br_tel || '-'} />
            <InfoItem icon={<FaEnvelope />} label="Email" value={subscription.email || '-'} />
            <InfoItem icon={<FaMapMarkerAlt />} label="Mesto" value={subscription.mesto || '-'} />
            <InfoItem icon={<FaCalendarAlt />} label="Prva isporuka" value={formatDate(details.firstDelivery)} />
            <InfoItem icon={<FaClock />} label="Poslednja isporuka" value={formatDate(details.lastDelivery)} />
          </div>

          <div className={styles.orderBody}>
            <div className={styles.itemsPanel}>
              <div className={styles.sectionTitle}>
                <FaReceipt aria-hidden="true" />
                Plan isporuka
              </div>
              <ul className={styles.subscriptionItemsList}>
                {details.items.map((item) => (
                  <li key={item.id || item.name}>
                    <div>
                      <span>{item.meta?.formattedDate || formatDate(item.meta?.deliveryDate)}</span>
                      <strong>{item.name}</strong>
                      <p>
                        {item.meta?.serviceDay || 'Radni dan'}
                        {item.variant ? ` / ${item.variant}` : ''}
                        {item.meta?.mealNumber ? ` / Obrok ${item.meta.mealNumber}` : ''}
                      </p>
                    </div>
                    <em>{formatRsd(item.totalPriceRsd)}</em>
                  </li>
                ))}
              </ul>
            </div>

            <aside className={styles.sidePanel}>
              <div className={styles.totalBox}>
                <span>Ukupno</span>
                <strong>{formatRsd(details.totalRsd)}</strong>
              </div>
              <div className={styles.noteBox}>
                <span>Dana isporuke</span>
                <p>{details.daysCount}</p>
              </div>
              <div className={styles.noteBox}>
                <span>Plaćanje</span>
                <p>{paymentLabel}</p>
              </div>
              <div className={styles.noteBox}>
                <span>Naruceno</span>
                <p>{formatDateTime(subscription.created_at)}</p>
              </div>
              <div className={styles.noteBox}>
                <span>Napomena kupca</span>
                <p>{details.customerNote || 'Nema napomene.'}</p>
              </div>
            </aside>
          </div>
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
