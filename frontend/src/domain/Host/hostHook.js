import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { useSocket } from "../../context/socket";
import { useErrorDispatcher } from "../../context/errorDispatcher";

export default function useHost(roomSecret) {
  const history = useHistory();
  const socket = useSocket();
  const errorDispatcher = useErrorDispatcher();

  //   room info
  const [room, setRoom] = useState(null);
  const [permanent, setPermanent] = useState(false);
  const [guests, setGuests] = useState({});
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    socket.emit("join-room-host", roomSecret, (response) => {
      if (!response.success) {
        errorDispatcher(response.message);
        return history.push("/");
      }
      console.log(response);

      const [roomIn, permanetRoom] = response.message;
      setRoom(roomIn);
      setPermanent(permanetRoom);
      setQueue(roomIn.queue);
    });

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
    socket.emit("toggle-permanent", !permanent);
    setPermanent((prev) => !prev);
  }

  return [room, guests, queue, permanent, togglePermanent, closeRoom];
}
