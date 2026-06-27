'use client';

import { useRef, useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import styles from './page.module.css';

const OFFERS = [
  {
    id: 'meni-1',
    name: 'Meni #1',
    image: '/01card.webp',
    priceRsd: 1404,
    items: [
      "Sendviči '80", 'Pileći wrap', 'Club sendvič', 'Pileći prstići', 'Ćevapi',
      'Pomfrit', 'Vitaminska salata', 'Kiflice sir', 'Projice', 'Rolatići',
    ],
    extras: [],
  },
  {
    id: 'meni-2',
    name: 'Meni #2',
    image: '/02card.webp',
    priceRsd: 2223,
    items: [
      "Sendviči '80", 'Pileći wrap', 'Club sendvič', 'Pileći prstići', 'Giros sendvič',
      'Mini burgeri', 'Roma tortilja', 'Fišek pileća salata', 'Takosi', 'Pomfrit',
      'Vitaminska salata', 'Grčka salata', 'Brusketi suhomesnato (3 vrste)',
      'Slani rolati (2 vrste)', 'Mediteranska projica', 'Kiflice sir', 'Čoko mus',
      'Čeri mus', 'Američke palačinke',
    ],
    extras: [],
  },
  {
    id: 'meni-3',
    name: 'Meni #3',
    image: '/03card.webp',
    priceRsd: 1872,
    items: [
      'Masline', 'Apetisani', 'Suvo voće',
      'Kanapei (dimljena piletina, peperoni, pršuta, morski plodovi)', 'Roma tortilja',
      'Slani rolati (2 vrste)', 'Pileće rolnice', 'Fišek pileća salata',
      'Brodići sa povrćem i sirom', 'Francuska salata', 'Sezonska salata',
      'Daska mesnih delikatesa', 'Daska sireva', 'Tikvice sa sirom', 'Paprika sa sirom',
      'Gibanica sir', 'Gibanica meso', 'Mediteranska projica', 'Zemičke',
    ],
    extras: [{ id: 'rostilj', label: 'Dodaj 4 vrste roštilja', priceRsd: 585, type: 'grill' }],
  },
  {
    id: 'meni-4',
    name: 'Meni #4',
    image: '/04card.webp',
    priceRsd: 2457,
    items: [
      'Masline', 'Apetisani', 'Suvo voće',
      'Kanapei (pršut, kraški vrat, dimljeni losos, prepeličja jaja)',
      'Brusketi (šumske gljive, tofu, sirevi)', 'Karpeze ražnjić',
      'Ražnjić od grilovanog povrća', 'Tikvice punjene fetom i parmezanom',
      'Paprika punjena sirom',
      'Brodići (grčka salata, grilovano povrće, morski plodovi, francuska salata)',
      'Slani rolati', 'Slane tortice', 'Prolećne rolnice', 'Fišek sa pilećom salatom',
      'Zeleni mix', 'Vitaminska salata',
      'Daska sireva (tvrdi ovči sir, sirevi sa začinima, bri, gorgonzola)',
      'Daska mesnatih delikatesa (goveđi pršut, svinjski pršut, buđola, pančeta, zimska salama)',
      'Mediteranska projica', 'Kiflice sir', 'Pasta pogačice', 'Čoko mus', 'Čizkejk',
      'Sveže voće',
    ],
    extras: [
      { id: 'rostilj', label: 'Dodaj 4 vrste roštilja', priceRsd: 585, type: 'grill' },
      {
        id: 'pecenje',
        label: 'Dodaj pečenje',
        priceRsd: 819,
        items: ['Praseća bajadera', 'Jagnjeće štanglice', 'Ćuretina sa suvim šljivama'],
      },
    ],
  },
  {
    id: 'meni-5',
    name: 'Meni #5',
    image: '/01card.webp',
    priceRsd: 2223,
    items: [
      'Masline', 'Apetisani', 'Suvo voće', 'Brusketi (šumske gljive, tofu, humus)',
      'Kanapei (losos, gambori, namaz od tartufa)',
      'Ražnjić od grilovanog povrća i tofu sira', 'Rižoto sa morskim plodovima',
      'Falafel kuglice', 'Meksička tortilja', 'Rolat sa dimljenim lososom',
      'Mediteranska salata', 'Vitaminska salata', 'Zeleni mix', 'Kraba salata',
      'Projice sa maslinama', 'Galete', 'Zemičke', 'Pita spanać', 'Pita pečurke',
      'Pita sa suvim šljivama', 'Pita višnja-vanila',
    ],
    extras: [
      { id: 'riba-5', label: 'Dodaj pastrmku i škarpinu', priceRsd: 585, items: ['Pastrmka', 'Škarpina'] },
      { id: 'riba-7', label: 'Dodaj losos filet i tuna stejk', priceRsd: 819, items: ['Losos filet', 'Tuna stejk'] },
    ],
  },
];

const GRILL_OPTIONS = [
  'Pileći prstići', 'Uštipci', 'Carski ražnjić', 'Pileći ražnjić',
  'Dimljena vešalica', 'Pileći paketići', 'Ćevapi', 'Kobasica',
];

const ADD_ON_CATEGORIES = [
  {
    id: 'potaz',
    label: 'Potaž',
    products: [
      { id: 'potaz-bundeva', name: 'Potaž od bundeve', priceRsd: 320 },
      { id: 'potaz-brokoli', name: 'Potaž od brokolija', priceRsd: 340 },
      { id: 'potaz-pecurke', name: 'Potaž od pečuraka', priceRsd: 360 },
    ],
  },
  {
    id: 'deserti',
    label: 'Deserti',
    products: [
      { id: 'desert-protein-kuglice', name: 'Protein kuglice', priceRsd: 290 },
      { id: 'desert-cia-puding', name: 'Čia puding', priceRsd: 360 },
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

const CATERING_MENU_CATEGORIES = [
  {
    id: 'predjela',
    title: 'Predjela',
    products: [
      { id: 'kanapei', name: 'Mix kanapea', priceRsd: 4200 },
      { id: 'mini-sendvici', name: 'Mini sendviči', priceRsd: 3600 },
      { id: 'slani-zalogaji', name: 'Slani zalogaji', priceRsd: 3200 },
    ],
  },
  {
    id: 'glavna-jela',
    title: 'Glavna jela',
    products: [
      { id: 'gril-mix', name: 'Gril mix', priceRsd: 7800 },
      { id: 'pecenje', name: 'Pecenje', priceRsd: 9200 },
      { id: 'riblji-izbor', name: 'Riblji izbor', priceRsd: 9800 },
    ],
  },
  {
    id: 'prilozi-salate',
    title: 'Prilozi i salate',
    products: [
      { id: 'sezonske-salate', name: 'Sezonske salate', priceRsd: 2800 },
      { id: 'topli-prilozi', name: 'Topli prilozi', priceRsd: 3400 },
      { id: 'premium-salate', name: 'Premium salate', priceRsd: 4200 },
    ],
  },
  {
    id: 'dezerti',
    title: 'Dezerti',
    products: [
      { id: 'dezert-zalogaji', name: 'Dezert zalogaji', priceRsd: 3800 },
      { id: 'torte', name: 'Izbor torti', priceRsd: 6200 },
      { id: 'vocni-sto', name: 'Voćni sto', priceRsd: 4600 },
    ],
  },
];

function formatRsd(value) {
  return `${value.toLocaleString('sr-RS')} RSD`;
}

function normalizeQuantity(value) {
  const quantity = Number(value);
  return Number.isFinite(quantity) ? Math.max(0, Math.min(999, Math.floor(quantity))) : 0;
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
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [formData, setFormData] = useState({
    ime: '',
    email: '',
    br_tel: '',
    broj_osoba: '',
    datum: '',
    vreme: '',
    mesto: '',
    napomena: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAddOnCategoryId, setActiveAddOnCategoryId] = useState(null);
  const [addOns, setAddOns] = useState([]);
  const [cateringMenuMode, setCateringMenuMode] = useState('supplement');
  const [customMenuItems, setCustomMenuItems] = useState([]);
  const [selectedOfferExtraIds, setSelectedOfferExtraIds] = useState([]);
  const [selectedGrillItems, setSelectedGrillItems] = useState([]);

  const selectedOffer =
    cateringMenuMode === 'supplement'
      ? OFFERS.find((offer) => offer.id === selectedOfferId) || null
      : null;
  const activeAddOnCategory = ADD_ON_CATEGORIES.find(
    (category) => category.id === activeAddOnCategoryId
  );
  const addOnTotalRsd = addOns.reduce(
    (sum, item) => sum + item.priceRsd * item.quantity,
    0
  );
  const guestCount = Math.max(1, Number(formData.broj_osoba || 1));
  const originalCustomMenuTotalRsd = customMenuItems.reduce(
    (sum, item) => sum + item.priceRsd * guestCount,
    0
  );
  const selectedOfferExtras = (selectedOffer?.extras || []).filter((extra) =>
    selectedOfferExtraIds.includes(extra.id)
  );
  const extrasPriceRsdPerGuest = selectedOfferExtras.reduce(
    (sum, extra) => sum + extra.priceRsd,
    0
  );
  const priceRsdPerGuest = Number(selectedOffer?.priceRsd || 0) + extrasPriceRsdPerGuest;
  const originalOfferTotalRsd = priceRsdPerGuest * guestCount;
  const discountRate = guestCount >= 50 ? 0.1 : guestCount >= 30 ? 0.05 : 0;
  const discountRsd = Math.round(originalOfferTotalRsd * discountRate);
  const offerTotalRsd = originalOfferTotalRsd - discountRsd;
  const customMenuDiscountRsd = Math.round(originalCustomMenuTotalRsd * discountRate);
  const customMenuTotalRsd = originalCustomMenuTotalRsd - customMenuDiscountRsd;
  const totalRsd =
    cateringMenuMode === 'custom'
      ? customMenuTotalRsd
      : offerTotalRsd + addOnTotalRsd;

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

  const getAddOnQuantity = (productId) => {
    return addOns.find((item) => item.id === productId)?.quantity || 0;
  };

  const updateAddOnQuantity = (category, product, value, absolute = false) => {
    setAddOns((current) => {
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
        {
          ...product,
          quantity: nextQuantity,
          categoryId: category.id,
          categoryLabel: category.label,
        },
      ];
    });
  };

  const toggleCustomMenuItem = (category, product) => {
    setCustomMenuItems((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.filter((item) => item.id !== product.id);
      }

      return [
        ...current,
        { ...product, category: category.title },
      ];
    });
  };

  const handleOfferExtraToggle = (extra) => {
    setSelectedOfferExtraIds((current) => {
      if (current.includes(extra.id)) {
        if (extra.type === 'grill') {
          setSelectedGrillItems([]);
        }

        return current.filter((id) => id !== extra.id);
      }

      return [...current, extra.id];
    });
  };

  const selectOffer = (offerId) => {
    if (selectedOfferId === offerId) {
      setCateringMenuMode('supplement');
      return;
    }

    setSelectedOfferId(offerId);
    setCateringMenuMode('supplement');
    setSelectedOfferExtraIds([]);
    setSelectedGrillItems([]);
  };

  const handleGrillItemToggle = (item) => {
    setSelectedGrillItems((current) => {
      if (current.includes(item)) {
        return current.filter((value) => value !== item);
      }

      if (current.length >= 4) {
        return current;
      }

      return [...current, item];
    });
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

      if (cateringMenuMode === 'custom' && customMenuItems.length === 0) {
        throw new Error('Dodajte bar jednu stavku u ketering meni.');
      }

      if (cateringMenuMode === 'supplement' && !selectedOffer) {
        throw new Error('Izaberite ketering ponudu.');
      }

      const grillExtraSelected = selectedOfferExtras.some((extra) => extra.type === 'grill');

      if (cateringMenuMode === 'supplement' && grillExtraSelected && selectedGrillItems.length !== 4) {
        throw new Error('Izaberite tačno 4 vrste roštilja za dodatak.');
      }

      const response = await fetch('/api/narudzbine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cena: totalRsd,
          porudzbina: {
            schemaVersion: 1,
            source: 'ketering',
            type: 'catering_inquiry',
            title: cateringMenuMode === 'custom' ? 'Ketering po meri' : selectedOffer.name,
            status: 'new',
            guestCount,
            items: cateringMenuMode === 'custom'
              ? customMenuItems.map((item) => ({
                  id: item.id,
                  name: item.name,
                  category: item.category,
                  variant: null,
                  quantity: guestCount,
                  unitPriceRsd: Math.round(item.priceRsd * (1 - discountRate)),
                  totalPriceRsd: Math.round(item.priceRsd * guestCount * (1 - discountRate)),
                  meta: {
                    source: 'ketering-po-meri',
                    guestCount,
                    originalUnitPriceRsd: item.priceRsd,
                    discountPercent: discountRate * 100,
                  },
                }))
              : [
                {
                id: selectedOffer.id,
                name: selectedOffer.name,
                category: 'Ketering ponuda',
                variant: null,
                quantity: guestCount,
                unitPriceRsd: Math.round(selectedOffer.priceRsd * (1 - discountRate)),
                totalPriceRsd: Math.round(
                  selectedOffer.priceRsd * guestCount * (1 - discountRate)
                ),
                meta: {
                  dishes: selectedOffer.items,
                  guestCount,
                  originalUnitPriceRsd: selectedOffer.priceRsd,
                  discountPercent: discountRate * 100,
                },
              },
                ...selectedOfferExtras.map((extra) => ({
                  id: `${selectedOffer.id}-${extra.id}`,
                  name: extra.label,
                  category: 'Dopuna ketering menija',
                  variant: null,
                  quantity: guestCount,
                  unitPriceRsd: Math.round(extra.priceRsd * (1 - discountRate)),
                  totalPriceRsd: Math.round(
                    extra.priceRsd * guestCount * (1 - discountRate)
                  ),
                  meta: {
                    source: 'dopuna',
                    originalUnitPriceRsd: extra.priceRsd,
                    dishes: extra.type === 'grill' ? selectedGrillItems : extra.items || [],
                    discountPercent: discountRate * 100,
                  },
                })),
                ...addOns.map((item) => ({
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
                })),
              ],
            totals: {
              subtotalRsd:
                cateringMenuMode === 'custom'
                  ? originalCustomMenuTotalRsd
                  : originalOfferTotalRsd + addOnTotalRsd,
              deliveryRsd: 0,
              discountRsd: cateringMenuMode === 'custom' ? customMenuDiscountRsd : discountRsd,
              totalRsd,
            },
            customerNote: formData.napomena.trim(),
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
            legacy: cateringMenuMode === 'custom'
              ? { customMenu: true }
              : {
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
        broj_osoba: '',
        datum: '',
        vreme: '',
        mesto: '',
        napomena: '',
      });
      setAddOns([]);
      setCustomMenuItems([]);
      setSelectedOfferExtraIds([]);
      setSelectedGrillItems([]);
      setActiveAddOnCategoryId(null);
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
                cateringMenuMode === 'supplement' && selectedOfferId === offer.id
                  ? styles.selectedCard
                  : ''
              }`}
              role="button"
              tabIndex={0}
              aria-pressed={cateringMenuMode === 'supplement' && selectedOfferId === offer.id}
              onClick={(event) => {
                if (event.target.closest('input, label, [data-offer-extras]')) {
                  return;
                }

                selectOffer(offer.id);
              }}
              onKeyDown={(event) => {
                if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  selectOffer(offer.id);
                }
              }}
            >
              <div className={styles.offerImage} style={{ backgroundImage: `url(${offer.image})` }}>
                <span>{formatRsd(offer.priceRsd)} / gostu</span>
              </div>
              <div className={styles.offerBody}>
                <h2>{offer.name}</h2>
                <ul>
                  {offer.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {cateringMenuMode === 'supplement' &&
                  selectedOfferId === offer.id &&
                  offer.extras.length > 0 && (
                  <div className={styles.offerExtras} data-offer-extras>
                    {offer.extras.map((extra) => {
                      const isChecked = selectedOfferExtraIds.includes(extra.id);

                      return (
                        <div key={extra.id} className={styles.offerExtraOption}>
                          <label>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleOfferExtraToggle(extra)}
                            />
                            <span>{extra.label}</span>
                            <strong>+{formatRsd(extra.priceRsd)} / gostu</strong>
                          </label>
                          {isChecked && extra.type === 'grill' && (
                            <div className={styles.grillOptions}>
                              <span>Izaberite tačno 4 vrste ({selectedGrillItems.length}/4)</span>
                              {GRILL_OPTIONS.map((item) => {
                                const itemChecked = selectedGrillItems.includes(item);
                                const itemDisabled = !itemChecked && selectedGrillItems.length >= 4;

                                return (
                                  <label key={item}>
                                    <input
                                      type="checkbox"
                                      checked={itemChecked}
                                      disabled={itemDisabled}
                                      onChange={() => handleGrillItemToggle(item)}
                                    />
                                    <span>{item}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                          {isChecked && extra.items && (
                            <p>{extra.items.join(', ')}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <span className={styles.offerSelectAction}>
                  {cateringMenuMode === 'supplement' && selectedOfferId === offer.id
                    ? 'Izabrano'
                    : 'Izaberi ponudu'}
                </span>
              </div>
            </article>
          ))}
        </div>

        <p className={styles.discountNotice}>
          Ostvarite 5% popusta za porudžbine od 30 gostiju, odnosno 10% od 50 gostiju.
        </p>

        <section className={styles.menuBuilder}>
          <div className={styles.menuBuilderHeader}>
            <span>Prilagodite ketering</span>
            <h2>Dopunite ponudu ili sastavite svoj meni</h2>
          </div>
          <div className={styles.builderModeSwitch}>
            <button
              type="button"
              className={cateringMenuMode === 'supplement' ? styles.activeBuilderMode : ''}
              onClick={() => setCateringMenuMode('supplement')}
            >
              Dopuni izabranu ponudu
            </button>
            <button
              type="button"
              className={cateringMenuMode === 'custom' ? styles.activeBuilderMode : ''}
              onClick={() => {
                setCateringMenuMode('custom');
                setSelectedOfferId(null);
                setSelectedOfferExtraIds([]);
                setSelectedGrillItems([]);
              }}
            >
              Sastavi svoj meni
            </button>
          </div>

          {cateringMenuMode === 'supplement' ? (
            <>
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

              {addOns.length > 0 && (
                <div className={styles.addOnSummary}>
                  <span>Dodato u narudzbinu</span>
                  <ul>
                    {addOns.map((item) => (
                      <li key={item.id}>
                        <span>{item.quantity}x {item.name}</span>
                        <strong>{formatRsd(item.priceRsd * item.quantity)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <>
              <div className={styles.customMenuGrid}>
                {CATERING_MENU_CATEGORIES.map((category) => (
                  <div key={category.id} className={styles.customMenuCategory}>
                    <h3>{category.title}</h3>
                    {category.products.map((product) => {
                      const isSelected = customMenuItems.some((item) => item.id === product.id);

                      return (
                        <label
                          key={product.id}
                          className={`${styles.customMenuProduct} ${
                            isSelected ? styles.customMenuProductSelected : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            className={styles.customMenuCheckbox}
                            checked={isSelected}
                            onChange={() => toggleCustomMenuItem(category, product)}
                          />
                          <div>
                            <strong>{product.name}</strong>
                            <span>{formatRsd(product.priceRsd)} / gostu</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className={styles.customMenuTotal}>
                <span>Sastavljeni meni / {guestCount} gostiju</span>
                <strong>{formatRsd(customMenuTotalRsd)}</strong>
              </div>
            </>
          )}
        </section>

        <form className={styles.inquiryForm} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <span>{cateringMenuMode === 'custom' ? 'Meni po meri' : 'Izabrana ponuda'}</span>
            <h2>
              {cateringMenuMode === 'custom'
                ? 'Ketering po meri'
                : selectedOffer?.name || 'Izaberite ponudu iznad'}
            </h2>
            {cateringMenuMode === 'custom' ? (
              <div className={styles.discountPrice}>
                {discountRate > 0 && <del>{formatRsd(originalCustomMenuTotalRsd)}</del>}
                <strong>{formatRsd(totalRsd)}</strong>
                {discountRate > 0 && <span>{discountRate * 100}% popusta</span>}
              </div>
            ) : !selectedOffer ? (
              <span className={styles.emptyPrice}>Cena nakon izbora ponude</span>
            ) : (
              <div className={styles.discountPrice}>
                {discountRate > 0 && <del>{formatRsd(originalOfferTotalRsd)}</del>}
                <strong>{formatRsd(offerTotalRsd)}</strong>
                <span>
                  {addOnTotalRsd > 0 ? `Ukupno sa dopunama: ${formatRsd(totalRsd)}` : ''}
                  {discountRate > 0 ? `${addOnTotalRsd > 0 ? ' / ' : ''}${discountRate * 100}% popusta` : ''}
                </span>
              </div>
            )}
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
              Broj osoba
              <input
                name="broj_osoba"
                type="number"
                min="1"
                step="1"
                value={formData.broj_osoba}
                onChange={handleChange}
                placeholder="Npr. 50"
              />
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
            <label className={styles.fullWidth}>
              Napomena kupca
              <textarea
                name="napomena"
                rows="3"
                value={formData.napomena}
                onChange={handleChange}
                placeholder="Posebni zahtevi, alergije, vreme postavke..."
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
                        <input
                          type="number"
                          min="0"
                          max="999"
                          step="1"
                          value={quantity}
                          onChange={(event) =>
                            updateAddOnQuantity(
                              activeAddOnCategory,
                              product,
                              event.target.value,
                              true
                            )
                          }
                          aria-label={`Količina za ${product.name}`}
                        />
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
                  Sačuvaj dopunu
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
