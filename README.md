# Meesa PWA Chat App

A real-time, installable, offline-capable chat application built with MQTT, Firebase, and PWA technologies.

---

## 🌐 Live Demo

**[https://meesa-wa.web.app](https://meesa-wa.web.app)**

---

## 📦 Features

* ✅ Real-time messaging via **MQTT (HiveMQ Cloud)**
* ✅ Firebase push notification integration
* ✅ Full **Progressive Web App (PWA)** support
* ✅ Offline mode with service worker caching
* ✅ Works on mobile and desktop
* ✅ Installable on Android/iOS
* ✅ Message history saved locally

---

## 🗂 Directory Structure

```
meesa-pwa/
├── README.md                    # Project documentation
├── firebase.json               # Firebase hosting config
├── .firebaserc                 # Firebase project config
├── package.json                # Backend dependencies
├── mqtt-messages.db            # Local SQLite DB
├── public/                     # Frontend (PWA)
│   ├── index.html
│   ├── sw.js
│   ├── manifest.json
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── splash.png
│   └── firebase-messaging-sw.js
├── backend/                    # Node.js MQTT + Firebase bridge
│   ├── server.js
│   ├── db.js
│   ├── firebase.js
│   └── serviceAccountKey.json

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
* Use service account for secure backend notifications (already included)

---

## 🛠 Built With

* [Firebase Hosting](https://firebase.google.com/products/hosting)
* [MQTT.js](https://github.com/mqttjs/MQTT.js)
* [HiveMQ Cloud](https://www.hivemq.com/mqtt-cloud-broker/)
* [Firebase Messaging](https://firebase.google.com/docs/cloud-messaging)

---

## 📄 License

MIT (or specify your preferred license here)

---

## 🙋‍♀️ Maintainer

**Nagham** — Biomedical Engineer & Inventor

Contributions welcome. Reach out for collabs or improvements!

