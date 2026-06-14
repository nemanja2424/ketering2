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
  FaPlus,
  FaReceipt,
  FaTimes,
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

const ORDER_FORM_ID = 'placanje-order-form';

const ADD_ON_CATEGORIES = [
  {
    id: 'potaz',
    label: 'Potaz',
    products: [
      { id: 'potaz-bundeva', name: 'Potaz od bundeve', priceRsd: 320 },
      { id: 'potaz-brokoli', name: 'Potaz od brokolija', priceRsd: 340 },
      { id: 'potaz-pecurke', name: 'Potaz od pecuraka', priceRsd: 360 },
    ],
  },
  {
    id: 'deserti',
    label: 'Deserti',
    products: [
      { id: 'desert-protein-kuglice', name: 'Protein kuglice', priceRsd: 290 },
      { id: 'desert-cia-puding', name: 'Cia puding', priceRsd: 360 },
      { id: 'desert-cheesecake', name: 'Mini cheesecake', priceRsd: 420 },
    ],
  },
  {
    id: 'smuti',
    label: 'Smuti',
    products: [
      { id: 'smuti-zeleni', name: 'Zeleni smuti', priceRsd: 390 },
      { id: 'smuti-bobice', name: 'Smuti sa bobicama', priceRsd: 420 },
      { id: 'smuti-protein', name: 'Protein smuti', priceRsd: 480 },
    ],
  },
];

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

function buildAddOnItems(addOns) {
  return addOns.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.categoryLabel,
    variant: null,
    quantity: item.quantity,
    unitPriceRsd: item.priceRsd,
    totalPriceRsd: item.priceRsd * item.quantity,
    meta: {
      source: 'dopuna',
      categoryId: item.categoryId,
    },
  }));
}

function buildStandardItems(order, manualDescription, manualTotalRsd, addOns = []) {
  const addOnItems = buildAddOnItems(addOns);

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
      ...addOnItems,
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
      ...addOnItems,
    ];
  }

  if (order.type === 'custom') {
    const customItems = Array.isArray(order.selectedDishes)
      ? order.selectedDishes.map((dish) => ({
          id: `${dish.mealId || 'meal'}-${dish.id}`,
          name: dish.name,
          category: dish.category || 'Personalizovano',
          variant: null,
          quantity: 1,
          unitPriceRsd: Number(dish.priceRsdPerPerson || 0),
          totalPriceRsd: Number(dish.priceRsdPerPerson || 0),
          meta: {
            mealId: dish.mealId || null,
            mealLabel: dish.mealLabel || '',
          },
        }))
      : [];

    return [...customItems, ...addOnItems];
  }

  if (order.type === 'subscription') {
    const subscriptionItems = Array.isArray(order.selectedDishes)
      ? order.selectedDishes.map((dish) => ({
          id: dish.id,
          name: `${dish.formattedDate ? `${dish.formattedDate} - ` : ''}${dish.description || dish.name}`,
          category: 'Pretplata',
          variant: dish.variant || null,
          quantity: 1,
          unitPriceRsd: Number(dish.priceRsdPerPerson || 0),
          totalPriceRsd: Number(dish.priceRsdPerPerson || 0),
          meta: {
            deliveryDate: dish.date || null,
            formattedDate: dish.formattedDate || '',
            serviceDay: dish.serviceDay || '',
            mealNumber: dish.mealNumber || null,
          },
        }))
      : [];

    return [...subscriptionItems, ...addOnItems];
  }

  return addOnItems;
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
  const [activeAddOnCategoryId, setActiveAddOnCategoryId] = useState(null);
  const [addOns, setAddOns] = useState([]);

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
          throw new Error('Narudzbina nije pronadjena. Vratite se na porucivanje.');
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
  const activeAddOnCategory = ADD_ON_CATEGORIES.find((category) => category.id === activeAddOnCategoryId);
  const addOnTotalRsd = addOns.reduce((sum, item) => sum + item.priceRsd * item.quantity, 0);
  const baseTotalRsd = order ? Number(order.totalRsd || 0) : Number(manualTotal || 0);
  const totalRsd = baseTotalRsd + addOnTotalRsd;
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

  const getAddOnQuantity = (productId) => {
    return addOns.find((item) => item.id === productId)?.quantity || 0;
  };

  const updateAddOnQuantity = (category, product, change) => {
    setAddOns((current) => {
      const existing = current.find((item) => item.id === product.id);
      const nextQuantity = Math.max(0, (existing?.quantity || 0) + change);

      if (nextQuantity === 0) {
        return current.filter((item) => item.id !== product.id);
      }

      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: nextQuantity } : item
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: nextQuantity,
          categoryId: category.id,
          categoryLabel: category.label,
        },
      ];
    });
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
          items: buildStandardItems(order, manualDescription, baseTotalRsd, addOns),
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
      setAddOns([]);
      setActiveAddOnCategoryId(null);
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
            <button
              type={isMobile ? 'button' : 'submit'}
              form={isMobile ? undefined : ORDER_FORM_ID}
              disabled={isMobile ? false : !canSubmit}
              onClick={handleTopOrderClick}
            >
              {submitting ? 'Slanje...' : 'Poruci'}
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

              {addOns.length > 0 && (
                <div className={styles.addOnSummary}>
                  <span>Dopuna narudzbine</span>
                  <ul>
                    {addOns.map((item) => (
                      <li key={item.id}>
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <strong>{formatRsd(item.priceRsd * item.quantity)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
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
                  {submitting ? 'Slanje...' : 'Poruci'}
                </button>
              </div>
            </>
          )}

          <div className={styles.addOnPanel}>
            <div className={styles.addOnPanelHeader}>
              <FaPlus aria-hidden="true" />
              <strong>Dopuni narudzbinu</strong>
            </div>
            <div className={styles.addOnButtons}>
              {ADD_ON_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveAddOnCategoryId(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {createdOrder && (
            <div className={styles.savedBox}>
              <FaCheck aria-hidden="true" />
              <span>Sacuvano u bazi kao narudzbina #{createdOrder.id}</span>
            </div>
          )}
        </aside>
        </div>

        {activeAddOnCategory && (
          <div
            className={styles.modalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-on-modal-title"
          >
            <div className={styles.addOnModal}>
              <div className={styles.modalHeader}>
                <div>
                  <span>Dopuna korpe</span>
                  <h2 id="add-on-modal-title">{activeAddOnCategory.label}</h2>
                </div>
                <button
                  type="button"
                  className={styles.closeModalButton}
                  onClick={() => setActiveAddOnCategoryId(null)}
                  aria-label="Zatvori"
                >
                  <FaTimes aria-hidden="true" />
                </button>
              </div>

              <div className={styles.addOnProductList}>
                {activeAddOnCategory.products.map((product) => {
                  const quantity = getAddOnQuantity(product.id);

                  return (
                    <article key={product.id} className={styles.addOnProduct}>
                      <div>
                        <h3>{product.name}</h3>
                        <span>{formatRsd(product.priceRsd)}</span>
                      </div>
                      <div className={styles.quantityControls}>
                        <button
                          type="button"
                          onClick={() => updateAddOnQuantity(activeAddOnCategory, product, -1)}
                          disabled={quantity === 0}
                        >
                          -
                        </button>
                        <strong>{quantity}</strong>
                        <button
                          type="button"
                          onClick={() => updateAddOnQuantity(activeAddOnCategory, product, 1)}
                        >
                          +
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className={styles.modalFooter}>
                <span>Dopuna ukupno: {formatRsd(addOnTotalRsd)}</span>
                <button type="button" onClick={() => setActiveAddOnCategoryId(null)}>
                  Sacuvaj dopunu
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

    </>
  );
}
