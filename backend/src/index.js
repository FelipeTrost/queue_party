const app = require("./app");
const { Server } = require("socket.io");
const configSocket = require("./socketio");
const { clientCredentials } = require("./spotify");

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});

let accessToken;
// clientCredentials((access_token) => {
//   io.emit("token-update", access_token);
//   accessToken = access_token;
// });
const getAccessToken = () => accessToken;

const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL],
  },
});

io.on("connection", (socket) => configSocket(socket, io, getAccessToken));
