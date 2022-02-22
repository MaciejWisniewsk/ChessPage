(function () {
  $.get("/mqtt/credentials", ({ password, url, username }) => {
    const user = JSON.parse(userStringified);
    const client = mqtt.connect(url, { username, password });
    client.subscribe("rooms/new");
    client.subscribe("rooms/patch");
    client.subscribe("rooms/delete");
    client.on("message", (topic, message) => {
      const room = JSON.parse(message.toString());
      switch (topic) {
        case "rooms/new":
          if (user._id !== room.host._id) {
            $("#availableRooms")
              .append(`<div class="card-body d-flex justify-content-between" id="${room._id}">
                                                  <h5 class="card-title">${room.name}</h5>
                                                  <form action="/rooms/${room._id}?_method=PATCH" method="POST" class="validated-form" novalidate>
                                                      <button class="btn btn-primary">Join room</a>
                                                  </form>
                                                  </div>`);
          }
          break;
        case "rooms/patch":
          $(`#${room._id}`).remove();
          if (user._id === room.host) {
            $("#activeRooms")
              .append(`<div class="card-body d-flex justify-content-between" id="${room._id}">
                                                  <h5 class="card-title">${room.name}</h5>
                                                  <a class="btn btn-warning" href="/rooms/${room._id}">Play</a>
                                                  </div>`);
          }
          break;
        case "rooms/delete":
          $(`#${room._id}`).remove();
        default:
          return;
      }
    });
  });
})();
