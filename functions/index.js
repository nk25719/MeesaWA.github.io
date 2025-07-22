require("dotenv").config();
const functions = require("firebase-functions");
const mqtt = require("mqtt");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const { sendNotification } = require('./firebase');
await sendNotification(`New message from ${username}`, text, recipientToken);

const MQTT_URL = process.env.MQTT_URL;
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;
const MQTT_TOPIC = process.env.MQTT_TOPIC;

const client = mqtt.connect(MQTT_URL, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
  protocol: "wss",
  reconnectPeriod: 1000
});

client.on("connect", () => {
  console.log("✅ MQTT Connected");
  client.subscribe(MQTT_TOPIC, (err) => {
    if (err) console.error("❌ MQTT Subscription error:", err);
    else console.log(`✅ Subscribed to ${MQTT_TOPIC}`);
  });
});

client.on("message", async (topic, message) => {
  try {
    console.log("📥 Received message on topic:", topic);
    console.log("🧾 Raw payload:", message.toString());

    const data = JSON.parse(message.toString());
    const [, room] = topic.split("/");
    const { id, username, text, timestamp } = data;
    if (!id || !text) return;

    await admin.firestore().collection("messages").doc(id).set({
      username,
      room,
      message: text,
      timestamp
    });

    const dummyUserToken = "FCM_DEVICE_TOKEN_HERE"; // Replace with real token
    await admin.messaging().send({
      notification: { title: `New message from ${username}`, body: text },
      token: dummyUserToken
    });
  } catch (err) {
    console.error("❌ Message handler error:", err.message);
  }
});

// exports.mqttBridge = functions.runWith({ timeoutSeconds: 540 }).pubsub
//   .schedule("every 5 minutes")
//   .onRun((context) => {
//     console.log("⏱ MQTT bridge running");
//     return null;
//   });
exports.mqttBridge = functions.pubsub
  .schedule("every 5 minutes")
  .onRun((context) => {
    console.log("⏱ MQTT bridge running");
    return null;
  });

