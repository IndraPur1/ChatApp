# 💬 ChatApp - Real-time Chat Application

Aplikasi chat real-time yang dibangun dengan **React Native**, **Firebase Firestore**, dan **Firebase Authentication**. Aplikasi ini mendukung pengiriman pesan teks dan gambar dengan fitur login/register.

## ✨ Features

- 🔐 Authentication (Login & Register) dengan Firebase Auth
- 💬 Real-time messaging dengan Firestore
- 🖼️ Kirim gambar (base64)
- 👤 Username management
- 🔄 Auto-login
- 📱 Offline chat history
- 🚀 Optimized performance

## 📋 Prerequisites

Sebelum menjalankan project ini, pastikan Anda sudah install:

- **Node.js** (v16 atau lebih baru)
- **Java JDK 17** (untuk Android build)
- **Android Studio** dengan:
  - Android SDK
  - Android Emulator
  - Android SDK Platform 36
  - Android Build Tools 36.0.0
- **npm** atau **yarn**

> **Note**: Pastikan environment variable `ANDROID_HOME` sudah di-set dengan benar.

## 🚀 Installation & Setup

### 1️⃣ Clone & Install Dependencies

```bash
# Clone repository (jika dari git)
git clone <repository-url>
cd ChatApp

# Install dependencies
npm install

# Atau menggunakan yarn
yarn install
```

### 2️⃣ Firebase Configuration

Project ini sudah dikonfigurasi dengan Firebase. File konfigurasi ada di:
- `firebase.ts` - Firebase Web SDK config
- `android/app/google-services.json` - Android Firebase config

> **Note**: Untuk production, sebaiknya ganti dengan Firebase project Anda sendiri.

### 3️⃣ Setup Android Emulator

#### **Buka Android Studio**
1. Buka **Android Studio**
2. Klik **More Actions** → **Virtual Device Manager** (atau **AVD Manager**)
3. Klik **Create Virtual Device**
4. Pilih device (recommended: **Pixel 5** atau **Pixel 7**)
5. Pilih system image: **API Level 36** (Android 16) atau **API Level 34** (Android 14)
6. Klik **Finish**

#### **Start Emulator**
Ada 2 cara untuk menjalankan emulator:

**Cara 1: Via Android Studio**
```bash
# Buka AVD Manager di Android Studio
# Klik tombol ▶️ (Play) di sebelah emulator yang ingin dijalankan
```

**Cara 2: Via Terminal**
```bash
# List semua AVD yang tersedia
emulator -list-avds

# Jalankan emulator (ganti 'Pixel_5_API_36' dengan nama AVD Anda)
emulator -avd Pixel_5_API_36
```

#### **Verifikasi Emulator Berjalan**
```bash
# Cek device yang terhubung
adb devices

# Output seharusnya menampilkan emulator, contoh:
# emulator-5554   device
```

## 📱 Running the App

### **Metode 1: Menggunakan npx react-native (Recommended)**

```bash
# Terminal 1: Start Metro Bundler
npm start
# atau
npx react-native start

# Terminal 2: Run di Android Emulator
npx react-native run-android
```

### **Metode 2: Build Manual dengan Gradle**

```bash
# Set Java 17 (macOS)
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# Build APK
cd android
./gradlew assembleDebug

# Install ke emulator
adb install app/build/outputs/apk/debug/app-debug.apk

# Kembali ke root dan start Metro
cd ..
npm start
```

### **Metode 3: Via Android Studio**

```bash
# Start Metro dulu
npm start

# Kemudian buka Android Studio:
# 1. Open Project → Pilih folder 'android'
# 2. Klik Run ▶️ (hijau) di toolbar
# 3. Pilih emulator yang sudah berjalan
```

## 🎯 Using the App

### **First Time Setup**

1. **Register Account**
   - Buka app
   - Klik "Belum punya akun? Register"
   - Isi **Username**, **Email**, dan **Password**
   - Klik **Register**

2. **Login**
   - Masukkan **Email** dan **Password**
   - Klik **Login**
   - App akan otomatis login di launch berikutnya

3. **Chat Features**
   - ✍️ Ketik pesan di input box
   - 📤 Klik **Kirim** untuk mengirim pesan teks
   - 🖼️ Klik tombol **Img** untuk kirim gambar
   - 🚪 Klik **Logout** di header untuk keluar

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

## 📚 Learn More

Untuk mempelajari lebih lanjut tentang teknologi yang digunakan:

- [React Native Documentation](https://reactnative.dev) - React Native docs
- [Firebase Documentation](https://firebase.google.com/docs) - Firebase guides
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript docs
- [React Navigation](https://reactnavigation.org/) - Navigation library
- [Android Developer Guide](https://developer.android.com/) - Android development

## 📞 Support

Jika mengalami masalah atau punya pertanyaan:
- Baca bagian **Troubleshooting** di atas
- Check [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting)
- Create an issue di repository

---

**Happy Coding! 🚀**

Made with ❤️ using React Native & Firebase
