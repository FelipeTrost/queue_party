// Env variable contains the socket connection and the error dispatcher, I should've used ts I know

export function joinRoomHost(env, roomSecret) {
  return new Promise((resolve, reject) => {
    env.socket.emit("join-room-host", roomSecret, (response) => {
      if (!response.success) {
        env.errorDispatcher(response.message);
        return reject();
      }

      resolve(response.message);
    });
  });
}

export function joinRoom(env, roomId) {
  return new Promise((resolve, reject) => {
    env.socket.emit("join-room", roomId, (response) => {
      if (!response.success) {
        env.errorDispatcher("Room doesn't exist");
        return reject();
      }

      resolve(response.message);
    });
  });
}
