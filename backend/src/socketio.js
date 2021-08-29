const Rooms = require("./index");

function isError(variable) {
  return Object.getPrototypeOf(variable) === Error.prototype;
}

function makeResponse(input) {
  if (isError(input)) return { success: false, message: input.message };
  else return { success: true, message: input };
}

function configSocket(socket, io, getAccessToken) {
  socket.on("join-room-host", async (secret, callback) => {
    const roomId = Rooms.joinRoomHost(socket.id, secret, (newQueue) =>
      io.to(roomId).emit("new-queue", newQueue)
    );

    if (isError(roomId)) {
      callback(makeResponse(roomId));
      console.error(roomId);
    } else {
      socket.join(roomId);
      callback(makeResponse(Rooms.getRoom(roomId)));
    }
  });

  socket.on("probe-room", (room, callback) =>
    callback(makeResponse(Rooms.probeRoom(room, socket.id)))
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
      callback(true);
    } else {
      callback(false);
    }
  });

  socket.on("disconnect", async () => {
    const [type, roomId, newGuests] = await Rooms.leaveRoom(socket.id);

    if (type === "owner") {
      io.to(roomId).emit("room-ended");
    } else if (type === "participant") {
      io.to(roomId).emit("update-participants", newGuests);
    }
  });
}

module.exports = configSocket;
