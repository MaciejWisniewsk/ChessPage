const mqtt = require('mqtt')

const client = mqtt.connect("ws://localhost:8000/mqtt");

module.exports = client;