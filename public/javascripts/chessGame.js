const playerColor = user._id === room.host ? 'white' : 'black';
const game = new Chess();
const whiteSquareGrey = '#a9a9a9'
const blackSquareGrey = '#696969'
const gameMoveTopic = `/rooms/${room._id}/game/move`
const gameOverTopic = `/rooms/${room._id}/game/over`

client.subscribe(gameMoveTopic)
client.subscribe(gameOverTopic)
room.gameFen && game.load(room.gameFen);

const isMoveEnabled = () => game.turn() === playerColor[0]

function removeGreySquares() {
    $('#board .square-55d63').css('background', '')
}

function greySquare(square) {
    const $square = $('#board .square-' + square)

    let background = whiteSquareGrey
    if ($square.hasClass('black-3c85d')) {
        background = blackSquareGrey
    }

    $square.css('background', background)
}



function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false

    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
        (!isMoveEnabled())) {
        return false
    }
}

function onDrop(source, target) {
    removeGreySquares()

    const move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    })

    if (move === null) return 'snapback';
    const dataToSend = {
        ...user,
        move,
        fen: game.fen()
    }
    client.publish(gameMoveTopic, JSON.stringify(dataToSend))
    updateStatus()
}

function onSnapEnd() {
    board.position(game.fen())
}

function onMouseoverSquare(square, piece) {
    if (isMoveEnabled()) {
        const moves = game.moves({
            square: square,
            verbose: true
        })

        if (moves.length === 0) return

        greySquare(square)

        moves.forEach((move, index) => greySquare(moves[index].to))
    }
}

function onMouseoutSquare(square, piece) {
    removeGreySquares()
}


function updateStatus() {
    let status = ''

    let moveColor = 'White'
    if (game.turn() === 'b') {
        moveColor = 'Black'
    }

    if (game.in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.';

    }
    else if (game.in_draw()) {
        status = 'Game over, drawn position';
        console.log('publishing...')
        client.publish(gameOverTopic, JSON.stringify({ isDraw: true }))
    }
    if (game.in_check()) {
        status = moveColor + ' to move'
        if (game.in_check()) {
            status += ', ' + moveColor + ' is in check'
        }
    }

    //bot has special account
    statusChatMessage = {
        text: status,
        username: 'Bot',
        _id: "61eae5eb776b4ec37f73e851"
    }
    client.publish(chatTopic, JSON.stringify(statusChatMessage))
}

!room.gameFen && updateStatus()

client.on('message', (topic, message) => {
    console.log('elloo', topic, message)
    switch (topic) {
        case gameMoveTopic:
            const { _id, move } = JSON.parse(message.toString())
            if (_id !== user._id) {
                game.move(move)
                board.position(game.fen())
            }
            break;
        case gameOverTopic:
            const { isDraw } = JSON.parse(message.toString());
            if (isDraw) {
                $('#room').prepend('<div class="alert alert-warning alert-dismissible fade show my-5" role="alert">The game enden in draw! The room will be close in 10s!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>')
                setTimeout(() => window.location.replace("/rooms"), 10000)
            }
            break;
        default:
            return {}
    }
})

const config = {
    showNotation: false,
    draggable: true,
    pieceTheme: '/images/chesspieces/{piece}.png',
    position: game.fen(),
    orientation: playerColor,
    onDragStart,
    onDrop,
    onSnapEnd,
    onMouseoutSquare,
    onMouseoverSquare
}
const board = Chessboard('board', config)
$(window).resize(board.resize)