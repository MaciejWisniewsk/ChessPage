const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");

router.get("/credentials", (req, res) => {
  res.send({
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    url: process.env.MQTT_URL,
  });
});

module.exports = router;
