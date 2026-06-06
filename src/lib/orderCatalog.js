export const PREPARED_MENUS = [
  {
    id: 'klasicni',
    name: 'Klasicni recepti',
    description: 'Tradicionalna srpska kuhinja sa modernim dodirom. Idealno za poslovne dogadjaje.',
    image: '/04card.webp',
    items: ['Pljeskavica', 'Cevapi', 'Raznjici', 'Musaka'],
    priceRsdPerPerson: 1500,
  },
  {
    id: 'mediteranski',
    name: 'Mediteranski stil',
    description: 'Svez meni sa mediteranskim ukusima. Savrseno za letnje dogadjaje.',
    image: '/menu2.webp',
    items: ['Gril riba', 'Rizoto', 'Mediteranska salata', 'Pasta'],
    priceRsdPerPerson: 1800,
  },
  {
    id: 'premium',
    name: 'Premium izbor',
    description: 'Nasa najluksuznija ponuda sa ekskluzivnim jelima za posebne dogadjaje.',
    image: '/menu3.webp',
    items: ['Biftek', 'Jastog', 'Tiramisu', 'Jagnje'],
    priceRsdPerPerson: 2500,
  },
  {
    id: 'vegetarijanski',
    name: 'Vegetarijanski raj',
    description: 'Hranljive vegetarijanske opcije, zdrava i ukusna kombinacija.',
    image: '/menu4.webp',
    items: ['Grilovano povrce', 'Veganski burgeri', 'Tofu', 'Smoothie bowls'],
    priceRsdPerPerson: 1200,
  },
];

export const DISHES_BY_CATEGORY = [
  {
    category: 'Glavna jela',
    dishes: [
      { id: 'pljeskavica', name: 'Pljeskavica', priceRsdPerPerson: 420 },
      { id: 'cevapi', name: 'Cevapi', priceRsdPerPerson: 390 },
      { id: 'raznjici', name: 'Raznjici', priceRsdPerPerson: 450 },
      { id: 'biftek', name: 'Biftek', priceRsdPerPerson: 900 },
      { id: 'jagnje', name: 'Jagnje', priceRsdPerPerson: 780 },
      { id: 'gril_riba', name: 'Gril riba', priceRsdPerPerson: 720 },
    ],
  },
  {
    category: 'Dodatna jela',
    dishes: [
      { id: 'musaka', name: 'Musaka', priceRsdPerPerson: 360 },
      { id: 'rizoto', name: 'Rizoto', priceRsdPerPerson: 340 },
      { id: 'pasta', name: 'Pasta', priceRsdPerPerson: 320 },
      { id: 'grilovano_povrce', name: 'Grilovano povrce', priceRsdPerPerson: 280 },
      { id: 'salata', name: 'Mediteranska salata', priceRsdPerPerson: 240 },
      { id: 'veganski_burger', name: 'Veganski burger', priceRsdPerPerson: 410 },
    ],
  },
  {
    category: 'Deserti',
    dishes: [
      { id: 'tiramisu', name: 'Tiramisu', priceRsdPerPerson: 260 },
      { id: 'baklava', name: 'Baklava', priceRsdPerPerson: 220 },
      { id: 'vocni_desert', name: 'Vocni desert', priceRsdPerPerson: 240 },
      { id: 'cokoladna_torta', name: 'Cokoladna torta', priceRsdPerPerson: 280 },
    ],
  },
];

export const EVENT_TYPES = [
  'Poslovni dogadjaj',
  'Vencanje',
  'Proslava',
  'Privatni sastanak',
  'Konferencija',
];

export function formatRsd(amount) {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getMenuById(menuId) {
  return PREPARED_MENUS.find((menu) => menu.id === menuId);
}

export function getDishById(dishId) {
  return DISHES_BY_CATEGORY.flatMap((category) => category.dishes).find((dish) => dish.id === dishId);
}

export function calculateCustomOrder({ guestCount, selectedDishIds }) {
  const selectedDishes = selectedDishIds.map(getDishById).filter(Boolean);
  const priceRsdPerPerson = selectedDishes.reduce((total, dish) => total + dish.priceRsdPerPerson, 0);

  return {
    selectedDishes,
    priceRsdPerPerson,
    totalRsd: priceRsdPerPerson * guestCount,
  };
}

export function stripeAmountFromRsd(totalRsd) {
  return Math.max(50, Math.round(totalRsd));
}
