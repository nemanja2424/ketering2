'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaCreditCard,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaReceipt,
  FaUser,
} from 'react-icons/fa';
import styles from './page.module.css';

const INITIAL_FORM = {
  ime: '',
  email: '',
  br_tel: '',
  datum: '',
  vreme: '',
  mesto: '',
  napomena: '',
};

function formatRsd(value) {
  return `${Number(value || 0).toLocaleString('sr-RS')} RSD`;
}

function formatDate(value) {
  if (!value) {
    return '';
  }

  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}.`;
}

function getOrderTitle(order) {
  if (!order) {
    return 'Nova narudzbina';
  }

  if (order.type === 'menu') {
    return order.menu?.name || 'Dnevni meni';
  }

  return order.eventType || 'Personalizovani obrok';
}

function getOrderItems(order) {
  if (!order) {
    return [];
  }

  if (order.type === 'menu') {
    return Array.isArray(order.menu?.items) ? order.menu.items : [];
  }

  if (order.type === 'custom') {
    return Array.isArray(order.selectedDishes)
      ? order.selectedDishes.map((dish) => `${dish.mealLabel ? `${dish.mealLabel}: ` : ''}${dish.name}`)
      : [];
  }

  return [];
}

export default function PlacanjePage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={<LoadingState />}>
        <PaymentDraft />
      </Suspense>
    </main>
  );
}

function LoadingState() {
  return (
    <section className={styles.shell}>
      <div className={styles.loadingPanel}>Ucitavanje narudzbine...</div>
    </section>
  );
}

function PaymentDraft() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const dateInputRef = useRef(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(Boolean(orderId));
  const [submitting, setSubmitting] = useState(false);
  const [manualTotal, setManualTotal] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let active = true;

    async function loadOrder() {
      setOrderLoading(true);
      setStatus({ type: '', message: '' });

      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Narudzbina nije pronadjena.');
        }

        if (active) {
          setOrder(data.order);
        }
      } catch (error) {
        if (active) {
          setStatus({ type: 'error', message: error.message });
        }
      } finally {
        if (active) {
          setOrderLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [orderId]);

  const orderItems = useMemo(() => getOrderItems(order), [order]);
  const totalRsd = order ? Number(order.totalRsd || 0) : Number(manualTotal || 0);
  const canSubmit = Boolean(
    !submitting &&
      !orderLoading &&
      form.ime &&
      form.datum &&
      form.vreme &&
      (order || manualDescription.trim())
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleTimePartChange = (part, value) => {
    const [currentHour = '12', currentMinute = '00'] = form.vreme.split(':');
    const nextHour = part === 'hour' ? value : currentHour;
    const nextMinute = part === 'minute' ? value : currentMinute;

    setForm((current) => ({
      ...current,
      vreme: `${nextHour}:${nextMinute}`,
    }));
  };

  const openDatePicker = () => {
    const input = dateInputRef.current;

    if (!input) {
      return;
    }

    try {
      input.showPicker?.();
    } catch {
      input.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (!canSubmit) {
      setStatus({ type: 'error', message: 'Popunite obavezna polja pre potvrde.' });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ime: form.ime.trim(),
        email: form.email.trim() || null,
        br_tel: form.br_tel.trim() || null,
        datum: form.datum,
        vreme: form.vreme,
        mesto: form.mesto.trim() || null,
        cena: totalRsd,
        porudzbina: {
          tip: order ? 'online-narudzbina' : 'rucni-unos',
          kanal: '/placanje',
          orderId: order?.id || null,
          naslov: getOrderTitle(order),
          stavke: orderItems,
          napomena: form.napomena.trim(),
          originalnaNarudzbina: order,
          placanje: {
            status: 'nije-pokrenuto',
            provider: null,
            amountRsd: totalRsd,
            currency: 'RSD',
            readyForProvider: true,
          },
        },
      };

      if (!order) {
        payload.porudzbina.opis = manualDescription.trim();
      }

      const response = await fetch('/api/narudzbine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Narudzbina nije sacuvana.');
      }

      setCreatedOrder(data.narudzbina);
      setStatus({
        type: 'success',
        message: 'Narudzbina je sacuvana u bazi. Placanje jos nije aktivirano.',
      });
      setForm(INITIAL_FORM);
      setManualDescription('');
      setManualTotal('');
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.shell}>
      <div className={styles.hero}>
        <Link href="/poruci" className={styles.backLink}>
          <FaArrowLeft aria-hidden="true" />
          Porucivanje
        </Link>
        <div>
          <span className={styles.eyebrow}>Potvrda narudzbine</span>
          <h1>Podaci za isporuku i priprema placanja</h1>
          <p>
            Trenutno cuvamo narudzbinu u bazi bez naplate. Online placanje je izdvojeno kao sledeci
            korak, pa se kasnije moze dodati bez promene forme.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        <form className={styles.formPanel} onSubmit={handleSubmit}>
          <div className={styles.panelHeader}>
            <div>
              <span>Kontakt</span>
              <h2>Podaci kupca</h2>
            </div>
            <FaUser aria-hidden="true" />
          </div>

          <div className={styles.fieldsGrid}>
            <label className={styles.field}>
              Ime i prezime *
              <input
                name="ime"
                value={form.ime}
                onChange={handleChange}
                placeholder="Unesite ime"
                autoComplete="name"
                required
              />
            </label>

            <label className={styles.field}>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ime@email.com"
                autoComplete="email"
              />
            </label>

            <label className={styles.field}>
              Telefon
              <input
                name="br_tel"
                value={form.br_tel}
                onChange={handleChange}
                placeholder="06x xxx xxxx"
                autoComplete="tel"
              />
            </label>

            <label className={styles.field}>
              Mesto isporuke
              <input
                name="mesto"
                value={form.mesto}
                onChange={handleChange}
                placeholder="Adresa"
                autoComplete="street-address"
              />
            </label>

            <label className={styles.field}>
              Datum *
              <div className={styles.datePickerWrap}>
                <button type="button" className={styles.pickerButton} onClick={openDatePicker}>
                  {form.datum ? formatDate(form.datum) : 'dd.mm.yyyy'}
                </button>
                <input
                  ref={dateInputRef}
                  className={styles.hiddenDateInput}
                  name="datum"
                  type="date"
                  value={form.datum}
                  onChange={handleChange}
                  tabIndex={-1}
                />
              </div>
            </label>

            <label className={styles.field}>
              Vreme *
              <div className={styles.timePickerWrap}>
                <select
                  value={form.vreme.split(':')[0] || ''}
                  onChange={(event) => handleTimePartChange('hour', event.target.value)}
                >
                  <option value="" disabled>
                    Sat
                  </option>
                  {Array.from({ length: 24 }, (_, hour) => hour.toString().padStart(2, '0')).map(
                    (hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    )
                  )}
                </select>
                <span>:</span>
                <select
                  value={form.vreme.split(':')[1] || ''}
                  onChange={(event) => handleTimePartChange('minute', event.target.value)}
                >
                  <option value="" disabled>
                    Min
                  </option>
                  {['00', '15', '30', '45'].map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          {!order && (
            <div className={styles.manualBox}>
              <label className={styles.field}>
                Opis narudzbine *
                <textarea
                  value={manualDescription}
                  onChange={(event) => setManualDescription(event.target.value)}
                  placeholder="Npr. 12 personalizovanih obroka, bez luka, dostava do 14h"
                  rows="4"
                  required
                />
              </label>

              <label className={styles.field}>
                Procena iznosa
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={manualTotal}
                  onChange={(event) => setManualTotal(event.target.value)}
                  placeholder="0"
                />
              </label>
            </div>
          )}

          <label className={styles.field}>
            Napomena
            <textarea
              name="napomena"
              value={form.napomena}
              onChange={handleChange}
              placeholder="Alergije, instrukcije za dostavu, dodatni dogovor..."
              rows="4"
            />
          </label>

          <div className={styles.submitRow}>
            <button type="submit" disabled={!canSubmit}>
              {submitting ? 'Cuvanje...' : 'Sacuvaj narudzbinu'}
            </button>
            <span>Placanje se ne naplacuje na ovom koraku.</span>
          </div>

          {status.message && (
            <div className={`${styles.message} ${status.type === 'success' ? styles.success : styles.error}`} role="alert">
              {status.message}
            </div>
          )}
        </form>

        <aside className={styles.summaryPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span>Pregled</span>
              <h2>Narudzbina</h2>
            </div>
            <FaReceipt aria-hidden="true" />
          </div>

          {orderLoading ? (
            <div className={styles.emptyState}>Ucitavanje izabrane narudzbine...</div>
          ) : (
            <>
              <div className={styles.summaryTitle}>
                <strong>{getOrderTitle(order)}</strong>
                <span>{order ? `ID: ${order.id}` : 'Bez prethodno kreiranog ID-a'}</span>
              </div>

              {orderItems.length > 0 ? (
                <ul className={styles.itemsList}>
                  {orderItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className={styles.emptyState}>Unesite opis narudzbine u formi.</p>
              )}

              <div className={styles.metaList}>
                <div>
                  <FaCalendarAlt aria-hidden="true" />
                  <span>{form.datum ? formatDate(form.datum) : 'Datum nije izabran'}</span>
                </div>
                <div>
                  <FaClock aria-hidden="true" />
                  <span>{form.vreme || 'Vreme nije izabrano'}</span>
                </div>
                <div>
                  <FaMapMarkerAlt aria-hidden="true" />
                  <span>{form.mesto || 'Mesto nije uneto'}</span>
                </div>
                <div>
                  <FaPhoneAlt aria-hidden="true" />
                  <span>{form.br_tel || 'Telefon nije unet'}</span>
                </div>
              </div>

              <div className={styles.totalBox}>
                <span>Ukupno</span>
                <strong>{formatRsd(totalRsd)}</strong>
              </div>
            </>
          )}

          <div className={styles.paymentSlot}>
            <div>
              <FaCreditCard aria-hidden="true" />
              <strong>Online placanje kasnije</strong>
            </div>
            <p>Podaci se cuvaju sa payment statusom, providerom i valutom, spremno za Stripe ili drugi servis.</p>
          </div>

          {createdOrder && (
            <div className={styles.savedBox}>
              <FaCheck aria-hidden="true" />
              <span>Sacuvano u bazi kao narudzbina #{createdOrder.id}</span>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
