const client = require('./connection');
const Room = require('../models/room');
const User = require('../models/user');
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
    } else if (topic.match(/^\/rooms\/[^/]*\/game\/over$/)) {
        const room_id = topic.split('/')[2];
        const room = await Room.findById(room_id);
        const { winner_id } = JSON.parse(message.toString())
        if (winner_id) {
            const loser_id = room.host.equals(winner_id) ? room.guest : room.host;
            const winner = await User.findById(winner_id);
            const loser = await User.findById(loser_id);
            winner.points += 1;
            loser.points ? loser.points -= 1 : {};
            await winner.save();
            await loser.save();
        }
        setTimeout(async () => {
            await room.remove()
        }, 8000)
    }
});