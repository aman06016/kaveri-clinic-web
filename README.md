# Kaveri Web Boilerplate

React + Tailwind + Supabase starter for the clinic website.

## 1) Install and run

```bash
npm install
npm run dev
```

## 2) Supabase setup

1. Create a Supabase project (free tier).
2. In SQL Editor, run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local` and fill:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 3) What is included

- Tailwind configured in `tailwind.config.js` and `src/index.css`
- Supabase client in `src/lib/supabase.js`
- Booking data helpers in `src/services/bookings.js`
- Starter app UI in `src/App.jsx`

## 4) Next build steps

- Add pages/components for Home, Services, Booking, Contact
- Connect booking form to `createBooking()`
- Add slot calendar using `listSlots()`
