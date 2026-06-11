'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import Link from 'next/link';
import styles from './page.module.css';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function formatRsd(value) {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function PlacanjePage() {
  return (
    <Elements stripe={stripePromise}>
      <div className={styles.container}>
        <Suspense fallback={<div className={styles.formWrapper}>Ucitavanje...</div>}>
          <CheckoutForm />
        </Suspense>
      </div>
    </Elements>
  );
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(Boolean(orderId));
  const [message, setMessage] = useState(
    orderId ? '' : 'Narudzbina nije prosledjena. Vratite se na stranicu za narucivanje.'
  );
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let active = true;

    async function loadOrder() {
      setOrderLoading(true);
      setMessage('');

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
          setMessage(error.message);
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setMessage('Stripe nije ucitan. Pokusajte ponovo.');
      return;
    }

    if (!order) {
      setMessage('Narudzbina nije ucitana.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          email,
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Placanje nije pokrenuto.');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name, email },
        },
      });

      if (error) {
        setMessage('Greska pri placanju: ' + error.message);
      } else if (paymentIntent.status === 'succeeded') {
        setMessage('Placanje uspesno. Hvala vam.');
        setOrder((current) => (current ? { ...current, status: 'paid' } : current));
        setEmail('');
        setName('');
        elements.getElement(CardElement)?.clear();
      }
    } catch (error) {
      setMessage('Greska: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const canPay = Boolean(order && !orderLoading);

  return (
    <div className={styles.formWrapper}>
      <h1>Placanje narudzbine</h1>

      {orderLoading && <div className={styles.orderSummary}>Ucitavanje narudzbine...</div>}

      {order && (
        <div className={styles.orderSummary}>
          <h2>Sazetak narudzbine</h2>
          {order.type === 'menu' && <MenuSummary order={order} />}
          {order.type === 'custom' && <CustomSummary order={order} />}

          <div className={styles.totalRow}>
            <span>Ukupno za placanje:</span>
            <strong>{formatRsd(order.totalRsd)}</strong>
          </div>

          <Link href="/poruci" className={styles.changeOrderLink}>
            Nazad i promeni narudzbinu
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Ime i prezime</label>
          <input
            id="name"
            type="text"
            placeholder="Vase ime i prezime"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            disabled={loading || !canPay}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="vas@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={loading || !canPay}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Iznos za placanje</label>
          <div className={styles.amountDisplay}>
            <span className={styles.amountValue}>{order ? formatRsd(order.totalRsd) : '-'}</span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Podaci kartice</label>
          <div className={styles.cardElement}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424242',
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
              disabled={loading || !canPay}
            />
          </div>
        </div>

        <button type="submit" disabled={loading || !stripe || !canPay} className={styles.submitBtn}>
          {loading ? 'Obrada...' : `Plati ${order ? formatRsd(order.totalRsd) : ''}`}
        </button>
      </form>

      {message && (
        <div className={`${styles.message} ${message.includes('uspesno') ? styles.success : styles.error}`}>
          {message}
        </div>
      )}

      <div className={styles.testInfo}>
        <p><strong>Test kartice:</strong></p>
        <ul>
          <li>4242 4242 4242 4242 - uspesna transakcija</li>
          <li>4000 0000 0000 9995 - odbijena kartica</li>
          <li>Rok: bilo koji buduci datum</li>
          <li>CVC: bilo koja 3 broja</li>
        </ul>
      </div>
    </div>
  );
}

function MenuSummary({ order }) {
  return (
    <div className={styles.summaryContent}>
      <div className={styles.summaryItem}>
        <span className={styles.label}>Odabrani meni:</span>
        <span className={styles.value}>{order.menu.name}</span>
      </div>
      <div className={styles.summaryItem}>
        <span className={styles.label}>Opis:</span>
        <span className={styles.value}>{order.menu.description}</span>
      </div>
      {order.menu.serviceDay && (
        <div className={styles.summaryItem}>
          <span className={styles.label}>Dan:</span>
          <span className={styles.value}>{order.menu.serviceDay}</span>
        </div>
      )}
      {order.menu.variant && (
        <div className={styles.summaryItem}>
          <span className={styles.label}>Varijanta:</span>
          <span className={styles.value}>{order.menu.variant}</span>
        </div>
      )}
      <div className={styles.summaryItem}>
        <span className={styles.label}>Jela:</span>
        <ul className={styles.itemsList}>
          {order.menu.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className={styles.summaryItem}>
        <span className={styles.label}>Cena:</span>
        <span className={styles.value}>{formatRsd(order.menu.priceRsdPerPerson)} po osobi</span>
      </div>
    </div>
  );
}

function CustomSummary({ order }) {
  return (
    <div className={styles.summaryContent}>
      <div className={styles.summaryItem}>
        <span className={styles.label}>Tip dogadjaja:</span>
        <span className={styles.value}>{order.eventType}</span>
      </div>
      <div className={styles.summaryItem}>
        <span className={styles.label}>Broj obroka:</span>
        <span className={styles.value}>{order.guestCount}</span>
      </div>
      <div className={styles.summaryItem}>
        <span className={styles.label}>Odabrana jela:</span>
        <ul className={styles.itemsList}>
          {order.selectedDishes.map((dish) => (
            <li key={`${dish.mealId || 'meal'}-${dish.id}`}>
              {dish.mealLabel ? `${dish.mealLabel}: ` : ''}
              {dish.name} - {formatRsd(dish.priceRsdPerPerson)}
            </li>
          ))}
        </ul>
      </div>
      {order.notes && (
        <div className={styles.summaryItem}>
          <span className={styles.label}>Napomene:</span>
          <span className={styles.value}>{order.notes}</span>
        </div>
      )}
      <div className={styles.summaryItem}>
        <span className={styles.label}>Ukupno za obroke:</span>
        <span className={styles.value}>{formatRsd(order.priceRsdPerPerson)}</span>
      </div>
    </div>
  );
}
