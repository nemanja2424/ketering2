'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaArrowDown, FaUtensils } from 'react-icons/fa';
import styles from './page.module.css';

const VARIANT_PRICES_RSD = {
  clean: 750,
  lean: 850,
};

const SUBSCRIPTION_OPTIONS = [
  { days: 5, label: '5 dana' },
  { days: 10, label: '10 dana' },
  { days: 22, label: '22 dana' },
];

const CUSTOM_SECTIONS = [
  {
    id: 'baza',
    title: 'Baza',
    options: [
      { id: 'pirinac', name: 'Integralni pirinac', priceRsdPerPerson: 180 },
      { id: 'proso', name: 'Proso', priceRsdPerPerson: 190 },
      { id: 'batat', name: 'Batat', priceRsdPerPerson: 240 },
      { id: 'pasta', name: 'Pasta', priceRsdPerPerson: 220 },
    ],
  },
  {
    id: 'prilog',
    title: 'Prilog',
    options: [
      { id: 'brokoli', name: 'Brokoli', priceRsdPerPerson: 170 },
      { id: 'tikvice-paprika', name: 'Tikvice i paprika', priceRsdPerPerson: 190 },
      { id: 'boranija', name: 'Boranija', priceRsdPerPerson: 160 },
      { id: 'mesano-povrce', name: 'Mesano povrce', priceRsdPerPerson: 210 },
    ],
  },
  {
    id: 'glavno',
    title: 'Glavno jelo',
    options: [
      { id: 'piletina', name: 'Grilovana piletina', priceRsdPerPerson: 420 },
      { id: 'curetina', name: 'Curetina', priceRsdPerPerson: 480 },
      { id: 'junetina', name: 'Junetina', priceRsdPerPerson: 620 },
      { id: 'losos', name: 'Losos', priceRsdPerPerson: 760 },
      { id: 'file-minjon', name: 'File minjon', priceRsdPerPerson: 820 },
    ],
  },
  {
    id: 'salate',
    title: 'Salate',
    options: [
      { id: 'zelena-salata', name: 'Zelena salata', priceRsdPerPerson: 140 },
      { id: 'vitaminska', name: 'Vitaminska salata', priceRsdPerPerson: 170 },
      { id: 'cvekla', name: 'Cvekla', priceRsdPerPerson: 150 },
      { id: 'zeleni-mix', name: 'Zeleni mix', priceRsdPerPerson: 190 },
    ],
  },
  {
    id: 'dresing',
    title: 'Dresing',
    options: [
      { id: 'jogurt', name: 'Jogurt dresing', priceRsdPerPerson: 80 },
      { id: 'limun-maslinovo', name: 'Limun i maslinovo ulje', priceRsdPerPerson: 90 },
      { id: 'senf-med', name: 'Senf i med', priceRsdPerPerson: 95 },
      { id: 'avokado', name: 'Avokado krem', priceRsdPerPerson: 140 },
    ],
  },
];

const DAILY_MENUS = {
  ponedeljak: [
    {
      clean: 'Piletina sa pirincem i boranijom, zelena salata',
      lean: 'Piletina sa brokolijem i sargarepom, zelena salata',
    },
    {
      clean: 'Curetina sa pirincem i mesanim povrcem, zelena salata',
      lean: 'Curetina sa mesanim povrcem, zelena salata',
    },
    {
      clean: 'Piletina sa pirincem i pireom od spanaca',
      lean: 'Piletina sa avokadom i brokolijem',
    },
    {
      clean: 'File minjon sa krompir pireom, vitaminska salata',
      lean: 'File minjon sa brokolijem i batatom, vitaminska salata',
    },
  ],
  utorak: [
    {
      clean: 'Junetina sa celerom, krompirom i sargarepom',
      lean: 'Junetina sa tikvicama i paprikom',
    },
    {
      clean: 'File minjon sa krompir pireom i zelenom salatom',
      lean: 'File minjon sa tikvicama, paprikom i sargarepom',
    },
    {
      clean: 'Junetina u paradajz sosu sa krompir pireom, vitaminska salata',
      lean: 'Junetina u paradajz sosu sa tikvicama i sargarepom, vitaminska salata',
    },
    {
      clean: 'Curetina pasta u kari sosu sa tikvicama i paprikom',
      lean: 'Curetina sa tikvicama i paprikom, zeleni mix',
    },
  ],
  sreda: [
    {
      clean: 'File minjon sa mesanim povrcem i prosom, zelena salata',
      lean: 'File minjon sa mesanim povrcem, zeleni mix',
    },
    {
      clean: 'Piletina pasta sa paradajz sosom i parmezanom',
      lean: 'Piletina sa spanacem i cveklom',
    },
    {
      clean: 'Curetina sa prosom, boranijom i sargarepom',
      lean: 'Curetina sa boranijom i sargarepom',
    },
    {
      clean: 'Piletina sa pirincem, boranijom, sargarepom i cveklom',
      lean: 'Piletina sa tikvicama i paprikom',
    },
  ],
  cetvrtak: [
    {
      clean: 'Curetina pasta u paradajz sosu sa tikvicama i paprikom',
      lean: 'Curetina sa pirincem, tikvicama i paprikom',
    },
    {
      clean: 'Junetina sa pirincem i boranijom, zelena salata',
      lean: 'Junetina sa boranijom i sargarepom, zelena salata',
    },
    {
      clean: 'File minjon sa pekarskim krompirom, zelena salata',
      lean: 'File minjon sa tikvicama i paprikom, zelena salata',
    },
    {
      clean: 'Junetina sa celerom, sargarepom i krompirom',
      lean: 'Junetina sa celerom i sargarepom, vitaminska salata',
    },
  ],
  petak: [
    {
      clean: 'Losos sa krompirom i blitvom, zelena salata',
      lean: 'Losos sa blitvom i karfiolom, zelena salata',
    },
    {
      clean: 'Tuna sa batatom, kukuruzom, pasuljem i crvenim lukom',
      lean: 'Tuna sa brokolijem i karfiolom',
    },
    {
      clean: 'Pastrmka sa krompirom i blitvom',
      lean: 'Pastrmka sa blitvom i vitaminskom salatom',
    },
    {
      clean: 'Skarpina sa prosom i mesanim povrcem',
      lean: 'Skarpina sa mesanim povrcem, zelena salata',
    },
  ],
};

const DAY_LABELS = {
  ponedeljak: 'Ponedeljak',
  utorak: 'Utorak',
  sreda: 'Sreda',
  cetvrtak: 'Cetvrtak',
  petak: 'Petak',
};

const DAY_ID_BY_INDEX = {
  1: 'ponedeljak',
  2: 'utorak',
  3: 'sreda',
  4: 'cetvrtak',
  5: 'petak',
};

const MAX_CUSTOM_MEALS = 10;

function formatRsd(value) {
  return `${value.toLocaleString('sr-RS')} RSD`;
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateSr(date) {
  return new Intl.DateTimeFormat('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function isWorkday(date) {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

function buildSubscriptionDays(daysCount) {
  const days = [];
  let cursor = new Date();

  while (days.length < daysCount) {
    if (isWorkday(cursor)) {
      const serviceDay = DAY_ID_BY_INDEX[cursor.getDay()];
      days.push({
        id: toDateInputValue(cursor),
        date: toDateInputValue(cursor),
        formattedDate: formatDateSr(cursor),
        serviceDay,
        serviceDayLabel: DAY_LABELS[serviceDay],
      });
    }

    cursor = addDays(cursor, 1);
  }

  return days;
}

export default function OrderPage() {
  return (
    <Suspense fallback={<OrderLoading />}>
      <OrderContent />
    </Suspense>
  );
}

function OrderLoading() {
  return (
    <main className={styles.orderPage}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>Porucivanje</span>
          <h1>Ucitavanje porudzbine</h1>
          <p>Pripremamo izbor obroka.</p>
        </div>
      </section>
    </main>
  );
}

function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeSwipe = useRef(null);
  const subscriptionSummaryRef = useRef(null);
  const customSummaryRef = useRef(null);
  const [mode, setMode] = useState(
    searchParams.get('tip') === 'personalizovani' ? 'custom' : 'daily'
  );
  const [pendingChoice, setPendingChoice] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [subscriptionDays, setSubscriptionDays] = useState(5);
  const [subscriptionChoices, setSubscriptionChoices] = useState({});
  const [editingDayId, setEditingDayId] = useState(null);
  const [customMeals, setCustomMeals] = useState([{ id: 1, selected: new Set() }]);
  const [notes, setNotes] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);

  const subscriptionSchedule = useMemo(
    () => buildSubscriptionDays(subscriptionDays),
    [subscriptionDays]
  );

  const subscriptionPlan = useMemo(() => {
    return subscriptionSchedule.map((day, dayIndex) => {
      const selected = subscriptionChoices[day.id] || {
        mealIndex: dayIndex % 4,
        variant: 'clean',
      };
      const mealIndex = Number.isInteger(selected.mealIndex) ? selected.mealIndex : 0;
      const meal = DAILY_MENUS[day.serviceDay][mealIndex] || DAILY_MENUS[day.serviceDay][0];
      const variant = selected.variant === 'lean' ? 'lean' : 'clean';
      const variantLabel = variant === 'clean' ? 'Clean' : 'Lean';

      return {
        ...day,
        mealIndex,
        mealNumber: mealIndex + 1,
        variant,
        variantLabel,
        description: meal[variant],
        priceRsd: VARIANT_PRICES_RSD[variant],
      };
    });
  }, [subscriptionChoices, subscriptionSchedule]);

  const subscriptionTotal = subscriptionPlan.reduce((sum, day) => sum + day.priceRsd, 0);

  const customMealSummaries = useMemo(() => {
    return customMeals.map((meal, mealIndex) => {
      const selectedDishes = CUSTOM_SECTIONS.flatMap((section) =>
        section.options
          .filter((option) => meal.selected.has(option.id))
          .map((option) => ({
            ...option,
            category: section.title,
            mealId: meal.id,
            mealLabel: `Obrok ${mealIndex + 1}`,
          }))
      );
      const totalRsd = selectedDishes.reduce((sum, option) => sum + option.priceRsdPerPerson, 0);

      return {
        ...meal,
        label: `Obrok ${mealIndex + 1}`,
        selectedDishes,
        totalRsd,
      };
    });
  }, [customMeals]);

  const selectedCustomDishes = customMealSummaries.flatMap((meal) => meal.selectedDishes);
  const customTotal = customMealSummaries.reduce((sum, meal) => sum + meal.totalRsd, 0);

  const saveDraftAndContinue = (order) => {
    sessionStorage.setItem('pendingOrderDraft', JSON.stringify(order));
    router.push('/placanje?draft=1');
  };

  useEffect(() => {
    const target = mode === 'daily' ? subscriptionSummaryRef.current : customSummaryRef.current;

    if (!target) {
      setShowScrollButton(false);
      return undefined;
    }

    const mediaQuery = window.matchMedia('(max-width: 1024px)');

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowScrollButton(mediaQuery.matches && !entry.isIntersecting);
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(target);

    const handleMediaChange = () => {
      const rect = target.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      setShowScrollButton(mediaQuery.matches && !isVisible);
    };

    handleMediaChange();
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [mode]);

  const scrollToOrderSummary = () => {
    const target = mode === 'daily' ? subscriptionSummaryRef.current : customSummaryRef.current;

    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  const handleSubscriptionChoice = (dayId, mealIndex, variant) => {
    setSubscriptionChoices((current) => ({
      ...current,
      [dayId]: {
        mealIndex,
        variant,
      },
    }));
    setEditingDayId(null);
  };

  const handleResetSubscriptionChanges = () => {
    setSubscriptionChoices({});
    setEditingDayId(null);
  };

  const handleSubscriptionOrder = (event) => {
    event.preventDefault();
    setPendingChoice('subscription');
    setErrorMessage('');

    try {
      const now = new Date().toISOString();
      const order = {
        id: crypto.randomUUID(),
        status: 'draft',
        createdAt: now,
        updatedAt: now,
        type: 'subscription',
        eventType: `Pretplata ${subscriptionDays} radnih dana`,
        guestCount: 1,
        subscription: {
          days: subscriptionDays,
          workdaysOnly: true,
          items: subscriptionPlan,
        },
        selectedDishes: subscriptionPlan.map((day) => ({
          id: `${day.date}-obrok-${day.mealNumber}-${day.variant}`,
          name: `${day.formattedDate} - Obrok ${day.mealNumber} ${day.variantLabel}`,
          category: day.serviceDayLabel,
          date: day.date,
          formattedDate: day.formattedDate,
          serviceDay: day.serviceDayLabel,
          variant: day.variantLabel,
          mealNumber: day.mealNumber,
          description: day.description,
          priceRsdPerPerson: day.priceRsd,
        })),
        priceRsdPerPerson: subscriptionTotal,
        totalRsd: subscriptionTotal,
      };

      saveDraftAndContinue(order);
    } catch (error) {
      setErrorMessage(error.message || 'Pretplata nije pripremljena.');
      setPendingChoice(null);
    }
  };

  const handleCustomToggle = (mealId, optionId) => {
    setCustomMeals((current) =>
      current.map((meal) => {
        if (meal.id !== mealId) {
          return meal;
        }

        const selected = new Set(meal.selected);
        if (selected.has(optionId)) {
          selected.delete(optionId);
        } else {
          selected.add(optionId);
        }

        return { ...meal, selected };
      })
    );
  };

  const handleAddCustomMeal = () => {
    setCustomMeals((current) => {
      if (current.length >= MAX_CUSTOM_MEALS) {
        return current;
      }

      const nextId = Math.max(...current.map((meal) => meal.id)) + 1;
      return [...current, { id: nextId, selected: new Set() }];
    });
  };

  const handleRemoveCustomMeal = (mealId) => {
    setCustomMeals((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((meal) => meal.id !== mealId);
    });
  };

  const handleResetCustomMeal = (mealId) => {
    setCustomMeals((current) =>
      current.map((meal) => {
        if (meal.id !== mealId) {
          return meal;
        }

        return { ...meal, selected: new Set() };
      })
    );
  };

  const handleModeSwipeStart = (event) => {
    if (event.target.closest('button, input, textarea, select')) {
      modeSwipe.current = null;
      return;
    }

    const touch = event.touches[0];
    modeSwipe.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleModeSwipeEnd = (event) => {
    if (!modeSwipe.current) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - modeSwipe.current.x;
    const deltaY = touch.clientY - modeSwipe.current.y;

    if (Math.abs(deltaX) > 64 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
      setMode(deltaX < 0 ? 'custom' : 'daily');
    }

    modeSwipe.current = null;
  };

  const handleCustomOrder = (event) => {
    event.preventDefault();

    if (selectedCustomDishes.length === 0) {
      setErrorMessage('Odaberi bar jednu opciju za personalizovani obrok.');
      return;
    }

    setPendingChoice('custom');
    setErrorMessage('');

    try {
      const now = new Date().toISOString();
      const order = {
        id: crypto.randomUUID(),
        status: 'draft',
        createdAt: now,
        updatedAt: now,
        type: 'custom',
        eventType: 'Personalizovani obrok',
        guestCount: customMeals.length,
        selectedDishes: selectedCustomDishes,
        notes,
        priceRsdPerPerson: customTotal,
        totalRsd: customTotal,
      };

      saveDraftAndContinue(order);
    } catch (error) {
      setErrorMessage(error.message || 'Narudzbina nije pripremljena.');
      setPendingChoice(null);
    }
  };

  return (
    <main
      className={styles.orderPage}
      onTouchStart={handleModeSwipeStart}
      onTouchEnd={handleModeSwipeEnd}
      onTouchCancel={() => {
        modeSwipe.current = null;
      }}
    >
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>Porucivanje</span>
          <h1>{mode === 'daily' ? 'Pretplata na obroke' : 'Personalizovani obrok'}</h1>
          <p>
            Izaberi plan za radne dane i prilagodi svaki datum, ili slozi svoj tanjir kroz bazu,
            prilog, glavno jelo, salate i dresing.
          </p>
        </div>
      </section>

      <div className={styles.modeBar}>
        <div className={styles.modeSwitch} role="tablist" aria-label="Tip narudzbine">
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'daily' ? styles.activeMode : ''}`}
            onClick={() => setMode('daily')}
          >
            Pretplata
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'custom' ? styles.activeMode : ''}`}
            onClick={() => setMode('custom')}
          >
            Personalizovano
          </button>
          <span
            className={styles.modeIndicator}
            style={{ transform: `translateX(${mode === 'daily' ? 0 : 100}%)` }}
          />
        </div>
      </div>

      {mode === 'daily' ? (
        <section
          key="daily"
          className={`${styles.menuSection} ${styles.panelEnter} ${styles.fromLeft}`}
          aria-labelledby="daily-menu-title"
        >
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>Samo radni dani</span>
            <h2 id="daily-menu-title">Plan obroka za naredne dane</h2>
          </div>

          <form className={styles.subscriptionForm} onSubmit={handleSubscriptionOrder}>
            <div className={styles.planPicker} role="radiogroup" aria-label="Duzina pretplate">
              {SUBSCRIPTION_OPTIONS.map((option) => (
                <button
                  key={option.days}
                  type="button"
                  className={`${styles.planButton} ${
                    subscriptionDays === option.days ? styles.activePlan : ''
                  }`}
                  onClick={() => setSubscriptionDays(option.days)}
                >
                  <span>{option.label}</span>
                  <strong>{formatRsd(option.days * VARIANT_PRICES_RSD.clean)}</strong>
                </button>
              ))}
            </div>

            <div className={styles.planActions}>
              <button
                type="button"
                className={styles.resetPlanButton}
                onClick={handleResetSubscriptionChanges}
                disabled={Object.keys(subscriptionChoices).length === 0}
              >
                Resetuj izmene
              </button>
            </div>

            <div className={styles.subscriptionLayout}>
              <div className={styles.calendarList}>
                {subscriptionPlan.map((day) => (
                  <article key={day.id} className={styles.calendarCard}>
                    <div className={styles.calendarDate}>
                      <span>{day.serviceDayLabel}</span>
                      <strong>{day.formattedDate}</strong>
                    </div>

                    <div className={styles.calendarMeals}>
                      <div className={styles.selectedMealCard}>
                        <div className={styles.selectedMealTop}>
                          <div>
                            <span>
                              Obrok {day.mealNumber} / {day.variantLabel}
                            </span>
                            <strong>{day.description}</strong>
                          </div>
                          <em>{formatRsd(day.priceRsd)}</em>
                        </div>
                        <button
                          type="button"
                          className={styles.editMealButton}
                          onClick={() =>
                            setEditingDayId((current) => (current === day.id ? null : day.id))
                          }
                        >
                          {editingDayId === day.id ? 'Zatvori izbor' : 'Izmeni obrok'}
                        </button>
                      </div>

                      <div
                        className={`${styles.mealPickerPanel} ${
                          editingDayId === day.id ? styles.mealPickerOpen : ''
                        }`}
                        aria-hidden={editingDayId !== day.id}
                      >
                        {DAILY_MENUS[day.serviceDay].map((meal, index) => (
                          <section
                            key={`${day.id}-${index}`}
                            className={`${styles.dayMealOption} ${
                              day.mealIndex === index ? styles.selectedDayMeal : ''
                            }`}
                          >
                            <div className={styles.dayMealHeader}>
                              <FaUtensils />
                              <span>Obrok {index + 1}</span>
                            </div>

                            <div className={styles.dayVariants}>
                              <button
                                type="button"
                                className={`${styles.dayVariantButton} ${
                                  day.mealIndex === index && day.variant === 'clean'
                                    ? styles.selectedVariant
                                    : ''
                                }`}
                                onClick={() => handleSubscriptionChoice(day.id, index, 'clean')}
                                tabIndex={editingDayId === day.id ? 0 : -1}
                              >
                                <span>Clean</span>
                                <p>{meal.clean}</p>
                                <strong>{formatRsd(VARIANT_PRICES_RSD.clean)}</strong>
                              </button>

                              <button
                                type="button"
                                className={`${styles.dayVariantButton} ${
                                  day.mealIndex === index && day.variant === 'lean'
                                    ? styles.selectedVariant
                                    : ''
                                }`}
                                onClick={() => handleSubscriptionChoice(day.id, index, 'lean')}
                                tabIndex={editingDayId === day.id ? 0 : -1}
                              >
                                <span>Lean</span>
                                <p>{meal.lean}</p>
                                <strong>{formatRsd(VARIANT_PRICES_RSD.lean)}</strong>
                              </button>
                            </div>
                          </section>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <aside ref={subscriptionSummaryRef} className={styles.subscriptionSummary}>
                <span>Pregled pretplate</span>
                <h3>{subscriptionDays} radnih dana</h3>
                <div className={styles.summaryRows}>
                  <div>
                    <span>Prva isporuka</span>
                    <strong>{subscriptionPlan[0]?.formattedDate}</strong>
                  </div>
                  <div>
                    <span>Poslednja isporuka</span>
                    <strong>{subscriptionPlan.at(-1)?.formattedDate}</strong>
                  </div>
                  <div>
                    <span>Ukupno</span>
                    <strong>{formatRsd(subscriptionTotal)}</strong>
                  </div>
                </div>
                <button type="submit" disabled={pendingChoice === 'subscription'}>
                  {pendingChoice === 'subscription' ? 'Pripremamo placanje...' : 'Nastavi na placanje'}
                </button>
              </aside>
            </div>
          </form>
        </section>
      ) : (
        <section
          key="custom"
          className={`${styles.customSection} ${styles.panelEnter} ${styles.fromRight}`}
          aria-labelledby="custom-menu-title"
        >
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>Slozi po meri</span>
            <h2 id="custom-menu-title">Personalizovani obrok</h2>
          </div>

          <form className={styles.customForm} onSubmit={handleCustomOrder}>
            <div className={styles.customControls}>
              <label>
                Napomena
                <textarea
                  rows="3"
                  value={notes}
                  placeholder="Alergije, posebne zelje, bez luka..."
                  onChange={(event) => setNotes(event.target.value)}
                />
              </label>
            </div>

            <div className={styles.customMealList}>
              {customMealSummaries.map((meal) => (
                <section key={meal.id} className={styles.customMeal}>
                  <div className={styles.customMealHeader}>
                    <div>
                      <span>{meal.label}</span>
                      <strong>{formatRsd(meal.totalRsd)}</strong>
                    </div>
                    <div className={styles.customMealActions}>
                      <button
                        type="button"
                        className={styles.secondaryAction}
                        onClick={() => handleResetCustomMeal(meal.id)}
                        disabled={meal.selected.size === 0}
                      >
                        Ocisti
                      </button>
                      {customMeals.length > 1 && (
                        <button
                          type="button"
                          className={styles.dangerAction}
                          onClick={() => handleRemoveCustomMeal(meal.id)}
                        >
                          Ukloni
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={styles.customSections}>
                    {CUSTOM_SECTIONS.map((section) => (
                      <fieldset key={section.id} className={styles.customCard}>
                        <legend>{section.title}</legend>
                        <div className={styles.checkboxList}>
                          {section.options.map((option) => (
                            <label key={option.id} className={styles.checkboxOption}>
                              <input
                                type="checkbox"
                                checked={meal.selected.has(option.id)}
                                onChange={() => handleCustomToggle(meal.id, option.id)}
                              />
                              <span>{option.name}</span>
                              <strong>{formatRsd(option.priceRsdPerPerson)}</strong>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <button
              type="button"
              className={styles.addMealButton}
              onClick={handleAddCustomMeal}
              disabled={customMeals.length >= MAX_CUSTOM_MEALS}
            >
              {customMeals.length >= MAX_CUSTOM_MEALS
                ? 'Dodato je maksimalno 10 obroka'
                : 'Dodaj jos jedan obrok'}
            </button>

            <div ref={customSummaryRef} className={styles.customSummary}>
              <div>
                <span>Razlicitih obroka</span>
                <strong>{customMeals.length}</strong>
              </div>
              <div>
                <span>Ukupno</span>
                <strong>{formatRsd(customTotal)}</strong>
              </div>
              <button type="submit" disabled={pendingChoice === 'custom'}>
                {pendingChoice === 'custom' ? 'Pripremamo placanje...' : 'Nastavi na placanje'}
              </button>
            </div>
          </form>
        </section>
      )}

      {errorMessage && (
        <div className={styles.errorBox} role="alert">
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        className={`${styles.mobileScrollButton} ${
          showScrollButton ? styles.mobileScrollButtonVisible : ''
        }`}
        onClick={scrollToOrderSummary}
        aria-label="Idi do nastavka porudzbine"
        aria-hidden={!showScrollButton}
        tabIndex={showScrollButton ? 0 : -1}
      >
        <span>Nastavi</span>
        <FaArrowDown aria-hidden="true" />
      </button>
    </main>
  );
}
