const client = require('./connection')

client.subscribe('/rooms/+/chat');
client.subscribe('/rooms/+/game/move')
client.subscribe('/rooms/+/game/over')