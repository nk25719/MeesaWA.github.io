// firebase.js (backend notification utility)

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// ✅ Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// ✅ Exported notification function
const sendNotification = async (title, body, token) => {
  try {
    await admin.messaging().send({
      notification: { title, body },
      token,
    });
    console.log('✅ Notification sent to:', token);
  } catch (error) {
    console.error('❌ Failed to send notification:', error.message);
  }
};

module.exports = { sendNotification };
