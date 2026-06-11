'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { FaCheck, FaLeaf, FaUtensils } from 'react-icons/fa';

const VARIANT_PRICES_RSD = {
  clean: 750,
  lean: 850,
};

const CUSTOM_SECTIONS = [
  {
    id: 'baza',
    title: 'Baza',
    options: [
      { id: 'pirinac', name: 'Integralni pirinač', priceRsdPerPerson: 180 },
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
      { id: 'mesano-povrce', name: 'Mešano povrće', priceRsdPerPerson: 210 },
    ],
  },
  {
    id: 'glavno',
    title: 'Glavno jelo',
    options: [
      { id: 'piletina', name: 'Grilovana piletina', priceRsdPerPerson: 420 },
      { id: 'curetina', name: 'Ćuretina', priceRsdPerPerson: 480 },
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
      clean: 'Piletina sa pirinčem i boranijom, zelena salata',
      lean: 'Piletina sa brokolijem i šargarepom, zelena salata',
    },
    {
      clean: 'Ćuretina sa pirinčem i mešanim povrćem, zelena salata',
      lean: 'Ćuretina sa mešanim povrćem, zelena salata',
    },
    {
      clean: 'Piletina sa pirinčem i pireom od spanaća',
      lean: 'Piletina sa avokadom i brokolijem',
    },
    {
      clean: 'File minjon sa krompir pireom, vitaminska salata',
      lean: 'File minjon sa brokolijem i batatom, vitaminska salata',
    },
  ],
  utorak: [
    {
      clean: 'Junetina sa celerom, krompirom i šargarepom',
      lean: 'Junetina sa tikvicama i paprikom',
    },
    {
      clean: 'File minjon sa krompir pireom i zelenom salatom',
      lean: 'File minjon sa tikvicama, paprikom i šargarepom',
    },
    {
      clean: 'Junetina u paradajz sosu sa krompir pireom, vitaminska salata',
      lean: 'Junetina u paradajz sosu sa tikvicama i šargarepom, vitaminska salata',
    },
    {
      clean: 'Ćuretina pasta u kari sosu sa tikvicama i paprikom',
      lean: 'Ćuretina sa tikvicama i paprikom, zeleni mix',
    },
  ],
  sreda: [
    {
      clean: 'File minjon sa mešanim povrćem i prosom, zelena salata',
      lean: 'File minjon sa mešanim povrćem, zeleni mix',
    },
    {
      clean: 'Piletina pasta sa paradajz sosom i parmezanom',
      lean: 'Piletina sa spanaćem i cveklom',
    },
    {
      clean: 'Ćuretina sa prosom, boranijom i šargarepom',
      lean: 'Ćuretina sa boranijom i šargarepom',
    },
    {
      clean: 'Piletina sa pirinčem, boranijom, šargarepom i cveklom',
      lean: 'Piletina sa tikvicama i paprikom',
    },
  ],
  cetvrtak: [
    {
      clean: 'Ćuretina pasta u paradajz sosu sa tikvicama i paprikom',
      lean: 'Ćuretina sa pirinčem, tikvicama i paprikom',
    },
    {
      clean: 'Junetina sa pirinčem i boranijom, zelena salata',
      lean: 'Junetina sa boranijom i šargarepom, zelena salata',
    },
    {
      clean: 'File minjon sa pekarskim krompirom, zelena salata',
      lean: 'File minjon sa tikvicama i paprikom, zelena salata',
    },
    {
      clean: 'Junetina sa celerom, šargarepom i krompirom',
      lean: 'Junetina sa celerom i šargarepom, vitaminska salata',
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
      clean: 'Škarpina sa prosom i mešanim povrćem',
      lean: 'Škarpina sa mešanim povrćem, zelena salata',
    },
  ],
};

const DAY_LABELS = {
  ponedeljak: 'Ponedeljak',
  utorak: 'Utorak',
  sreda: 'Sreda',
  cetvrtak: 'Četvrtak',
  petak: 'Petak',
};

const NEXT_SERVICE_DAY_BY_INDEX = {
  0: 'ponedeljak',
  1: 'utorak',
  2: 'sreda',
  3: 'cetvrtak',
  4: 'petak',
  5: 'ponedeljak',
  6: 'ponedeljak',
};

const CARD_IMAGES = ['/01card.webp', '/02card.webp', '/03card.webp', '/04card.webp'];
const MAX_CUSTOM_MEALS = 10;

function getNextServiceDay(date = new Date()) {
  return NEXT_SERVICE_DAY_BY_INDEX[date.getDay()];
}

function formatRsd(value) {
  return `${value.toLocaleString('sr-RS')} RSD`;
}

export default function OrderPage() {
  const router = useRouter();
  const modeSwipe = useRef(null);
  const [mode, setMode] = useState('daily');
  const [pendingChoice, setPendingChoice] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [customMeals, setCustomMeals] = useState([{ id: 1, selected: new Set() }]);
  const [notes, setNotes] = useState('');

  const serviceDay = useMemo(() => getNextServiceDay(), []);
  const meals = DAILY_MENUS[serviceDay];
  const serviceDayLabel = DAY_LABELS[serviceDay];

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

  const handleVariantOrder = async (meal, index, variant) => {
    const pendingId = `${index}-${variant}`;
    setPendingChoice(pendingId);
    setErrorMessage('');

    try {
      const variantLabel = variant === 'clean' ? 'Clean' : 'Lean';
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'menu',
          guestCount: 1,
          menu: {
            id: `${serviceDay}-obrok-${index + 1}-${variant}`,
            name: `Obrok ${index + 1} - ${variantLabel}`,
            description: `Dnevni meni za ${serviceDayLabel}`,
            items: [meal[variant]],
            variant: variantLabel,
            serviceDay: serviceDayLabel,
            priceRsdPerPerson: VARIANT_PRICES_RSD[variant],
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Narudžbina nije kreirana.');
      }

      router.push(`/placanje?orderId=${data.order.id}`);
    } catch (error) {
      setErrorMessage(error.message);
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

  const handleCustomOrder = async (event) => {
    event.preventDefault();

    if (selectedCustomDishes.length === 0) {
      setErrorMessage('Odaberi bar jednu opciju za personalizovani obrok.');
      return;
    }

    setPendingChoice('custom');
    setErrorMessage('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'custom',
          eventType: 'Personalizovani obrok',
          guestCount: customMeals.length,
          selectedDishes: selectedCustomDishes,
          notes,
          priceRsdPerPerson: customTotal,
          totalRsd: customTotal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Narudžbina nije kreirana.');
      }

      router.push(`/placanje?orderId=${data.order.id}`);
    } catch (error) {
      setErrorMessage(error.message);
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
          <span className={styles.eyebrow}>Poručivanje</span>
          <h1>{mode === 'daily' ? `Obroci za ${serviceDayLabel}` : 'Personalizovani obrok'}</h1>
          <p>
            Izaberi dnevni Clean ili Lean obrok, ili složi svoj tanjir kroz bazu, prilog,
            glavno jelo, salate i dresing.
          </p>
        </div>
      </section>

      <div className={styles.modeBar}>
        <div className={styles.modeSwitch} role="tablist" aria-label="Tip narudžbine">
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'daily' ? styles.activeMode : ''}`}
            onClick={() => setMode('daily')}
          >
            Pripremljeni
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
          className={`${styles.menuSection} ${styles.panelEnter} ${
            mode === 'daily' ? styles.fromLeft : styles.fromRight
          }`}
          aria-labelledby="daily-menu-title"
        >
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>4 sveže opcije</span>
            <h2 id="daily-menu-title">Današnji izbor za poručivanje</h2>
          </div>

          <div className={styles.menusGrid}>
            {meals.map((meal, index) => (
              <article key={`${serviceDay}-${index}`} className={styles.menuCard}>
                <div
                  className={styles.menuImage}
                  style={{ backgroundImage: `url(${CARD_IMAGES[index]})` }}
                >
                  <span>Obrok {index + 1}</span>
                </div>

                <div className={styles.menuContent}>
                  <div className={styles.cardTopline}>
                    <FaUtensils />
                    <span>{serviceDayLabel}</span>
                  </div>

                  <h3>Obrok {index + 1}</h3>

                  <div className={styles.variantList}>
                    <div className={styles.variant}>
                      <div className={styles.variantTitle}>
                        <FaCheck />
                        <span>Clean</span>
                      </div>
                      <p>{meal.clean}</p>
                    </div>

                    <div className={styles.variant}>
                      <div className={styles.variantTitle}>
                        <FaLeaf />
                        <span>Lean</span>
                      </div>
                      <p>{meal.lean}</p>
                    </div>
                  </div>

                  <div className={styles.variantActions}>
                    <button
                      type="button"
                      className={styles.variantButton}
                      disabled={Boolean(pendingChoice)}
                      onClick={() => handleVariantOrder(meal, index, 'clean')}
                    >
                      <span>Clean</span>
                      <strong>{formatRsd(VARIANT_PRICES_RSD.clean)}</strong>
                    </button>
                    <button
                      type="button"
                      className={styles.variantButton}
                      disabled={Boolean(pendingChoice)}
                      onClick={() => handleVariantOrder(meal, index, 'lean')}
                    >
                      <span>Lean</span>
                      <strong>{formatRsd(VARIANT_PRICES_RSD.lean)}</strong>
                    </button>
                  </div>

                  {pendingChoice === `${index}-clean` || pendingChoice === `${index}-lean` ? (
                    <p className={styles.loadingText}>Pripremamo plaćanje...</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section
          key="custom"
          className={`${styles.customSection} ${styles.panelEnter} ${styles.fromRight}`}
          aria-labelledby="custom-menu-title"
        >
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>Složi po meri</span>
            <h2 id="custom-menu-title">Personalizovani obrok</h2>
          </div>

          <form className={styles.customForm} onSubmit={handleCustomOrder}>
            <div className={styles.customControls}>
              <label>
                Napomena
                <textarea
                  rows="3"
                  value={notes}
                  placeholder="Alergije, posebne želje, bez luka..."
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
                        Očisti
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
                : 'Dodaj još jedan obrok'}
            </button>

            <div className={styles.customSummary}>
              <div>
                <span>Različitih obroka</span>
                <strong>{customMeals.length}</strong>
              </div>
              <div>
                <span>Ukupno</span>
                <strong>{formatRsd(customTotal)}</strong>
              </div>
              <button type="submit" disabled={pendingChoice === 'custom'}>
                {pendingChoice === 'custom' ? 'Pripremamo plaćanje...' : 'Nastavi na plaćanje'}
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
    </main>
  );
}
