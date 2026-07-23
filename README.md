# 🚢 SHIPMATE PDD - Peer-to-Peer Delivery & Tracking System

SHIPMATE is a peer-to-peer package delivery platform connecting senders with travelers to transport packages safely, fast, and affordably.

---

## 📱 Mobile App (Android APK) Installation & Download Guide

You can run SHIPMATE directly on your Android mobile device either by building the native APK or by installing it as a PWA / Capacitor App!

### Option 1: Build Android APK locally (Recommended for Device Testing)
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
   - Transfer `app-debug.apk` to your Android mobile device and install it!

---

### Option 2: Run as Mobile Web / PWA on Any Mobile Device (Instant Access)
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
- **Backend & Auth**: Supabase Database & Realtime Chat
