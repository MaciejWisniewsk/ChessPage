const mqtt = require("mqtt");

const options = {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
};

const client = mqtt.connect(process.env.MQTT_URL, options);

module.exports = client;
