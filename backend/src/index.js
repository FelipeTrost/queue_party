require("dotenv").config();

const RoomGroup = require("./rooms");
module.exports = new RoomGroup();

const app = require("./app");
const { Server } = require("socket.io");
const configSocket = require("./socketio");
const { instrument } = require("@socket.io/admin-ui");
const { clientCredentials } = require("./spotify");

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});

let accessToken;
clientCredentials((access_token) => {
  io.emit("token-update", access_token);
  accessToken = access_token;
});
const getAccessToken = () => accessToken;

const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL, "https://admin.socket.io"],
  },
});

instrument(io, {
  auth: {
    type: "basic",
    username: process.env.SOCKET_USER,
    password: process.env.SOCKET_PASSWORD,
  },
});

io.on("connection", (socket) => configSocket(socket, io, getAccessToken));
