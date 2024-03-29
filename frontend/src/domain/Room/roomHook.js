import { useEffect, useState } from "react";
// import { useHistory } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { useErrorDispatcher } from "../../context/errorDispatcher";
import { useSocket } from "../../context/socket";
import { joinRoom } from "../../utils/socket";
import inputToId from "../../utils/inputToSpotifyId";

function useRoom(roomId) {
  const socket = useSocket();
  // const history = useHistory();
  const navigate = useNavigate();
  const errorDispatcher = useErrorDispatcher();

  const [loading, setLoading] = useState(true);

  // Room info
  const [guests, setGuests] = useState({});
  const [queue, setQueue] = useState([]);
  const [spotifyToken, setSpotifyToken] = useState("");
  const [nowPlaying, setNowPlaying] = useState(null);
  const [roomName, setRoomName] = useState("");

  function updateSearchToken() {
    socket.emit("search-token", (token) => setSpotifyToken(token));
  }

  useEffect(() => {
    joinRoom({ socket, errorDispatcher }, roomId)
      .then(([guests, queue, accessToken, roomName]) => {
        setSpotifyToken(accessToken);
        setLoading(false);
        setGuests(guests);
        setQueue(queue);
        setRoomName(roomName);
      })
      .catch(() => navigate("/"));

    socket.on("update-participants", (guests) => setGuests(guests));
    socket.on("new-track", (track) => setQueue((q) => q.concat(track)));
    socket.on("token-update", (accessToken) => setSpotifyToken(accessToken));
    socket.on("new-queue", (tracks) => setQueue(tracks));
    socket.on("current-song", (track) => setNowPlaying(track));

    socket.on("room-ended", () => {
      errorDispatcher("Room closed");
      navigate("/");
    });
  }, []);

  function putInQueue(track) {
    const id = inputToId(track);
    socket.emit("put-in-queue", id, (response) => {
      // TODO: improve reconnection
      if (!response.success && response.noRoom) {
        joinRoom(roomId).then(() => {
          // errorDispatcher("Reconnected");
          putInQueue(track);
        });
      } else if (!response.success) {
        errorDispatcher(response.message);
      }
    });
  }

  return [
    loading,
    guests,
    queue,
    spotifyToken,
    putInQueue,
    nowPlaying,
    updateSearchToken,
    roomName,
  ];
}

export default useRoom;
