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

const SUBSCRIPTION_EXTRAS = [
  {
    id: 'dnevni-kolac',
    label: 'Dnevni kolac',
    priceRsd: 350,
    rotation: {
      ponedeljak: 'Protein kuglice',
      utorak: 'Mini cheesecake',
      sreda: 'Cia puding',
      cetvrtak: 'Kolac sa jabukom',
      petak: 'Cokoladni mus',
    },
  },
  {
    id: 'dnevni-potaz',
    label: 'Dnevni potaz',
    priceRsd: 340,
    rotation: {
      ponedeljak: 'Potaz od bundeve',
      utorak: 'Potaz od brokolija',
      sreda: 'Potaz od pecuraka',
      cetvrtak: 'Potaz od karfiola',
      petak: 'Potaz od paradajza',
    },
  },
  {
    id: 'dnevni-smuti',
    label: 'Dnevni smuti',
    priceRsd: 430,
    rotation: {
      ponedeljak: 'Zeleni smuti',
      utorak: 'Smuti sa bobicama',
      sreda: 'Protein smuti',
      cetvrtak: 'Mango smuti',
      petak: 'Kakao-banana smuti',
    },
  },
];

const CUSTOM_ADD_ON_CATEGORIES = [
  {
    id: 'kolaci',
    title: 'Kolaci',
    products: [
      { id: 'kolac-protein-kuglice', name: 'Protein kuglice', priceRsd: 290 },
      { id: 'kolac-cia-puding', name: 'Cia puding', priceRsd: 360 },
      { id: 'kolac-cheesecake', name: 'Mini cheesecake', priceRsd: 420 },
    ],
  },
  {
    id: 'potazi',
    title: 'Potazi',
    products: [
      { id: 'potaz-bundeva', name: 'Potaz od bundeve', priceRsd: 320 },
      { id: 'potaz-brokoli', name: 'Potaz od brokolija', priceRsd: 340 },
      { id: 'potaz-pecurke', name: 'Potaz od pecuraka', priceRsd: 360 },
    ],
  },
  {
    id: 'smutiji',
    title: 'Smutiji',
    products: [
      { id: 'smuti-zeleni', name: 'Zeleni smuti', priceRsd: 390 },
      { id: 'smuti-bobice', name: 'Smuti sa bobicama', priceRsd: 420 },
      { id: 'smuti-protein', name: 'Protein smuti', priceRsd: 480 },
    ],
  },
];

const CUSTOM_SECTIONS = [
  {
    id: 'baza',
    title: 'Baza',
    maxSelections: 1,
    options: [
      { id: 'pirinac-dugo-zrno', name: 'Pirinač dugo zrno', priceRsdPerPerson: 0 },
      { id: 'integralni-pirinac', name: 'Integralni pirinač', priceRsdPerPerson: 0 },
      { id: 'kinoa', name: 'Kinoa', priceRsdPerPerson: 0 },
      { id: 'bulgur', name: 'Bulgur', priceRsdPerPerson: 0 },
      { id: 'heljda', name: 'Heljda', priceRsdPerPerson: 0 },
    ],
  },
  {
    id: 'prilog',
    title: 'Prilog',
    maxSelections: 2,
    options: [
      { id: 'batat-zacini', name: 'Batat sa začinima', priceRsdPerPerson: 0 },
      { id: 'sargarepa-mirodjija', name: 'Šargarepa sa mirođijom', priceRsdPerPerson: 0 },
      { id: 'brokoli', name: 'Brokoli', priceRsdPerPerson: 0 },
      { id: 'mesano-povrce', name: 'Mešano povrće', priceRsdPerPerson: 0 },
      { id: 'krompir', name: 'Krompir', priceRsdPerPerson: 0 },
      { id: 'blitva', name: 'Blitva', priceRsdPerPerson: 0 },
      { id: 'boranija', name: 'Boranija', priceRsdPerPerson: 0 },
    ],
  },
  {
    id: 'glavno',
    title: 'Glavno jelo',
    maxSelections: 1,
    options: [
      { id: 'cureci-file', name: 'Ćureći file sa začinima', priceRsdPerPerson: 950 },
      { id: 'junetina-saft', name: 'Junetina u saftu', priceRsdPerPerson: 950 },
      { id: 'losos-file', name: 'Losos file', priceRsdPerPerson: 950 },
      { id: 'pileci-file', name: 'Pileći file sa začinima', priceRsdPerPerson: 750 },
      { id: 'butkica', name: 'Butkica', priceRsdPerPerson: 750 },
      { id: 'skarpina', name: 'Škarpina', priceRsdPerPerson: 750 },
      { id: 'varivo-socivo', name: 'Varivo od crvenog sočiva', priceRsdPerPerson: 650 },
      { id: 'ragu-leblebije', name: 'Ragu sa leblebijama', priceRsdPerPerson: 650 },
      { id: 'tofu', name: 'Grilovani tofu sir', priceRsdPerPerson: 650 },
    ],
  },
  {
    id: 'salate',
    title: 'Salata',
    maxSelections: 2,
    options: [
      { id: 'zeleni-mix', name: 'Zeleni mix', priceRsdPerPerson: 0 },
      { id: 'vitaminska', name: 'Vitaminska', priceRsdPerPerson: 0 },
      { id: 'grcka', name: 'Grčka', priceRsdPerPerson: 0 },
      { id: 'crveni-luk', name: 'Crveni luk', priceRsdPerPerson: 0 },
    ],
  },
  {
    id: 'dresing',
    title: 'Dresing',
    maxSelections: 1,
    options: [
      { id: 'in-dresing', name: 'IN dresing (bosiljak, peršun, ulje)', priceRsdPerPerson: 0 },
      { id: 'cezar-dresing', name: 'Cezar dresing (majonez, jogurt, senf, limun, začin)', priceRsdPerPerson: 0 },
      { id: 'tzatziki', name: 'Tzatziki (jogurt, krastavac, mirođija, beli luk)', priceRsdPerPerson: 0 },
      { id: 'ss-dresing', name: 'S&S dresing (senf, med, balsamico, začini)', priceRsdPerPerson: 0 },
      { id: 'monte-dresing', name: 'Monte dresing (grčki jogurt, ren, začini)', priceRsdPerPerson: 0 },
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

const INITIAL_UNIQUE_FORM = {
  ime: '',
  email: '',
  br_tel: '',
  mesto: '',
  opis: '',
};

function formatRsd(value) {
  return `${value.toLocaleString('sr-RS')} RSD`;
}

function normalizeQuantity(value) {
  const quantity = Number(value);
  return Number.isFinite(quantity) ? Math.max(0, Math.min(999, Math.floor(quantity))) : 0;
}

function createDraftId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
  let cursor = addDays(new Date(), 1);

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
  const [mode, setMode] = useState(() => {
    const requestedType = searchParams.get('tip');

    if (requestedType === 'personalizovani') {
      return 'custom';
    }

    if (requestedType === 'unique') {
      return 'unique';
    }

    return 'daily';
  });
  const [pendingChoice, setPendingChoice] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [subscriptionDays, setSubscriptionDays] = useState(5);
  const [subscriptionVariant, setSubscriptionVariant] = useState('clean');
  const [subscriptionChoices, setSubscriptionChoices] = useState({});
  const [subscriptionExtraIds, setSubscriptionExtraIds] = useState([]);
  const [editingDayId, setEditingDayId] = useState(null);
  const [customMeals, setCustomMeals] = useState([{ id: 1, selected: new Set() }]);
  const [customAddOns, setCustomAddOns] = useState([]);
  const [notes, setNotes] = useState('');
  const [uniqueForm, setUniqueForm] = useState(INITIAL_UNIQUE_FORM);
  const [uniqueStatus, setUniqueStatus] = useState({ type: '', message: '' });
  const [uniqueSubmitting, setUniqueSubmitting] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const subscriptionSchedule = useMemo(
    () => buildSubscriptionDays(subscriptionDays),
    [subscriptionDays]
  );

  const subscriptionPlan = useMemo(() => {
    return subscriptionSchedule.map((day, dayIndex) => {
      const selected = subscriptionChoices[day.id] || {
        mealIndex: dayIndex % 4,
      };
      const mealIndex = Number.isInteger(selected.mealIndex) ? selected.mealIndex : 0;
      const meal = DAILY_MENUS[day.serviceDay][mealIndex] || DAILY_MENUS[day.serviceDay][0];
      const variant = subscriptionVariant;
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
  }, [subscriptionChoices, subscriptionSchedule, subscriptionVariant]);

  const selectedSubscriptionExtras = SUBSCRIPTION_EXTRAS.filter((extra) =>
    subscriptionExtraIds.includes(extra.id)
  );
  const subscriptionExtrasTotal = selectedSubscriptionExtras.reduce(
    (sum, extra) => sum + extra.priceRsd * subscriptionDays,
    0
  );
  const subscriptionTotal =
    subscriptionPlan.reduce((sum, day) => sum + day.priceRsd, 0) + subscriptionExtrasTotal;

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
  const customAddOnTotal = customAddOns.reduce(
    (sum, item) => sum + item.priceRsd * item.quantity,
    0
  );
  const customTotal =
    customMealSummaries.reduce((sum, meal) => sum + meal.totalRsd, 0) + customAddOnTotal;

  const saveDraftAndContinue = (order) => {
    sessionStorage.setItem('pendingOrderDraft', JSON.stringify(order));
    router.push('/placanje?draft=1');
  };

  useEffect(() => {
    const target =
      mode === 'daily'
        ? subscriptionSummaryRef.current
        : mode === 'custom'
          ? customSummaryRef.current
          : null;

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
    const target =
      mode === 'daily'
        ? subscriptionSummaryRef.current
        : mode === 'custom'
          ? customSummaryRef.current
          : null;

    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  const handleSubscriptionChoice = (dayId, mealIndex) => {
    setSubscriptionChoices((current) => ({
      ...current,
      [dayId]: {
        mealIndex,
      },
    }));
    setEditingDayId(null);
  };

  const handleSubscriptionExtraToggle = (extraId) => {
    setSubscriptionExtraIds((current) =>
      current.includes(extraId)
        ? current.filter((id) => id !== extraId)
        : [...current, extraId]
    );
  };

  const updateCustomAddOnQuantity = (category, product, value, absolute = false) => {
    setCustomAddOns((current) => {
      const existing = current.find((item) => item.id === product.id);
      const nextQuantity = normalizeQuantity(
        absolute ? value : (existing?.quantity || 0) + value
      );

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
        { ...product, quantity: nextQuantity, category: category.title, source: 'dopuna' },
      ];
    });
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
        id: createDraftId(),
        status: 'draft',
        createdAt: now,
        updatedAt: now,
        type: 'subscription',
        eventType: `Pretplata ${subscriptionDays} radnih dana`,
        guestCount: 1,
        subscription: {
          days: subscriptionDays,
          workdaysOnly: true,
          variant: subscriptionVariant,
          addOns: selectedSubscriptionExtras.map((extra) => ({
            id: extra.id,
            name: extra.label,
            priceRsdPerDay: extra.priceRsd,
            rotation: extra.rotation,
          })),
          items: subscriptionPlan,
        },
        selectedDishes: subscriptionPlan.flatMap((day) => [
          {
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
          },
          ...selectedSubscriptionExtras.map((extra) => ({
            id: `${day.date}-${extra.id}`,
            name: extra.rotation[day.serviceDay],
            category: extra.label,
            date: day.date,
            formattedDate: day.formattedDate,
            serviceDay: day.serviceDayLabel,
            variant: null,
            mealNumber: null,
            description: extra.rotation[day.serviceDay],
            priceRsdPerPerson: extra.priceRsd,
            source: 'dopuna',
          })),
        ]),
        priceRsdPerPerson: subscriptionTotal,
        totalRsd: subscriptionTotal,
      };

      saveDraftAndContinue(order);
    } catch (error) {
      setErrorMessage(error.message || 'Pretplata nije pripremljena.');
      setPendingChoice(null);
    }
  };

  const handleCustomToggle = (mealId, sectionId, optionId) => {
    const section = CUSTOM_SECTIONS.find((item) => item.id === sectionId);

    if (!section) {
      return;
    }

    setCustomMeals((current) =>
      current.map((meal) => {
        if (meal.id !== mealId) {
          return meal;
        }

        const selected = new Set(meal.selected);
        if (selected.has(optionId)) {
          selected.delete(optionId);
        } else {
          const selectedInSection = section.options.filter((option) =>
            selected.has(option.id)
          ).length;

          if (selectedInSection >= section.maxSelections) {
            return meal;
          }

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
      const modes = ['daily', 'custom', 'unique'];
      const currentIndex = modes.indexOf(mode);
      const nextIndex = Math.max(
        0,
        Math.min(modes.length - 1, currentIndex + (deltaX < 0 ? 1 : -1))
      );
      setMode(modes[nextIndex]);
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
        id: createDraftId(),
        status: 'draft',
        createdAt: now,
        updatedAt: now,
        type: 'custom',
        eventType: 'Personalizovani obrok',
        guestCount: customMeals.length,
        selectedDishes: [
          ...selectedCustomDishes,
          ...customAddOns.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            priceRsdPerPerson: item.priceRsd,
            totalPriceRsd: item.priceRsd * item.quantity,
            mealId: 'dopuna',
            mealLabel: 'Dopuna',
            source: 'dopuna',
          })),
        ],
        addOns: customAddOns,
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

  const handleUniqueChange = (event) => {
    const { name, value } = event.target;
    setUniqueForm((current) => ({ ...current, [name]: value }));
  };

  const handleUniqueSubmit = async (event) => {
    event.preventDefault();
    setUniqueSubmitting(true);
    setUniqueStatus({ type: '', message: '' });

    try {
      const now = new Date();
      const technicalDate = toDateInputValue(now);

      const response = await fetch('/api/narudzbine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ime: uniqueForm.ime.trim(),
          email: uniqueForm.email.trim() || null,
          br_tel: uniqueForm.br_tel.trim() || null,
          datum: technicalDate,
          vreme: '00:00',
          mesto: uniqueForm.mesto.trim() || null,
          cena: 0,
          porudzbina: {
            schemaVersion: 1,
            source: 'unique-fuel',
            type: 'unique_fuel_inquiry',
            title: 'Unique Fuel upit',
            status: 'new',
            items: [
              {
                id: `unique-fuel-${Date.now()}`,
                name: 'Plan ishrane po meri',
                category: 'Unique Fuel',
                variant: null,
                quantity: 1,
                unitPriceRsd: 0,
                totalPriceRsd: 0,
                meta: { description: uniqueForm.opis.trim() },
              },
            ],
            totals: {
              subtotalRsd: 0,
              deliveryRsd: 0,
              discountRsd: 0,
              totalRsd: 0,
            },
            customerNote: uniqueForm.opis.trim(),
            internalNote: '',
            payment: {
              status: 'not_started',
              provider: null,
              providerPaymentId: null,
              amountRsd: 0,
              currency: 'RSD',
              paidAt: null,
            },
            fulfillment: {
              method: 'consultation',
              status: 'pending',
              confirmedAt: null,
              completedAt: null,
            },
          },
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upit nije poslat.');
      }

      setUniqueStatus({ type: 'success', message: 'Unique Fuel upit je uspesno poslat.' });
      setUniqueForm(INITIAL_UNIQUE_FORM);
    } catch (error) {
      setUniqueStatus({ type: 'error', message: error.message });
    } finally {
      setUniqueSubmitting(false);
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
          <h1>
            {mode === 'daily'
              ? 'Pretplata na obroke'
              : mode === 'custom'
                ? 'Personalizovani obrok'
                : 'Unique Fuel'}
          </h1>
          {mode === 'daily' ? (
            <div className={styles.heroIntro}>
              <p>Svaki obrok je pažljivo pripremljen od namirnica iz domaćeg uzgoja.</p>
              <ul className={styles.heroBenefits}>
                <li>Bez industrijskih biljnih ulja</li>
                <li>Bez dodatog rafinisanog šećera</li>
                <li>Bez prženja u fritezi</li>
                <li>Bez upotrebe mikrotalasne peći</li>
              </ul>
            </div>
          ) : mode === 'custom' ? (
            <p>
              Sastavi svoj obrok u nekoliko klikova.
            </p>
          ) : (
            <p>Pošaljite nam svoj plan ishrane ili opišite obrok koji želite.</p>
          )}
        </div>
      </section>

      <div className={styles.modeBar}>
        <div className={styles.modeSwitch} role="tablist" aria-label="Tip narudzbine">
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'daily' ? styles.activeMode : ''}`}
            onClick={() => setMode('daily')}
          >
            Daily Fuel
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'custom' ? styles.activeMode : ''}`}
            onClick={() => setMode('custom')}
          >
            Fuel Builder
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'unique' ? styles.activeMode : ''}`}
            onClick={() => setMode('unique')}
          >
            Unique Fuel
          </button>
          <span
            className={styles.modeIndicator}
            style={{
              transform: `translateX(${mode === 'daily' ? 0 : mode === 'custom' ? 100 : 200}%)`,
            }}
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
                  <strong>{formatRsd(option.days * VARIANT_PRICES_RSD[subscriptionVariant])}</strong>
                </button>
              ))}
            </div>

            <div className={styles.variantPicker} role="radiogroup" aria-label="Tip obroka">
              <div>
                <span>Tip obroka za celu pretplatu</span>
                <p>Izbor vazi za svaki dan, pa ga ne morate ponavljati u dnevnom meniju.</p>
              </div>
              {['clean', 'lean'].map((variant) => (
                <button
                  key={variant}
                  type="button"
                  className={subscriptionVariant === variant ? styles.activeVariant : ''}
                  onClick={() => setSubscriptionVariant(variant)}
                >
                  <strong>{variant === 'clean' ? 'Clean' : 'Lean'}</strong>
                  <span>{formatRsd(VARIANT_PRICES_RSD[variant])} / dan</span>
                </button>
              ))}
            </div>

            <section className={styles.subscriptionExtras}>
              <div className={styles.extrasHeader}>
                <span>Dnevne dopune</span>
                <p>Stiklirajte dopune koje zelite uz svaku isporuku.</p>
              </div>
              <div className={styles.extraOptions}>
                {SUBSCRIPTION_EXTRAS.map((extra) => (
                  <label key={extra.id} className={styles.extraOption}>
                    <input
                      type="checkbox"
                      checked={subscriptionExtraIds.includes(extra.id)}
                      onChange={() => handleSubscriptionExtraToggle(extra.id)}
                    />
                    <span>{extra.label}</span>
                    <strong>{formatRsd(extra.priceRsd)} / dan</strong>
                  </label>
                ))}
              </div>
              {selectedSubscriptionExtras.length > 0 && (
                <div className={styles.rotationList}>
                  <strong>Nedeljna rotacija</strong>
                  {selectedSubscriptionExtras.map((extra) => (
                    <div key={extra.id}>
                      <span>{extra.label}</span>
                      <p>
                        {Object.entries(extra.rotation)
                          .map(([day, product]) => `${DAY_LABELS[day]}: ${product}`)
                          .join(' / ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

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
                                  day.mealIndex === index ? styles.selectedVariant : ''
                                }`}
                                onClick={() => handleSubscriptionChoice(day.id, index)}
                                tabIndex={editingDayId === day.id ? 0 : -1}
                              >
                                <span>{day.variantLabel}</span>
                                <p>{meal[subscriptionVariant]}</p>
                                <strong>{formatRsd(VARIANT_PRICES_RSD[subscriptionVariant])}</strong>
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
                  {selectedSubscriptionExtras.length > 0 && (
                    <div>
                      <span>Dnevne dopune</span>
                      <strong>{selectedSubscriptionExtras.map((extra) => extra.label).join(', ')}</strong>
                    </div>
                  )}
                </div>
                <button type="submit" disabled={pendingChoice === 'subscription'}>
                  {pendingChoice === 'subscription' ? 'Pripremamo placanje...' : 'Nastavi na placanje'}
                </button>
              </aside>
            </div>
          </form>
        </section>
      ) : mode === 'custom' ? (
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
                      <fieldset
                        key={section.id}
                        className={`${styles.customCard} ${
                          section.id === 'glavno' ? styles.mainDishCard : ''
                        }`}
                      >
                        <legend>
                          {section.title}
                          <span>
                            {section.maxSelections === 1
                              ? 'Izaberi jednu opciju'
                              : `Izaberi do ${section.maxSelections} opcije`}
                          </span>
                        </legend>
                        <div className={styles.checkboxList}>
                          {section.options.map((option) => {
                            const isSelected = meal.selected.has(option.id);
                            const selectedCount = section.options.filter((item) =>
                              meal.selected.has(item.id)
                            ).length;
                            const isDisabled =
                              !isSelected && selectedCount >= section.maxSelections;

                            return (
                              <label
                                key={option.id}
                                className={`${styles.checkboxOption} ${
                                  isDisabled ? styles.disabledOption : ''
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={isDisabled}
                                  onChange={() =>
                                    handleCustomToggle(meal.id, section.id, option.id)
                                  }
                                />
                                <span>{option.name}</span>
                                {option.priceRsdPerPerson > 0 && (
                                  <strong>{formatRsd(option.priceRsdPerPerson)}</strong>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <section className={styles.customAddOns}>
              <div className={styles.extrasHeader}>
                <span>Dopuni personalizovane obroke</span>
                <p>Dodajte kolace, potaze ili smutije pre nastavka na placanje.</p>
              </div>
              <div className={styles.customAddOnGrid}>
                {CUSTOM_ADD_ON_CATEGORIES.map((category) => (
                  <div key={category.id} className={styles.customAddOnCategory}>
                    <h3>{category.title}</h3>
                    {category.products.map((product) => {
                      const quantity =
                        customAddOns.find((item) => item.id === product.id)?.quantity || 0;

                      return (
                        <div key={product.id} className={styles.customAddOnProduct}>
                          <div>
                            <strong>{product.name}</strong>
                            <span>{formatRsd(product.priceRsd)}</span>
                          </div>
                          <div className={styles.addOnQuantity}>
                            <button
                              type="button"
                              onClick={() => updateCustomAddOnQuantity(category, product, -1)}
                              disabled={quantity === 0}
                              aria-label={`Ukloni ${product.name}`}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              max="999"
                              step="1"
                              value={quantity}
                              onChange={(event) =>
                                updateCustomAddOnQuantity(
                                  category,
                                  product,
                                  event.target.value,
                                  true
                                )
                              }
                              aria-label={`Količina za ${product.name}`}
                            />
                            <button
                              type="button"
                              onClick={() => updateCustomAddOnQuantity(category, product, 1)}
                              aria-label={`Dodaj ${product.name}`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>

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
      ) : (
        <section
          key="unique"
          className={`${styles.uniqueSection} ${styles.panelEnter} ${styles.fromRight}`}
          aria-labelledby="unique-fuel-title"
        >
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>Plan po vašoj meri</span>
            <h2 id="unique-fuel-title">Pošaljite Unique Fuel upit</h2>
          </div>

          <form className={styles.uniqueForm} onSubmit={handleUniqueSubmit}>
            <div className={styles.uniqueFields}>
              <label>
                Ime
                <input
                  name="ime"
                  value={uniqueForm.ime}
                  onChange={handleUniqueChange}
                  required
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={uniqueForm.email}
                  onChange={handleUniqueChange}
                />
              </label>
              <label>
                Broj telefona
                <input
                  name="br_tel"
                  value={uniqueForm.br_tel}
                  onChange={handleUniqueChange}
                />
              </label>
              <label className={styles.uniqueFullWidth}>
                Adresa
                <textarea
                  name="mesto"
                  rows="3"
                  value={uniqueForm.mesto}
                  onChange={handleUniqueChange}
                />
              </label>
              <label className={styles.uniqueFullWidth}>
                Opis željenog obroka ili plana ishrane
                <textarea
                  name="opis"
                  rows="6"
                  value={uniqueForm.opis}
                  onChange={handleUniqueChange}
                  placeholder="Opišite obroke, ciljeve ishrane, alergije i posebne zahteve..."
                  required
                />
              </label>
            </div>

            <button type="submit" className={styles.uniqueSubmit} disabled={uniqueSubmitting}>
              {uniqueSubmitting ? 'Šaljemo upit...' : 'Pošalji upit'}
            </button>

            {uniqueStatus.message && (
              <p className={`${styles.uniqueStatus} ${styles[uniqueStatus.type]}`} role="alert">
                {uniqueStatus.message}
              </p>
            )}
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
