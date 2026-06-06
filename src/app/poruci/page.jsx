'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { FaCheck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import {
  DISHES_BY_CATEGORY,
  EVENT_TYPES,
  PREPARED_MENUS,
  calculateCustomOrder,
  formatRsd,
} from '@/lib/orderCatalog';

export default function OrderPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDishes, setSelectedDishes] = useState(new Set());
  const [showHint, setShowHint] = useState(true);
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [guestCount, setGuestCount] = useState('50');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef(null);
  const touchStartX = useRef(0);

  const normalizedGuestCount = Number.parseInt(guestCount, 10) || 0;
  const selectedDishIds = useMemo(() => Array.from(selectedDishes), [selectedDishes]);
  const customEstimate = useMemo(() => {
    if (normalizedGuestCount < 1 || selectedDishIds.length === 0) {
      return { selectedDishes: [], priceRsdPerPerson: 0, totalRsd: 0 };
    }

    return calculateCustomOrder({
      guestCount: normalizedGuestCount,
      selectedDishIds,
    });
  }, [normalizedGuestCount, selectedDishIds]);

  useEffect(() => {
    const hintTimer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(hintTimer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight' && activeTab < 1) {
        setActiveTab(1);
      } else if (event.key === 'ArrowLeft' && activeTab > 0) {
        setActiveTab(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    const touchEndX = event.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeTab < 1) {
        setActiveTab(1);
      } else if (diff < 0 && activeTab > 0) {
        setActiveTab(0);
      }
    }
  };

  const handleDishToggle = (dishId) => {
    setSelectedDishes((current) => {
      const next = new Set(current);

      if (next.has(dishId)) {
        next.delete(dishId);
      } else {
        next.add(dishId);
      }

      return next;
    });
  };

  const createOrderAndGoToPayment = async (payload) => {
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Narudzbina nije sacuvana.');
      }

      router.push(`/placanje?orderId=${data.order.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handleMenuOrder = (menu) => {
    createOrderAndGoToPayment({
      type: 'menu',
      menuId: menu.id,
      guestCount: 1,
    });
  };

  const handleCustomOrder = (event) => {
    event.preventDefault();

    if (selectedDishIds.length === 0) {
      setError('Molimo odaberite bar jedno jelo.');
      return;
    }

    createOrderAndGoToPayment({
      type: 'custom',
      eventType,
      guestCount: normalizedGuestCount,
      selectedDishIds,
      notes,
    });
  };

  return (
    <main className={styles.orderPage}>
      <div
        className={styles.swipeContainer}
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {showHint && (
          <div className={styles.scrollHint}>
            <div className={styles.hintContent}>
              <FaChevronLeft className={styles.hintArrow} />
              <span>Swipe or drag</span>
              <FaChevronRight className={styles.hintArrow} />
            </div>
          </div>
        )}

        <div className={styles.swipeWrapper} style={{ transform: `translateX(-${activeTab * 100}%)` }}>
          <div className={styles.tab}>
            <div className={`${styles.tabContent} ${styles.prepared}`}>
              <div className={styles.tabHeader}>
                <h2>Pripremljeni meniji</h2>
                <p>Odaberite jedan od nasih gotovih menija</p>
              </div>

              <div className={styles.menusGrid}>
                {PREPARED_MENUS.map((menu) => (
                  <div key={menu.id} className={styles.menuCard}>
                    <div className={styles.menuImage} style={{ backgroundImage: `url(${menu.image})` }} />
                    <div className={styles.menuContent}>
                      <h3>{menu.name}</h3>
                      <p className={styles.description}>{menu.description}</p>
                      <div className={styles.items}>
                        {menu.items.map((item) => (
                          <div key={item} className={styles.item}>
                            <FaCheck /> {item}
                          </div>
                        ))}
                      </div>
                      <div className={styles.priceFooter}>
                        <span className={styles.price}>{formatRsd(menu.priceRsdPerPerson)} po osobi</span>
                        <button
                          type="button"
                          className={styles.orderBtn}
                          onClick={() => handleMenuOrder(menu)}
                          disabled={submitting}
                        >
                          {submitting ? 'Cuvanje...' : 'Poruci'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.tab}>
            <div className={`${styles.tabContent} ${styles.custom}`}>
              <div className={styles.tabHeader}>
                <h2>Personalizovana narudzbina</h2>
                <p>Kreirajte meni po svojoj meri</p>
              </div>

              <form className={styles.customForm} onSubmit={handleCustomOrder}>
                <div className={styles.formSection}>
                  <h3>Osnovni podaci</h3>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Tip dogadjaja</label>
                      <select value={eventType} onChange={(event) => setEventType(event.target.value)}>
                        {EVENT_TYPES.map((type) => (
                          <option key={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Broj osoba</label>
                      <input
                        type="number"
                        placeholder="50"
                        min="1"
                        max="500"
                        value={guestCount}
                        onChange={(event) => setGuestCount(event.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h3>Odaberite jela</h3>
                  <div className={styles.dishesGrid}>
                    {DISHES_BY_CATEGORY.map((category) => (
                      <div key={category.category} className={styles.dishCategory}>
                        <h4>{category.category}</h4>
                        <div className={styles.dishesCheckboxGroup}>
                          {category.dishes.map((dish) => (
                            <label key={dish.id} className={styles.dishCheckbox}>
                              <input
                                type="checkbox"
                                checked={selectedDishes.has(dish.id)}
                                onChange={() => handleDishToggle(dish.id)}
                              />
                              <span>{dish.name}</span>
                              <strong className={styles.dishPrice}>
                                {formatRsd(dish.priceRsdPerPerson)}
                              </strong>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h3>Napomene</h3>

                  <div className={styles.formGroup}>
                    <label>Dodatne napomene i zelje</label>
                    <textarea
                      placeholder="Recite nam sta vam jos treba..."
                      rows="4"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.estimateBox}>
                  <span>Cena po osobi: {formatRsd(customEstimate.priceRsdPerPerson)}</span>
                  <strong>Ukupno: {formatRsd(customEstimate.totalRsd)}</strong>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? 'Cuvanje narudzbine...' : 'Nastavi na placanje'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.fixedTabs}>
        <div className={styles.tabSwitcher}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 0 ? styles.active : ''}`}
            onClick={() => setActiveTab(0)}
          >
            <span>Pripremljeni meniji</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 1 ? styles.active : ''}`}
            onClick={() => setActiveTab(1)}
          >
            <span>Personalizovano</span>
          </button>
          <div className={styles.slidingBg} style={{ transform: `translateX(${activeTab * 100}%)` }} />
        </div>
      </div>
    </main>
  );
}
