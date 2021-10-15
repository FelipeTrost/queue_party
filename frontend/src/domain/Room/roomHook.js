import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { useErrorDispatcher } from "../../context/errorDispatcher";
import { useSocket } from "../../context/socket";
import inputToId from "./inputToSpotifyId";

export default function useRoom(roomId) {
  const socket = useSocket();
  const history = useHistory();
  const errorDispatcher = useErrorDispatcher();

  const [loading, setLoading] = useState(true);

  // Room info
  const [guests, setGuests] = useState({});
  const [queue, setQueue] = useState([]);
  const [spotifyToken, setSpotifyToken] = useState("");
  const [nowPlaying, setNowPlaying] = useState(null);

  function joinRoom(roomId) {
    return new Promise((resolve, reject) => {
      socket.emit("join-room", roomId, (response) => {
        if (!response.success) {
          errorDispatcher("Room doesn't exist");
          reject();
          return history.push("/");
        }

        const [guests, queue, accessToken] = response.message;

        setSpotifyToken(accessToken);
        setLoading(false);
        setGuests(guests);
        setQueue(queue);

        resolve();
      });
    });
  }

  function updateSearchToken() {
    socket.emit("search-token", (token) => setSpotifyToken(token));
  }

  useEffect(() => {
    joinRoom(roomId);

    socket.on("update-participants", (guests) => setGuests(guests));
    socket.on("new-track", (track) => setQueue((q) => q.concat(track)));
    socket.on("token-update", (accessToken) => setSpotifyToken(accessToken));
    socket.on("new-queue", (tracks) => setQueue(tracks));
    socket.on("current-song", (track) => setNowPlaying(track));

    socket.on("room-ended", () => {
      errorDispatcher("Room closed");
      history.push("/");
    });
  }, []);

  function putInQueue(track) {
    const id = inputToId(track);
    socket.emit("put-in-queue", id, (response) => {
      if (!response.success && response.noRoom) {
        joinRoom(roomId).then(() => {
          errorDispatcher("Reconnected");
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
  ];
}
