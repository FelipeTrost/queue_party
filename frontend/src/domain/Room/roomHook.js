import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    socket.emit("join-room", roomId, (response) => {
      if (!response.success) {
        errorDispatcher("Room doesn't exist");
        return history.push("/");
      }

      const [guests, queue, accessToken] = response.message;

      setSpotifyToken(accessToken);
      setLoading(false);
      setGuests(guests);
      setQueue(queue);
    });

    socket.on("update-participants", (guests) => setGuests(guests));
    socket.on("new-track", (track) => setQueue((q) => q.concat(track)));
    socket.on("token-update", (accessToken) => setSpotifyToken(accessToken));
    socket.on("new-queue", (tracks) => setQueue(tracks));

    socket.on("room-ended", () => {
      errorDispatcher("Room closed");
      history.push("/");
    });
  }, []);

  function putInQueue(track) {
    const id = inputToId(track);
    socket.emit(
      "put-in-queue",
      id,
      (response) => !response.success && errorDispatcher(response.message)
    );
  }

  return [loading, guests, queue, spotifyToken, putInQueue];
}
