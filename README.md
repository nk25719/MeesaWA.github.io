


                +------------------------+
                |  MQTT Broker (TLS)     |
                |  (HiveMQ/EMQX/Mosquitto)|
                +------------------------+
                        ▲        ▲
                MQTT    |        | MQTT
                        |        |
+-------------+   MQTT.js   +------------+
| Web Chat UI | <=========> | Node.js App|
+-------------+             +------------+
                                 ▲
                  DB (SQLite) + Push Notifs (FCM)
