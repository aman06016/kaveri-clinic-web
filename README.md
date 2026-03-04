# Kaveri Web (Firebase)

React + Vite frontend connected to Firebase Firestore.

## 1) Install and run

```bash
npm install
npm run dev
```

## 2) Firebase project setup

1. Create a Firebase project in `console.firebase.google.com`.
2. Add a Web app in that project and copy its config values.
3. Copy `.env.example` to `.env.local` and fill all `VITE_FIREBASE_*` keys.
4. In Firebase Console, enable Firestore Database.

## 3) Firebase CLI setup (one-time per machine)

```bash
npx firebase-tools login
```

Set your real project id in `.firebaserc` (`projects.default`), then deploy:

```bash
npm run firebase:deploy
```

Useful deploy commands:

```bash
npm run firebase:deploy:hosting
npm run firebase:deploy:firestore
```

## 4) What is included

- Firebase client setup: `src/lib/firebase.js`
- Firestore rules: `firestore.rules`
- Firestore indexes: `firestore.indexes.json`
- Firebase hosting config: `firebase.json`
- Firebase project alias: `.firebaserc`
