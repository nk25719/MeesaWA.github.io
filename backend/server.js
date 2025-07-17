require('dotenv').config();
const mqtt = require('mqtt');
const { saveMessage } = require('./db');
const { sendNotification } = require('./firebase');

const {
  MQTT_URL,
  MQTT_USERNAME,
  MQTT_PASSWORD,
  MQTT_TOPIC
} = process.env;

const client = mqtt.connect(process.env.MQTT_URL, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  protocol: 'wss',
  reconnectPeriod: 1000
});

client.on('connect', () => {
  console.log('✅ Connected to HiveMQ');
  client.subscribe(process.env.MQTT_TOPIC, (err) => {
    if (err) console.error('❌ Subscription error:', err);
    else console.log(`✅ Subscribed to ${process.env.MQTT_TOPIC}`);
  });
});

client.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    const [_, room] = topic.split('/');
    const { id, username, text, timestamp } = data;

    if (!id || !text) return;

    saveMessage({
      id,
      username,
      room,
      message: text,
      timestamp: timestamp || new Date().toISOString()
    });

    const dummyUserToken = 'FCM_DEVICE_TOKEN_HERE';
    sendNotification(`New message from ${username}`, text, dummyUserToken);

  } catch (err) {
    console.error('❌ Message processing error:', err.message);
  }
});
