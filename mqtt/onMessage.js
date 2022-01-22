const client = require('./connection');
const Room = require('../models/room');
const ChatMessage = require('../models/chatMessage');

client.on('message', async function (topic, message) {
    if (topic.match(/^\/rooms\/[^/]*\/chat$/)) {
        const room_id = topic.split('/')[2]
        const { _id, text } = JSON.parse(message.toString())
        const room = await Room.findById(room_id);
        const chatMessage = new ChatMessage({ text, author: _id });
        room.chatMessages.push(chatMessage);
        await chatMessage.save();
        await room.save();
    } else if (topic.match(/^\/rooms\/[^/]*\/game\/move$/)) {
        const room_id = topic.split('/')[2]
        const { fen } = JSON.parse(message.toString())
        const room = await Room.findById(room_id);
        room.gameFen = fen;
        await room.save();
    }
});