const Rooms = require("./index");

function isError(variable) {
  console.log("iserror", variable);
  return Object.getPrototypeOf(variable) === Error.prototype;
}

function makeResponse(input) {
  if (isError(input))
    return { success: false, message: input.message, noRoom: input.noRoom };
  else return { success: true, message: input };
}

function configSocket(socket, io, getAccessToken, getAccessToken) {
  socket.on("join-room-host", async (secret, callback) => {
    const msg = Rooms.joinRoomHost(socket.id, secret, (subject, message) =>
      io.to(roomId).emit(subject, message)
    );
    console.log("gotten msg", msg);

    if (isError(msg)) {
      callback(makeResponse(msg));
      console.error(msg);
    } else {
      socket.join(msg.roomId);
      const message = [Rooms.getRoom(msg.roomId), msg.permanentRoom];
      const response = makeResponse(message);
      console.log("response", response);
      callback(response);
    }
  });

  socket.on("toggle-permanent", (value) =>
    Rooms.togglePermanentRoom(socket.id, value)
  );

  socket.on("probe-room", (room, callback) =>
    callback(Rooms.probeRoom(room, socket.id))
  );

  socket.on("join-room", (roomId, callback) => {
    const room = Rooms.joinRoom(roomId, socket.id);

    if (!isError(room)) {
      socket.join(room.roomId);
      callback(makeResponse([room.guests, room.queue, getAccessToken()]));
      socket.to(room.roomId).emit("update-participants", room.guests);
    } else {
      callback(makeResponse(room));
      console.error(room);
    }
  });

  socket.on("put-in-queue", async (song, callback) => {
    const [roomId, track_json] = await Rooms.putInQueue(song, socket.id);

    if (!isError(roomId)) {
      io.to(roomId).emit("new-track", track_json);
      callback(makeResponse(true));
    } else {
      callback(makeResponse(roomId));
    }
  });

  socket.on("update-device", (deviceId) =>
    Rooms.updatePlayingDevice(deviceId, socket.id)
  );

  socket.on("close-room", async (callback) => {
    const roomId = Rooms.closeRoom(socket.id, true);

    if (roomId) {
      io.to(roomId).emit("room-ended");
      socket.leave(roomId);
      callback(true);
    } else {
      callback(false);
    }
  });

  socket.on("search-token", (callback) => callback(getAccessToken()));

  socket.on("disconnect", async () => {
    const [type, roomId, newGuests] = await Rooms.leaveRoom(socket.id, (id) =>
      socket.leave(id)
    );

    if (type === "owner") {
      io.to(roomId).emit("room-ended");
    } else if (type === "participant") {
      io.to(roomId).emit("update-participants", newGuests);
    }
  });
}

module.exports = configSocket;
