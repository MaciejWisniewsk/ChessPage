const user = JSON.parse(userStringified);
const room = JSON.parse(roomStringified)
const client = mqtt.connect("ws://localhost:8000/mqtt");
const chatTopic = `/rooms/${room._id}/chat`
client.subscribe(chatTopic)
client.on('message', function (topic, message) {
    switch (topic) {
        case chatTopic:
            const { _id, username, text } = JSON.parse(message.toString())
            if (_id === user._id) {
                $("#chatMessages").append(`<div class="list-group-item list-group-item-light">You: ${text}</div>`);
            } else {
                $("#chatMessages").append(`<div class="list-group-item list-group-item-dark">${username}: ${text}</div>`);
            }
            break;
        default:
            return {}
    }
})

$("#sendMessage").submit(event => {
    event.preventDefault();
    const text = $('#message').val()
    $('#message').val('');
    if (!text.length) return {}
    const dataToSend = {
        ...user,
        text
    }
    client.publish(chatTopic, JSON.stringify(dataToSend))
});