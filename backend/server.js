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

const client = mqtt.connect(MQTT_URL, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
  protocol: 'wss',
  reconnectPeriod: 1000
});

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  client.subscribe(MQTT_TOPIC, (err) => {
    if (err) console.error('❌ Subscribe error:', err.message);
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
