(function () {
  $.get("/mqtt/credentials", ({ username, password, url }) => {
    const user = JSON.parse(userStringified);
    const room = JSON.parse(roomStringified);
    const client = mqtt.connect(url, { username, password });

    const chatTopic = `/rooms/${room._id}/chat`;
    client.subscribe(chatTopic);

    client.on("message", function (topic, message) {
      switch (topic) {
        case chatTopic:
          const { _id, username, text } = JSON.parse(message.toString());
          if (_id === user._id) {
            $("#chatMessages").append(
              `<div class="list-group-item list-group-item-light">You: ${text}</div>`
            );
          } else if (username === "Bot") {
            $("#chatMessages").append(
              `<div class="list-group-item list-group-item-warning">Bot: ${text}</div>`
            );
          } else {
            $("#chatMessages").append(
              `<div class="list-group-item list-group-item-dark">${username}: ${text}</div>`
            );
          }
          break;
        default:
          return {};
      }
    });

    $("#sendMessage").submit((event) => {
      event.preventDefault();
      const text = $("#message").val().replace(/\n/g, " ");
      $("#message").val("");
      const { _id, username } = user;
      if (!text.length) return;
      const dataToSend = {
        _id,
        username,
        text,
      };
      client.publish(
        `/server/rooms/${room._id}/chat`,
        JSON.stringify(dataToSend)
      );
    });

    const playerColor = user._id === room.host ? "white" : "black";
    const game = new Chess();
    const whiteSquareGrey = "#a9a9a9";
    const blackSquareGrey = "#696969";
    const gameMoveTopic = `/rooms/${room._id}/game/move`;
    const gameMoveServerTopic = `/server/rooms/${room._id}/game/move`;
    const gameOverTopic = `/rooms/${room._id}/game/over`;
    const gameOverServerTopic = `/server/rooms/${room._id}/game/over`;
    const opponent_id = user._id === room.host ? room.guest : room.host;

    client.subscribe(gameMoveTopic);
    client.subscribe(gameOverTopic);
    room.gameFen && game.load(room.gameFen);

    const isMoveEnabled = () => game.turn() === playerColor[0];

    function removeGreySquares() {
      $("#board .square-55d63").css("background", "");
    }

    function greySquare(square) {
      const $square = $("#board .square-" + square);

      let background = whiteSquareGrey;
      if ($square.hasClass("black-3c85d")) {
        background = blackSquareGrey;
      }

      $square.css("background", background);
    }

    function onDragStart(_, piece, _, _) {
      if (game.game_over()) return false;

      if (
        (game.turn() === "w" && piece.search(/^b/) !== -1) ||
        (game.turn() === "b" && piece.search(/^w/) !== -1) ||
        !isMoveEnabled()
      ) {
        return false;
      }
    }

    function onDrop(source, target) {
      removeGreySquares();

      const move = game.move({
        from: source,
        to: target,
        promotion: "q",
      });

      if (move === null) return "snapback";
      const { username, _id } = user;
      const dataToSend = {
        username,
        _id,
        move,
      };
      client.publish(gameMoveServerTopic, JSON.stringify(dataToSend));
    }

    function onSnapEnd() {
      board.position(game.fen());
    }

    function onMouseoverSquare(square, _) {
      if (isMoveEnabled()) {
        const moves = game.moves({
          square: square,
          verbose: true,
        });

        if (moves.length === 0) return;

        greySquare(square);

        moves.forEach((_, index) => greySquare(moves[index].to));
      }
    }

    function onMouseoutSquare(_, _) {
      removeGreySquares();
    }

    client.on("message", (topic, message) => {
      switch (topic) {
        case gameMoveTopic:
          const { _id, move } = JSON.parse(message.toString());
          if (_id !== user._id) {
            game.move(move);
            board.position(game.fen());
          }
          break;
        case gameOverTopic:
          $("#surrenderButton").hide();
          const { isDraw, winner_id, surrender } = JSON.parse(
            message.toString()
          );
          if (isDraw) {
            $("#room").prepend(
              '<div class="alert alert-warning alert-dismissible fade show my-3" role="alert">The game enden in draw! The room will be closed in 10s!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
            );
          } else if (winner_id === user._id) {
            const surrenderMessage = surrender
              ? "The opponent gave up this game!"
              : "";
            $("#room").prepend(
              `<div class="alert alert-success alert-dismissible fade show my-3" role="alert">You won! The room will be closed in 10s!\n${surrenderMessage}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
            );
          } else {
            const surrenderMessage = surrender
              ? "You surrendered the game!"
              : "";
            $("#room").prepend(
              `<div class="alert alert-danger alert-dismissible fade show my-3" role="alert">You lost! The room will be closed in 10s!\n${surrenderMessage}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
            );
          }
          window.scrollTo(0, 0);
          setTimeout(() => window.location.replace("/rooms"), 10000);
          break;
        default:
          return {};
      }
    });

    const config = {
      showNotation: false,
      draggable: true,
      pieceTheme: "/images/chesspieces/{piece}.png",
      position: game.fen(),
      orientation: playerColor,
      onDragStart,
      onDrop,
      onSnapEnd,
      onMouseoutSquare,
      onMouseoverSquare,
    };
    const board = Chessboard("board", config);
    $(window).resize(board.resize);

    $("#leaveGameButton").on("click", () => {
      client.publish(
        gameOverServerTopic,
        JSON.stringify({ winner_id: opponent_id, surrender: true })
      );
      $("#surrenderButton").hide();
      $("#leaveGameModal").modal("hide");
    });
  });
})();
