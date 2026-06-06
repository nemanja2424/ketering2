'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { FaCheck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PREPARED_MENUS = [
  {
    id: 1,
    name: 'KlasiÄni recepti',
    description: 'Tradicionalna srpska kuhinja sa modernim dosetkom. Idealno za ozbiljne poslovne dogaÄ‘aje.',
    image: '/04card.webp',
    items: ['Pljeskavica', 'Ä†evapi', 'RaznjiÄ‡i', 'Musaka'],
    price: 'od 1500 din',
    priceInEur: 15
  },
  {
    id: 2,
    name: 'Mediteranski stil',
    description: 'Svetle, sveÅ¾u hranu sa mediteranskim ukusima. SavrÅ¡eno za letnjih dogaÄ‘aja.',
    image: '/menu2.webp',
    items: ['Gril riba', 'Rizoto', 'Mediteranska salata', 'Pasta'],
    price: 'od 1800 din',
    priceInEur: 18
  },
  {
    id: 3,
    name: 'Premium izbor',
    description: 'NaÅ¡a najluksuznija ponuda sa eksluzivnom hranom. Za pravi special events.',
    image: '/menu3.webp',
    items: ['Biftek', 'Jastog', 'TiramiÅ¡', 'Jagnje'],
    price: 'od 2500 din',
    priceInEur: 25
  },
  {
    id: 4,
    name: 'Vegetarijanski raj',
    description: 'Blistavih i hranljive vegetarijanske opcije. Zdrava i ukusna kombinacija.',
    image: '/menu4.webp',
    items: ['Grilovan povrÄ‡e', 'Veganski burgeri', 'Tofu', 'Smoothie bowls'],
    price: 'od 1200 din',
    priceInEur: 12
  }
];

const DISHES_BY_CATEGORY = [
  {
    category: 'Glavna jela',
    dishes: [
      { id: 'pljeskavica', name: 'Pljeskavica' },
      { id: 'cevapi', name: 'Ä†evapi' },
      { id: 'raznjici', name: 'RaznjiÄ‡i' },
      { id: 'biftek', name: 'Biftek' },
      { id: 'jagnje', name: 'Jagnje' },
      { id: 'gril_riba', name: 'Gril Riba' }
    ]
  },
  {
    category: 'Dodatni jeli',
    dishes: [
      { id: 'musaka', name: 'Musaka' },
      { id: 'rizoto', name: 'Rizoto' },
      { id: 'pasta', name: 'Pasta' },
      { id: 'grilovan_povrce', name: 'Grilovan PovrÄ‡e' },
      { id: 'salata', name: 'Mediteranska Salata' },
      { id: 'veganski_burger', name: 'Veganski Burger' }
    ]
  },
  {
    category: 'Deserte',
    dishes: [
      { id: 'tiramisu', name: 'TiramiÅ¡' },
      { id: 'baklava', name: 'Baklava' },
      { id: 'voÄ‡ni_desert', name: 'VoÄ‡ni Desert' },
      { id: 'cokolada', name: 'ÄŒokolada Torta' }
    ]
  }
];

export default function OrderPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDishes, setSelectedDishes] = useState(new Set());
  const [showHint, setShowHint] = useState(true);
  const [eventType, setEventType] = useState('Poslovni dogaÄ‘aj');
  const [guestCount, setGuestCount] = useState('50');
  const [notes, setNotes] = useState('');
  const containerRef = useRef(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    // PrikaÅ¾i hint samo prvu 3 sekunde
    const hintTimer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(hintTimer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' && activeTab < 1) {
        setActiveTab(1);
      } else if (e.key === 'ArrowLeft' && activeTab > 0) {
        setActiveTab(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
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
    const newSelected = new Set(selectedDishes);
    if (newSelected.has(dishId)) {
      newSelected.delete(dishId);
    } else {
      newSelected.add(dishId);
    }
    setSelectedDishes(newSelected);
  };

  const handleMenuOrder = (menu) => {
    const orderData = {
      type: 'menu',
      menuName: menu.name,
      menuPrice: menu.price,
      menuPriceInEur: menu.priceInEur,
      menuItems: menu.items,
      description: menu.description
    };
    // ProsleÄ‘i podatke preko URL-a
    const encodedData = encodeURIComponent(JSON.stringify(orderData));
    router.push(`/placanje?order=${encodedData}`);
  };

  const handleCustomOrder = (e) => {
    e.preventDefault();
    
    const dishesArray = Array.from(selectedDishes);
    if (dishesArray.length === 0) {
      alert('Molimo odaberi bar jedno jelo');
      return;
    }

    const orderData = {
      type: 'custom',
      eventType,
      guestCount: parseInt(guestCount),
      selectedDishes: dishesArray,
      notes
    };
    
    // ProsleÄ‘i podatke preko URL-a
    const encodedData = encodeURIComponent(JSON.stringify(orderData));
    router.push(`/placanje?order=${encodedData}`);
  };

  return (
    <main className={styles.orderPage}>


      {/* Swipe Container */}
      <div 
        className={styles.swipeContainer}
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Scroll Hint */}
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
          {/* Tab 1: Prepared Menus */}
          <div className={styles.tab}>
            <div className={`${styles.tabContent} ${styles.prepared}`}>
              <div className={styles.tabHeader}>
                <h2>Pripremljeni menji</h2>
                <p>Odaberi jedan od naÅ¡ih kurisnih menija</p>
              </div>

              <div className={styles.menusGrid}>
                {PREPARED_MENUS.map((menu) => (
                  <div key={menu.id} className={styles.menuCard}>
                    <div className={styles.menuImage} style={{ backgroundImage: `url(${menu.image})` }}></div>
                    <div className={styles.menuContent}>
                      <h3>{menu.name}</h3>
                      <p className={styles.description}>{menu.description}</p>
                      <div className={styles.items}>
                        {menu.items.map((item, idx) => (
                          <div key={idx} className={styles.item}>
                            <FaCheck /> {item}
                          </div>
                        ))}
                      </div>
                      <div className={styles.priceFooter}>
                        <span className={styles.price}>{menu.price}</span>
                        <button 
                          type="button"
                          className={styles.orderBtn}
                          onClick={() => handleMenuOrder(menu)}
                        >
                          PoruÄi
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tab 2: Custom Order */}
          <div className={styles.tab}>
            <div className={`${styles.tabContent} ${styles.custom}`}>
              <div className={styles.tabHeader}>
                <h2>Personalizovana narudÅ¾bina</h2>
                <p>Kreiraj meni po svojoj meri</p>
              </div>

              <form className={styles.customForm} onSubmit={handleCustomOrder}>
                <div className={styles.formSection}>
                  <h3>Osnovni podaci</h3>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Tip dogaÄ‘aja</label>
                      <select 
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                      >
                        <option>Poslovni dogaÄ‘aj</option>
                        <option>VenÄanje</option>
                        <option>Proslava</option>
                        <option>Privatni sastanak</option>
                        <option>Konferencija</option>
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
                        onChange={(e) => setGuestCount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h3>Odaberi jela</h3>
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
                    <label>Dodatne napomene i Å¾elje</label>
                    <textarea 
                      placeholder="Recite nam Å¡ta vam joÅ¡ treba..." 
                      rows="4"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Nastavi na plaÄ‡anje
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Tab Switcher */}
      <div className={styles.fixedTabs}>
        <div className={styles.tabSwitcher}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 0 ? styles.active : ''}`}
            onClick={() => setActiveTab(0)}
          >
            <span>Pripremljeni menji</span>
          </button>
          <button 
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
