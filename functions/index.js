require("dotenv").config();
const functions = require("firebase-functions");
const mqtt = require("mqtt");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const { sendNotification } = require('./firebase');
// Removed invalid top-level await sendNotification(...)

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
    const { id, username, text, timestamp } = data;
    if (!id || !text || !username) return;

    const topicParts = topic.split("/");

    if (topicParts[1] === "MushRoom") {
      const room = topicParts[2];

      await admin.firestore().collection("messages").doc(id).set({
        username,
        room,
        text: text,
        timestamp
      });

      console.log(`✅ Room message saved to /messages/${id}`);

      const dummyToken = "FCM_DEVICE_TOKEN_HERE";
      await admin.messaging().send({
        notification: { title: `New message from ${username}`, body: text },
        token: dummyToken
      });

    } else if (topicParts[1] === "direct") {
      const convoId = topicParts[2];
      const senderId = convoId.split("_").includes(data.senderId)
        ? data.senderId
        : convoId.split("_")[0];

      const convoRef = admin.firestore().collection("conversations").doc(convoId);

      await convoRef.collection("messages").doc(id).set({
        senderId,
        content: text,
        timestamp: timestamp || new Date(),
        read: false
      });

      await convoRef.set({
        participants: convoId.split("_"),
        lastMessage: text,
        lastSender: senderId,
        updatedAt: new Date()
      }, { merge: true });

      console.log(`✅ DM saved to /conversations/${convoId}/messages/${id}`);

      const recipientId = convoId.split("_").find(uid => uid !== senderId);
      const userSnap = await admin.firestore().collection("users").doc(recipientId).get();
      const fcmToken = userSnap.data()?.fcmToken;

      if (fcmToken) {
        await admin.messaging().send({
          notification: {
            title: `New DM from ${username}`,
            body: text
          },
          token: fcmToken
        });
        console.log(`✅ DM Notification sent to ${recipientId}`);
      } else {
        console.warn(`⚠️ No FCM token for ${recipientId}`);
      }
    }

  } catch (err) {
    console.error("❌ Message handler error:", err.message);
  }
});

exports.mqttBridge = functions.pubsub
  .schedule("every 5 minutes")
  .onRun((context) => {
    console.log("⏱ MQTT bridge running");
    return null;
  });