# Setup Stripe plaćanja

## 1. Kreiraj Stripe nalog
1. Idi na [https://stripe.com](https://stripe.com)
2. Kreiraj nalog ako nemaš
3. Idi u [Dashboard](https://dashboard.stripe.com/)

## 2. Pronađi API ključeve
1. U Dashboard-u, idi na **Developers** → **API Keys**
2. Kopiraj **Publishable key** (počinje sa `pk_`)
3. Kopiraj **Secret key** (počinje sa `sk_`)

## 3. Postavi environment varijable
U `.env.local` fajlu zameni:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

## 4. Testiraj plaćanja
Stranica je dostupna na: `http://localhost:3000/placanje`

### Test kartice:
- **4242 4242 4242 4242** - Uspešna plaćanja
- **4000 0000 0000 9995** - Odbijena plaćanja
- **Rok:** bilo koji budući datum (npr. 12/25)
- **CVC:** bilo koji 3 broja

## 5. Setup Webhook-a (opcionalno ali preporučeno)
Webhook vam omogućava da pratite sve Stripe event-e u realnom vremenu.

### Lokalno testiranje:
```bash
npm install -g stripe
stripe listen --forward-to localhost:3000/api/webhook
```

### Production setup:
1. U Stripe Dashboard → **Developers** → **Webhooks**
2. Klikni **Add endpoint**
3. Unesi URL: `https://vasadomena.com/api/webhook`
4. Odaberi event-e:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Kopiraj **Signing secret** u `.env.local` kao `STRIPE_WEBHOOK_SECRET`

## Struktura fajlova
```
src/
├── app/
│   ├── api/
│   │   ├── create-payment-intent/
│   │   │   └── route.js          # Kreira payment intent
│   │   └── webhook/
│   │       └── route.js          # Prima Stripe event-e
│   └── placanje/
│       ├── page.jsx              # Stripe forma
│       └── page.module.css       # Stilovi
```

## API Rute

### POST `/api/create-payment-intent`
Kreira payment intent za Stripe plaćanje.

**Request body:**
```json
{
  "amount": 1000,           // iznos u centima (10 EUR)
  "email": "user@example.com",
  "name": "Korisnikovo Ime"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx#secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### POST `/api/webhook`
Prima event-e od Stripe-a. Zaštićeno sa signature verification.

## Važne napomene
- Test ključeve koristi dok testiraš (počinju sa `pk_test_` i `sk_test_`)
- Za production, koristi live ključeve (počinju sa `pk_live_` i `sk_live_`)
- NIKADA ne stavljaj secret ključ u klijentski kod
- `.env.local` je u `.gitignore` - čuva tvoje tajne
