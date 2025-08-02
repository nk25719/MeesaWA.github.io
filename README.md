# Meesa PWA Chat App

A real-time, installable, and offline-capable chat application built entirely with **Firebase** and **Progressive Web App (PWA)** technologies.

---

## 🌐 Live Demo

👉 **[https://meesa-wa.web.app](https://meesa-wa.web.app)**

---

## 📦 Features

* ✅ Real-time messaging via **Firebase Firestore**
* ✅ Push notifications using **Firebase Cloud Messaging**
* ✅ Full **PWA** support (installable on Android/iOS)
* ✅ **Offline mode** with service worker caching
* ✅ Mobile- and desktop-friendly interface
* ✅ **Message history** stored and synced with Firestore
* ✅ Local caching for performance

---

## 🗂 Project Structure



```
meesa-pwa/
├── README.md # Project documentation
├── firebase.json # Firebase hosting config
├── .firebaserc # Firebase project config
├── public/ # Frontend (PWA)
│ ├── index.html
│ ├── sw.js
│ ├── manifest.json
│ ├── icon-192.png
│ ├── icon-512.png
│ ├── splash.png
│ └── firebase-messaging-sw.js
├── functions/ # Optional backend (cloud functions)
│ ├── .env
│ ├── package.json
│ ├── index.js
│ └── serviceAccountKey.json

```
 

## 🚀 Deploying to Firebase

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Authenticate

Use **interactive login** or a **service account token**:

```bash
firebase login
# OR use non-interactive
firebase deploy --token "$FIREBASE_TOKEN"
```

### 3. Deploy

```bash
firebase deploy
```

---

## 🧪 Testing the PWA

* ✅ Visit [meesa-wa.web.app](https://meesa-wa.web.app) on mobile
* ✅ Add to home screen
* ✅ Try offline mode

---

## 🔐 Notes

* Firebase messaging API key is public by design (safe for frontend use)

---

## 🛠 Built With

- [Firebase Hosting](https://firebase.google.com/products/hosting)
- [Firebase Firestore](https://firebase.google.com/products/firestore)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Progressive Web App (PWA) APIs](https://web.dev/progressive-web-apps/)


---

## 📄 License

### The MIT License (MIT)

Copyright © 2021 TousstNicolas 

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## 🙋‍♀️ Maintainer

**Nagham** — Biomedical Engineer & Inventor

Contributions welcome. Reach out for collabs or improvements!

