require("dotenv").config();
const functions = require("firebase-functions");
const mqtt = require("mqtt");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const { sendNotification } = require('./firebase');

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
    const { id, username, text, timestamp, senderId } = data;
    if (!id || !text || !username) return;

    const topicParts = topic.split("/");

    // ✅ Public room message: chat/<room>/public
    if (topicParts[0] === "chat" && topicParts[2] === "public") {
      const room = topicParts[1];

      await admin.firestore().collection("messages").doc(id).set({
        username,
        room,
        text,
        timestamp
      });

      console.log(`✅ Room message saved to /messages/${id}`);

      const dummyToken = "FCM_DEVICE_TOKEN_HERE";
      await admin.messaging().send({
        notification: { title: `New message from ${username}`, body: text },
        token: dummyToken
      });

    // ✅ Direct message: direct/<convoId>
    } else if (topicParts[0] === "direct") {
      const convoId = topicParts[1];
      const resolvedSenderId = convoId.split("_").includes(senderId)
        ? senderId
        : convoId.split("_")[0];

      const convoRef = admin.firestore().collection("conversations").doc(convoId);

      await convoRef.collection("messages").doc(id).set({
        senderId: resolvedSenderId,
        content: text,
        timestamp: timestamp || new Date(),
        read: false
      });

      await convoRef.set({
        participants: convoId.split("_"),
        lastMessage: text,
        lastSender: resolvedSenderId,
        updatedAt: new Date()
      }, { merge: true });

      console.log(`✅ DM saved to /conversations/${convoId}/messages/${id}`);

      const recipientId = convoId.split("_").find(uid => uid !== resolvedSenderId);
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

    } else {
      console.warn("⚠️ Unrecognized topic structure:", topic);
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