'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaReceipt,
  FaUser,
} from 'react-icons/fa';
import styles from './page.module.css';

const AVAILABLE_HOURS = Array.from({ length: 8 }, (_, index) => (index + 12).toString().padStart(2, '0'));

const INITIAL_FORM = {
  ime: '',
  email: '',
  br_tel: '',
  datum: '',
  vreme: '',
  mesto: '',
  napomena: '',
};

const ORDER_FORM_ID = 'placanje-order-form';

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
    return 'Nova narudžbina';
  }

  if (order.type === 'menu') {
    return order.menu?.name || 'Dnevni meni';
  }

  if (order.type === 'subscription') {
    return order.eventType || 'Pretplata na obroke';
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

  if (order.type === 'subscription') {
    return Array.isArray(order.selectedDishes)
      ? order.selectedDishes.map((dish) => `${dish.formattedDate}: ${dish.description}`)
      : [];
  }

  return [];
}

function getSubscriptionFirstDate(order) {
  if (order?.type !== 'subscription') {
    return '';
  }

  const subscriptionItems = Array.isArray(order.subscription?.items) ? order.subscription.items : [];
  const selectedDishes = Array.isArray(order.selectedDishes) ? order.selectedDishes : [];
  const firstDate =
    subscriptionItems.find((item) => item.date)?.date ||
    selectedDishes.find((item) => item.date)?.date ||
    '';

  return firstDate;
}

function buildStandardItems(order, manualDescription, manualTotalRsd) {
  if (!order) {
    const totalPriceRsd = Number(manualTotalRsd || 0);

    return [
      {
        id: 'manual-item',
        name: manualDescription.trim(),
        category: 'Rucni unos',
        variant: null,
        quantity: 1,
        unitPriceRsd: totalPriceRsd,
        totalPriceRsd,
        meta: {},
      },
    ];
  }

  if (order.type === 'menu') {
    return [
      {
        id: order.menu?.id || order.id,
        name: order.menu?.name || 'Dnevni meni',
        category: 'Dnevni meni',
        variant: order.menu?.variant || null,
        quantity: Number(order.guestCount || 1),
        unitPriceRsd: Number(order.menu?.priceRsdPerPerson || order.totalRsd || 0),
        totalPriceRsd: Number(order.totalRsd || 0),
        meta: {
          description: order.menu?.description || '',
          serviceDay: order.menu?.serviceDay || '',
          dishes: Array.isArray(order.menu?.items) ? order.menu.items : [],
        },
      },
    ];
  }

  if (order.type === 'custom') {
    const customItems = Array.isArray(order.selectedDishes)
      ? order.selectedDishes.map((dish) => ({
          id: `${dish.mealId || 'meal'}-${dish.id}`,
          name: dish.name,
          category: dish.category || 'Personalizovano',
          variant: null,
          quantity: Number(dish.quantity || 1),
          unitPriceRsd: Number(dish.priceRsdPerPerson || 0),
          totalPriceRsd: Number(
            dish.totalPriceRsd || Number(dish.priceRsdPerPerson || 0) * Number(dish.quantity || 1)
          ),
          meta: {
            mealId: dish.mealId || null,
            mealLabel: dish.mealLabel || '',
            source: dish.source || null,
          },
        }))
      : [];

    return customItems;
  }

  if (order.type === 'subscription') {
    const subscriptionItems = Array.isArray(order.selectedDishes)
      ? order.selectedDishes.map((dish) => ({
          id: dish.id,
          name: `${dish.formattedDate ? `${dish.formattedDate} - ` : ''}${dish.description || dish.name}`,
          category: dish.category || 'Pretplata',
          variant: dish.variant || null,
          quantity: 1,
          unitPriceRsd: Number(dish.priceRsdPerPerson || 0),
          totalPriceRsd: Number(dish.priceRsdPerPerson || 0),
          meta: {
            deliveryDate: dish.date || null,
            formattedDate: dish.formattedDate || '',
            serviceDay: dish.serviceDay || '',
            mealNumber: dish.mealNumber || null,
            source: dish.source || null,
          },
        }))
      : [];

    return subscriptionItems;
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
      <div className={styles.loadingPanel}>Učitavanje narudžbine...</div>
    </section>
  );
}

function PaymentDraft() {
  const searchParams = useSearchParams();
  const hasDraft = searchParams.get('draft') === '1';
  const dateInputRef = useRef(null);
  const bottomOrderRef = useRef(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(hasDraft);
  const [submitting, setSubmitting] = useState(false);
  const [manualTotal, setManualTotal] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!hasDraft) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setOrderLoading(true);
      setStatus({ type: '', message: '' });

      try {
        const storedDraft = sessionStorage.getItem('pendingOrderDraft');

        if (!storedDraft) {
          throw new Error('Narudžbina nije pronađena. Vratite se na poručivanje.');
        }

        const parsedDraft = JSON.parse(storedDraft);
        const subscriptionFirstDate = getSubscriptionFirstDate(parsedDraft);

        setOrder(parsedDraft);

        if (subscriptionFirstDate) {
          setForm((current) => ({
            ...current,
            datum: subscriptionFirstDate,
          }));
        }
      } catch (error) {
        setStatus({ type: 'error', message: error.message });
      } finally {
        setOrderLoading(false);
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasDraft]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 920px)');
    const updateIsMobile = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateIsMobile();
    mediaQuery.addEventListener('change', updateIsMobile);

    return () => {
      mediaQuery.removeEventListener('change', updateIsMobile);
    };
  }, []);

  const orderItems = useMemo(() => getOrderItems(order), [order]);
  const baseTotalRsd = order ? Number(order.totalRsd || 0) : Number(manualTotal || 0);
  const totalRsd = baseTotalRsd;
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
    const normalizedHour = AVAILABLE_HOURS.includes(currentHour) ? currentHour : '12';
    const normalizedMinute = ['00', '15', '30', '45'].includes(currentMinute) ? currentMinute : '00';
    const nextHour = part === 'hour' ? (AVAILABLE_HOURS.includes(value) ? value : normalizedHour) : normalizedHour;
    const nextMinute = part === 'minute' ? (['00', '15', '30', '45'].includes(value) ? value : normalizedMinute) : normalizedMinute;

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

  const scrollToBottomOrder = () => {
    bottomOrderRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  const handleTopOrderClick = () => {
    if (!isMobile) {
      return;
    }

    scrollToBottomOrder();
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
          schemaVersion: 1,
          source: 'placanje',
          type: order
            ? order.type === 'custom'
              ? 'custom_meal_order'
              : order.type === 'subscription'
                ? 'subscription_order'
                : 'meal_order'
            : 'manual_order',
          title: getOrderTitle(order),
          status: 'new',
          items: buildStandardItems(order, manualDescription, baseTotalRsd),
          totals: {
            subtotalRsd: totalRsd,
            deliveryRsd: 0,
            discountRsd: 0,
            totalRsd,
          },
          customerNote: form.napomena.trim(),
          internalNote: '',
          payment: {
            status: 'not_started',
            provider: null,
            providerPaymentId: null,
            amountRsd: totalRsd,
            currency: 'RSD',
            paidAt: null,
          },
          fulfillment: {
            method: 'delivery',
            status: 'pending',
            confirmedAt: null,
            completedAt: null,
          },
        },
      };

      const response = await fetch('/api/narudzbine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Narudžbina nije sačuvana.');
      }

      setCreatedOrder(data.narudzbina);
      setStatus({
        type: 'success',
        message: 'Narudžbina je sačuvana u bazi. Plaćanje još nije aktivirano.',
      });
      setForm(INITIAL_FORM);
      setManualDescription('');
      setManualTotal('');
      sessionStorage.removeItem('pendingOrderDraft');
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className={styles.shell}>
        <div className={styles.hero}>
        <Link href="/poruci" className={styles.backLink}>
          <FaArrowLeft aria-hidden="true" />
          Poručivanje
        </Link>
        <div>
          <span className={styles.eyebrow}>Potvrda narudžbine</span>
          <h1>Podaci za isporuku i priprema plaćanja</h1>
          <p>
            Trenutno čuvamo narudžbinu u bazi bez naplate. Trenutno prihvatamo samo keš plaćanje, ali u skorije vreme će i online plaćanje biti dostupno.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        <form id={ORDER_FORM_ID} className={styles.formPanel} onSubmit={handleSubmit}>
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
              {order?.type === 'subscription' ? 'Prva isporuka' : 'Datum *'}
              {order?.type === 'subscription' ? (
                <div className={styles.readOnlyValue}>
                  {form.datum ? formatDate(form.datum) : 'Datum iz pretplate'}
                </div>
              ) : (
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
              )}
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
                  {AVAILABLE_HOURS.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
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
                Opis narudžbine *
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
            <button
              type={isMobile ? 'button' : 'submit'}
              form={isMobile ? undefined : ORDER_FORM_ID}
              disabled={isMobile ? false : !canSubmit}
              onClick={handleTopOrderClick}
            >
              {submitting ? 'Slanje...' : 'Poruči'}
            </button>
            <span>Plaćanje se ne naplaćuje na ovom koraku.</span>
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
              <h2>Narudžbina</h2>
            </div>
            <FaReceipt aria-hidden="true" />
          </div>

          {orderLoading ? (
            <div className={styles.emptyState}>Učitavanje izabrane narudžbine...</div>
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
                <p className={styles.emptyState}>Unesite opis narudžbine u formi.</p>
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

              <div ref={bottomOrderRef} className={styles.totalBox}>
                <div className={styles.totalPrice}>
                  <span>Ukupno</span>
                  <strong>{formatRsd(totalRsd)}</strong>
                </div>
                <button type="submit" form={ORDER_FORM_ID} disabled={!canSubmit}>
                  {submitting ? 'Slanje...' : 'Poruči'}
                </button>
              </div>
            </>
          )}

          {createdOrder && (
            <div className={styles.savedBox}>
              <FaCheck aria-hidden="true" />
              <span>Sačuvano u bazi kao narudžbina #{createdOrder.id}</span>
            </div>
          )}
        </aside>
        </div>

      </section>

    </>
  );
}
