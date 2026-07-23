# 🚢 SHIPMATE PDD - Peer-to-Peer Delivery & Tracking System

SHIPMATE is a peer-to-peer package delivery platform connecting senders with travelers to transport packages safely, fast, and affordably.

---

## 📲 Direct Mobile App (APK) Download

[![Download Android APK](https://img.shields.io/badge/Download-Android%20APK-brightgreen?style=for-the-badge&logo=android)](https://github.com/Karthikeya90/SHIPMATE-PDD-FINAL/actions)

### 📲 Quick Download Steps from GitHub:
1. **[Click Here to Open GitHub Actions Runs](https://github.com/Karthikeya90/SHIPMATE-PDD-FINAL/actions)** (or check the [GitHub Releases Page](https://github.com/Karthikeya90/SHIPMATE-PDD-FINAL/releases)).
2. Tap on the latest **"Build & Release Android APK"** workflow run.
3. Scroll down to **Artifacts** at the bottom of the run page.
4. Download **`shipmate-android-apk`** (or `app-debug.apk`), extract/open it on your Android phone, and tap **Install**!

---

## 📱 Mobile App Development & Local Build Guide

### Option 1: Build Android APK Locally
To build the `.apk` file locally:

1. **Install Prerequisites**:
   - Ensure **Android Studio** and JDK 17/21 are installed.
2. **Build Web & Sync Native Assets**:
   ```bash
   npm run build:mobile
   ```
3. **Open Android Project in Android Studio**:
   ```bash
   npx cap open android
   ```
4. **Generate APK**:
   - In Android Studio, go to **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
   - Once completed, click **locate** to retrieve `app-debug.apk`.

---

### Option 2: Run as Mobile Web / PWA on Any Device (Instant Access)
1. Ensure your web app is running locally:
   ```bash
   npm run dev -- --host
   ```
2. Open your mobile browser (Chrome / Safari) and navigate to `http://<YOUR_LOCAL_IP>:5173`.
3. Tap **Add to Home Screen** / **Install App** to launch SHIPMATE like a native mobile app on your phone!

---

## 🚀 Web Application Setup & Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Setup Environment Variables**:
   Create a `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=YOUR_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

3. **Run Web Application**:
   ```bash
   npm run dev
   ```

---

## 🛠 Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Native Bridge**: Capacitor 8 (Android)
- **CI/CD Build**: GitHub Actions (Automated APK Artifacts & Release)
- **Backend & Auth**: Supabase Database & Realtime Chat
