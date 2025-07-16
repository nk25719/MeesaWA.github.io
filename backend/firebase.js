const admin = require('firebase-admin');
const { FIREBASE_SERVER_KEY } = process.env;

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const sendNotification = async (title, body, token) => {
  try {
    await admin.messaging().send({
      notification: { title, body },
      token
    });
    console.log('✅ Notification sent');
  } catch (error) {
    console.error('❌ Notification error:', error);
  }
};

module.exports = { sendNotification };
