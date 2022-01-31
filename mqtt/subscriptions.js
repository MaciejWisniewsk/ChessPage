const client = require('./connection')

client.subscribe('/server/rooms/+/chat');
client.subscribe('/rooms/+/game/move')
client.subscribe('/rooms/+/game/over')