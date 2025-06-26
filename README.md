# BuzzTrack 📱🐝

Monitor smart beehives in real time with **BuzzTrack**, a React Native app built on the [Expo](https://expo.dev) platform and powered by **expo-router** for file-based navigation.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Firebase Setup (optional)](#firebase-setup-optional)
4. [Project Structure](#project-structure)
5. [Resetting the Project](#resetting-the-project)
6. [Learn More](#learn-more)
7. [Community](#community)

---

## Prerequisites

| Tool                                        | Minimum&nbsp;Version | Notes                                             |
| ------------------------------------------- | -------------------- | ------------------------------------------------- |
| **Node.js**                                 | 18 LTS               | <https://nodejs.org/>                             |
| **npm** (bundled with Node) **or** **yarn** | Latest LTS           | <https://www.npmjs.com/> / <https://yarnpkg.com/> |
| **Expo CLI**                                | 7+                   | Install globally: `npm install -g expo-cli`       |
| **Expo Go**                                 | Latest               | Android/iOS device for real-device testing        |
| **Android Studio**                          | Latest               | Optional Android emulator                         |
| **Xcode** (macOS)                           | Latest               | Optional iOS simulator                            |

---

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/Yaztecan/BuzzTrack_App.git
cd BuzzTrack_App
```

2. **Install dependencies**

```bash
npm install
# or
yarn
```

3. **Run the app**

```bash
npx expo start
```

The Expo Developer Tools will open in your browser. Choose one of:

- Press `i` – launch the iOS simulator (macOS only)
- Press `a` – launch the Android emulator
- Scan the QR code with Expo Go on your phone

---

## Firebase Setup (optional)

Follow these steps only if you need authentication or cloud data:

1. Create a project in the [Firebase Console](https://console.firebase.google.com).

2. Under **Authentication** → **Sign-in method**, enable Email/Password (and any others you need).

3. Add a Web app and copy its configuration snippet.

4. Replace the placeholder values in `firebase/firebase.js`:

```js
// firebase/firebase.js
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

---

## Project Structure

```
BuzzTrack_App/
├── app/                # expo-router pages (all lowercase filenames)
│   ├── index.tsx
│   └── ...             # other screens
├── components/         # Reusable UI components
├── constants/          # Shared constants (colors, sizes, etc.)
├── firebase/           # Firebase config & helpers
├── hooks/              # Custom React hooks
├── scripts/            # Utility scripts
├── assets/             # Fonts, images, icons
├── App.js              # Expo entry point
└── package.json
```

---

## Resetting the Project

Need a blank slate? Archive the current `app/` folder and spin up a fresh one:

```bash
npm run reset-project
```

The existing code moves to `app-example/` and a new empty `app/` directory is created.

---

## Learn More

- [Expo documentation](https://docs.expo.dev/)
- [expo-router docs](https://expo.github.io/router/docs)
- [React Native docs](https://reactnative.dev/)
- [Firebase docs](https://firebase.google.com/docs)

---

## Community

- [Expo on GitHub](https://github.com/expo/expo)
- [Expo Discord](https://chat.expo.dev)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)
