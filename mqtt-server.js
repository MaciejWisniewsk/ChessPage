const mqtt = require('mqtt')
const Room = require('./models/room');
const ChatMessage = require('./models/chatMessage');
const mongoose = require('mongoose')

const dbConnDataMongo = {
    host: process.env.MONGO_HOST || '127.0.0.1',
    port: process.env.MONGO_PORT || 27017,
    database: process.env.MONGO_DATABASE || 'chess'
};

mongoose
    .connect(`mongodb://${dbConnDataMongo.host}:${dbConnDataMongo.port}/${dbConnDataMongo.database}`)
    .then(response => {
        console.log(`Connected to MongoDB. Database name: "${response.connections[0].name}"`)
    })
    .catch(error => console.error('Error connecting to MongoDB', error));

const client = mqtt.connect("ws://localhost:8000/mqtt");

client.subscribe('/rooms/+/chat');

client.on('connect', () => {
    console.log('connnected!')
});

// const sub2regex = (topic) => {
//     return new RegExp(`^${topic}\$`
//         .replaceAll('+', '[^/]*')
//         .replace('/#', '(|/.*)')
//     )
// };

client.on('message', async function (topic, message) {
    if (topic.match(/^\/rooms\/[^/]*\/chat$/)) {
        const room_id = topic.split('/')[2]
        const { _id, text } = JSON.parse(message.toString())
        const room = await Room.findById(room_id);
        const chatMessage = new ChatMessage({ text, author: _id });
        room.chatMessages.push(chatMessage);
        await chatMessage.save();
        await room.save();
    }
});