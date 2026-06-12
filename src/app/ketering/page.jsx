'use client';

import { useRef, useState } from 'react';
import styles from './page.module.css';

const OFFERS = [
  {
    id: 'business',
    name: 'Poslovni ketering',
    image: '/01card.webp',
    price: 28000,
    description: 'Elegantna postavka za sastanke, obuke i korporativne događaje.',
    items: ['Slani zalogaji', 'Mini sendviči', 'Sezonske salate', 'Bezalkoholno piće'],
  },
  {
    id: 'celebration',
    name: 'Proslave',
    image: '/02card.webp',
    price: 42000,
    description: 'Bogata ponuda za rođendane, punoletstva i privatna okupljanja.',
    items: ['Topla predjela', 'Glavna jela', 'Salate', 'Dezert zalogaji'],
  },
  {
    id: 'premium',
    name: 'Premium događaj',
    image: '/03card.webp',
    price: 68000,
    description: 'Kompletan premium meni za svečane prijeme i veće događaje.',
    items: ['Premium kanapei', 'File minjon', 'Riblji izbor', 'Servis posluženja'],
  },
  {
    id: 'family',
    name: 'Porodični ručak',
    image: '/04card.webp',
    price: 24000,
    description: 'Topao i domaći meni za porodična okupljanja i manje proslave.',
    items: ['Domaća predjela', 'Pečenje ili gril', 'Prilozi', 'Sveže salate'],
  },
];

function formatRsd(value) {
  return `${value.toLocaleString('sr-RS')} RSD`;
}

function formatSerbianDate(value) {
  if (!value) {
    return '';
  }

  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}`;
}

export default function KeteringPage() {
  const dateInputRef = useRef(null);
  const [selectedOfferId, setSelectedOfferId] = useState(OFFERS[0].id);
  const [formData, setFormData] = useState({
    ime: '',
    email: '',
    br_tel: '',
    datum: '',
    vreme: '',
    mesto: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedOffer = OFFERS.find((offer) => offer.id === selectedOfferId) || OFFERS[0];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleTimePartChange = (part, value) => {
    const [currentHour = '12', currentMinute = '00'] = formData.vreme.split(':');
    const nextHour = part === 'hour' ? value : currentHour;
    const nextMinute = part === 'minute' ? value : currentMinute;

    setFormData((current) => ({
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
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      if (!formData.datum) {
        throw new Error('Izaberite datum iz kalendara.');
      }

      if (!formData.vreme) {
        throw new Error('Izaberite vreme u 24h formatu.');
      }

      const response = await fetch('/api/narudzbine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cena: selectedOffer.price,
          porudzbina: {
            schemaVersion: 1,
            source: 'ketering',
            type: 'catering_inquiry',
            title: selectedOffer.name,
            status: 'new',
            items: [
              {
                id: selectedOffer.id,
                name: selectedOffer.name,
                category: 'Ketering ponuda',
                variant: null,
                quantity: 1,
                unitPriceRsd: selectedOffer.price,
                totalPriceRsd: selectedOffer.price,
                meta: {
                  description: selectedOffer.description,
                  dishes: selectedOffer.items,
                },
              },
            ],
            totals: {
              subtotalRsd: selectedOffer.price,
              deliveryRsd: 0,
              discountRsd: 0,
              totalRsd: selectedOffer.price,
            },
            customerNote: '',
            internalNote: '',
            payment: {
              status: 'not_started',
              provider: null,
              providerPaymentId: null,
              amountRsd: selectedOffer.price,
              currency: 'RSD',
              paidAt: null,
            },
            fulfillment: {
              method: 'delivery',
              status: 'pending',
              confirmedAt: null,
              completedAt: null,
            },
            legacy: {
              offerId: selectedOffer.id,
              rawOffer: selectedOffer,
            },
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upit nije poslat.');
      }

      setStatus({ type: 'success', message: 'Upit je poslat vlasniku.' });
      setFormData({
        ime: '',
        email: '',
        br_tel: '',
        datum: '',
        vreme: '',
        mesto: '',
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span>Ketering ponude</span>
          <h1>Izaberi paket i pošalji upit</h1>
          <p>
            Ova strana ne vodi na plaćanje. Pošalji detalje događaja, a vlasnik dobija upit
            sa izabranom ponudom, cenom i terminom.
          </p>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.offersGrid}>
          {OFFERS.map((offer) => (
            <article
              key={offer.id}
              className={`${styles.offerCard} ${
                selectedOfferId === offer.id ? styles.selectedCard : ''
              }`}
            >
              <div className={styles.offerImage} style={{ backgroundImage: `url(${offer.image})` }}>
                <span>{formatRsd(offer.price)}</span>
              </div>
              <div className={styles.offerBody}>
                <h2>{offer.name}</h2>
                <p>{offer.description}</p>
                <ul>
                  {offer.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <button type="button" onClick={() => setSelectedOfferId(offer.id)}>
                  {selectedOfferId === offer.id ? 'Izabrano' : 'Izaberi ponudu'}
                </button>
              </div>
            </article>
          ))}
        </div>

        <form className={styles.inquiryForm} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <span>Izabrana ponuda</span>
            <h2>{selectedOffer.name}</h2>
            <strong>{formatRsd(selectedOffer.price)}</strong>
          </div>

          <div className={styles.formGrid}>
            <label>
              Ime
              <input name="ime" value={formData.ime} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </label>
            <label>
              Broj telefona
              <input name="br_tel" value={formData.br_tel} onChange={handleChange} />
            </label>
            <label>
              Datum
              <div className={styles.datePickerWrap}>
                <button type="button" className={styles.pickerButton} onClick={openDatePicker}>
                  {formData.datum ? formatSerbianDate(formData.datum) : 'dd.mm.yyyy'}
                </button>
                <input
                  ref={dateInputRef}
                  className={styles.hiddenDateInput}
                  name="datum"
                  type="date"
                  value={formData.datum}
                  onChange={handleChange}
                  tabIndex={-1}
                />
              </div>
            </label>
            <label>
              Vreme
              <div className={styles.timePickerWrap}>
                <select
                  value={formData.vreme.split(':')[0] || ''}
                  onChange={(event) => handleTimePartChange('hour', event.target.value)}
                  required
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
                  value={formData.vreme.split(':')[1] || ''}
                  onChange={(event) => handleTimePartChange('minute', event.target.value)}
                  required
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
            <label className={styles.fullWidth}>
              Mesto
              <textarea
                name="mesto"
                rows="3"
                value={formData.mesto}
                onChange={handleChange}
                placeholder="Adresa ili lokacija događaja"
              />
            </label>
          </div>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Šaljemo upit...' : 'Pošalji upit'}
          </button>

          {status.message && (
            <p className={`${styles.status} ${styles[status.type]}`}>{status.message}</p>
          )}
        </form>
      </section>
    </main>
  );
}
