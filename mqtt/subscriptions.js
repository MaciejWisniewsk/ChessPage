const client = require("./connection");

client.subscribe("/server/rooms/+/chat");
client.subscribe("/server/rooms/+/game/move");
client.subscribe("/server/rooms/+/game/over");
