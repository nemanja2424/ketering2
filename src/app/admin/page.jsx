'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FaCalendarAlt,
  FaChevronDown,
  FaClock,
  FaEnvelope,
  FaFilter,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaReceipt,
  FaSignOutAlt,
  FaSyncAlt,
  FaUser,
  FaUsers,
} from 'react-icons/fa';
import styles from './page.module.css';

const PAYMENT_LABELS = {
  not_started: 'Nije pokrenuto',
  pending: 'Na cekanju',
  paid: 'Placeno',
  failed: 'Neuspesno',
  refunded: 'Refundirano',
};

const TYPE_LABELS = {
  meal_order: 'Pripremljen meni',
  subscription_order: 'Pretplata',
  custom_meal_order: 'Personalizovan meni',
  catering_inquiry: 'Ketering',
  unique_fuel_inquiry: 'Unique Fuel',
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

function getOrderDateKey(order) {
  if (typeof order.datum === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(order.datum)) {
    return order.datum;
  }

  return getLocalDateKey(order.datum);
}

function getOrderLastDateKey(order) {
  if (order.details?.type !== 'subscription_order') {
    return getOrderDateKey(order);
  }

  const deliveryDates = order.details.items
    .map((item) => item.meta?.deliveryDate)
    .filter(Boolean)
    .sort((first, second) => first.localeCompare(second));

  return deliveryDates.at(-1) || getOrderDateKey(order);
}

function getSearchText(order) {
  const details = order.details;
  const itemText = details.items.map((item) => `${item.name} ${item.category || ''}`).join(' ');

  return [
    order.id,
    order.ime,
    order.email,
    order.br_tel,
    order.mesto,
    details.title,
    details.type,
    details.guestCount,
    details.customerNote,
    itemText,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
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
  const guestCount = Number(
    porudzbina.guestCount ||
      porudzbina.brOsoba ||
      items.find((item) => item.meta?.guestCount)?.meta?.guestCount ||
      0
  );

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
    guestCount: Number.isFinite(guestCount) && guestCount > 0 ? guestCount : null,
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
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPastOrders, setShowPastOrders] = useState(false);

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

  const visibleOrders = useMemo(() => {
    const todayKey = getLocalDateKey();
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return normalizedOrders
      .filter((order) => {
        const orderDateKey = getOrderLastDateKey(order);
        const isPast =
          order.details.type !== 'unique_fuel_inquiry' &&
          orderDateKey &&
          orderDateKey < todayKey;

        if (!showPastOrders && isPast) {
          return false;
        }

        if (typeFilter !== 'all' && order.details.type !== typeFilter) {
          return false;
        }

        if (paymentFilter !== 'all' && order.details.paymentStatus !== paymentFilter) {
          return false;
        }

        if (normalizedSearch && !getSearchText(order).includes(normalizedSearch)) {
          return false;
        }

        return true;
      })
      .sort((first, second) => {
        const firstDate = `${getOrderDateKey(first)} ${formatTime(first.vreme)}`;
        const secondDate = `${getOrderDateKey(second)} ${formatTime(second.vreme)}`;

        return showPastOrders
          ? secondDate.localeCompare(firstDate)
          : firstDate.localeCompare(secondDate);
      });
  }, [normalizedOrders, paymentFilter, searchQuery, showPastOrders, typeFilter]);

  const stats = useMemo(() => {
    const total = visibleOrders.length;
    const unpaid = visibleOrders.filter((order) => order.details.paymentStatus !== 'paid').length;
    const revenue = visibleOrders.reduce((sum, order) => sum + order.details.totalRsd, 0);

    return { total, unpaid, revenue };
  }, [visibleOrders]);

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
          <Link href="/admin/pretplate" className={styles.refreshButton}>
            Pretplate
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

      <section className={styles.statsGrid} aria-label="Pregled narudzbina">
        <div>
          <span>Prikazano</span>
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

      <section className={styles.filtersPanel} aria-label="Filteri narudzbina">
        <div className={styles.filtersTitle}>
          <FaFilter aria-hidden="true" />
          <span>Filteri</span>
        </div>

        <div className={styles.filtersGrid}>
          <label>
            Vrsta
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="all">Sve vrste</option>
              <option value="subscription_order">Pretplata</option>
              <option value="catering_inquiry">Ketering</option>
              <option value="unique_fuel_inquiry">Unique Fuel</option>
              <option value="meal_order">Pripremljen meni</option>
              <option value="custom_meal_order">Personalizovan meni</option>
              <option value="manual_order">Rucni unos</option>
            </select>
          </label>

          <label>
            Placanje
            <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
              <option value="all">Sva placanja</option>
              <option value="not_started">Nije pokrenuto</option>
              <option value="pending">Na cekanju</option>
              <option value="paid">Placeno</option>
              <option value="failed">Neuspesno</option>
              <option value="refunded">Refundirano</option>
            </select>
          </label>

          <label>
            Pretraga
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Ime, telefon, adresa, stavka..."
            />
          </label>

          <label className={styles.toggleFilter}>
            <input
              type="checkbox"
              checked={showPastOrders}
              onChange={(event) => setShowPastOrders(event.target.checked)}
            />
            <span>Prikazi istoriju</span>
          </label>
        </div>
      </section>

      <section className={styles.container}>
        {loadingData ? (
          <p className={styles.emptyState}>Ucitavanje narudzbina...</p>
        ) : visibleOrders.length === 0 ? (
          <p className={styles.emptyState}>Nema narudzbina.</p>
        ) : (
          <div className={styles.ordersList}>
            {visibleOrders.map((narudzbina) => (
              <OrderCard key={narudzbina.id} narudzbina={narudzbina} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function OrderCard({ narudzbina }) {
  const [isOpen, setIsOpen] = useState(true);
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
            <InfoItem icon={<FaUser />} label="Kupac" value={narudzbina.ime} />
            <InfoItem icon={<FaPhoneAlt />} label="Telefon" value={narudzbina.br_tel || '-'} />
            <InfoItem icon={<FaEnvelope />} label="Email" value={narudzbina.email || '-'} />
            {details.type !== 'unique_fuel_inquiry' && (
              <>
                <InfoItem icon={<FaCalendarAlt />} label="Datum" value={formatDate(narudzbina.datum)} />
                <InfoItem icon={<FaClock />} label="Vreme" value={formatTime(narudzbina.vreme)} />
              </>
            )}
            <InfoItem icon={<FaMapMarkerAlt />} label="Mesto" value={narudzbina.mesto || '-'} />
            <InfoItem icon={<FaUsers />} label="Broj osoba" value={details.guestCount || '-'} />
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
                    <li
                      key={item.id || item.name}
                      className={item.meta?.source === 'dopuna' ? styles.addOnItem : undefined}
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <span>
                          {Number(item.quantity || 1)}x / {item.category || 'Stavka'}
                          {item.variant ? ` / ${item.variant}` : ''}
                          {item.meta?.source === 'dopuna'
                            ? ' / Dopuna'
                            : item.meta?.mealLabel
                              ? ` / ${item.meta.mealLabel}`
                              : ''}
                          {item.meta?.formattedDate ? ` / Isporuka ${item.meta.formattedDate}` : ''}
                        </span>
                        {Array.isArray(item.meta?.dishes) && item.meta.dishes.length > 0 && (
                          <p>{item.meta.dishes.join(', ')}</p>
                        )}
                        {item.meta?.description && <p>{item.meta.description}</p>}
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
                <span>
                  {details.type === 'unique_fuel_inquiry'
                    ? 'Opis željenog obroka ili plana ishrane'
                    : 'Napomena kupca'}
                </span>
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
