const client = require('./connection');

const updateGameStatus = (game, chatTopic, gameOverTopic, whiteId, blackId) => {
    const botAccount = {
        username: 'Bot',
        _id: "61eae5eb776b4ec37f73e851"
    }
    let status = ''

    let moveColor = 'White'
    if (game && game.turn() === 'b') {
        moveColor = 'Black'
    }

    if (game && game.in_checkmate()) {
        const winner_id = moveColor === 'White' ? blackId : whiteId;
        return client.publish(gameOverTopic, JSON.stringify({ winner_id }))
    }
    else if (game && game.in_draw()) {
        return client.publish(gameOverTopic, JSON.stringify({ isDraw: true }))
    }
    else {
        status = moveColor + ' to move'
        if (game && game.in_check()) {
            status += ', ' + moveColor + ' is in check'
        }
    }

    //bot has special account
    statusChatMessage = {
        text: status,
        ...botAccount
    }
    client.publish(chatTopic, JSON.stringify(statusChatMessage))
}

module.exports = updateGameStatus