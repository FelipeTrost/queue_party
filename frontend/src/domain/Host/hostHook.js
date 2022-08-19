import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { useSocket } from "../../context/socket";
import { useErrorDispatcher } from "../../context/errorDispatcher";
import inputToId from "../../utils/inputToSpotifyId";
import { joinRoomHost } from "../../utils/socket";

export default function useHost(roomSecret) {
  const history = useHistory();
  const socket = useSocket();
  const errorDispatcher = useErrorDispatcher();

  //   room info
  const [room, setRoom] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [permanent, setPermanent] = useState(false);
  const [guests, setGuests] = useState({});
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    joinRoomHost({ socket, errorDispatcher }, roomSecret)
      .then(([roomIn, permanetRoom, access]) => {
        setRoom(roomIn);
        setPermanent(permanetRoom);
        setAccessToken(access);
        setQueue(roomIn.queue);
      })
      .catch(() => history.push("/"));

    socket.on("token-update", (accessToken) => setAccessToken(accessToken));
    socket.on("update-participants", (guests) => setGuests(guests));
    socket.on("new-track", (track) => setQueue((q) => q.concat(track)));
    socket.on("new-queue", (tracks) => setQueue(tracks));
  }, []);

  function closeRoom() {
    socket.emit("close-room", (r) => {
      // here im not sure, maybe I should redirect to the home inconditionally
      if (r) history.push("/");
      else errorDispatcher("Couldn't close room");
    });
  }

  function togglePermanent() {
    // Inform user about permanent mode the first time they use it
    if (!localStorage.getItem("permanent-room-info")) {
      alert(
        "Normally if you disconnect your rooom will be closed in a couple of hours, permanent mode keeps it open until you decide to close it."
      );
      localStorage.setItem("permanent-room-info", true);
    }

    socket.emit("toggle-permanent", !permanent);
    setPermanent((prev) => !prev);
  }

  function putInQueue(track) {
    const id = inputToId(track);

    socket.emit("put-in-queue", id, (response) => {
      // TODO: better reconnection
      // if (!response.success && response.noRoom) {
      //   joinRoom(roomSecret).then(() => {
      //     putInQueue(track);
      //   });
      // } else if (!response.success) {
      //   errorDispatcher(response.message);
      // }
    });
  }

  function updateSearchToken() {
    socket.emit("search-token", (token) => setAccessToken(token));
  }

  return [
    room,
    guests,
    queue,
    permanent,
    togglePermanent,
    accessToken,
    putInQueue,
    updateSearchToken,
    closeRoom,
  ];
}
