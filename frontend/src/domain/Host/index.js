import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { FaQrcode } from "react-icons/fa";

import Title from "../../components/Title";
import Container from "../../components/Container";
import { useSocket } from "../../context/socket";
import { useErrorDispatcher } from "../../context/errorDispatcher";
import RoomHeader from "../../components/RoomHeader";
import QueueList from "../../components/QueueList";
import Select from "../../components/Select";
import Popup from "../../components/Popup";
import Button from "../../components/Button";

export default function Host() {
  const history = useHistory();
  const socket = useSocket();
  const errorDispatcher = useErrorDispatcher();

  const [room, setRoom] = useState(null);
  const [guests, setGuests] = useState({});
  const [queue, setQueue] = useState([]);
  const [qrPopup, setQrPopup] = useState(false);

  const { secret: roomSecret } = useParams();

  useEffect(() => {
    socket.emit("join-room-host", roomSecret, (response) => {
      if (!response.success) {
        errorDispatcher(response.message);
        return history.push("/");
      }

      const room = response.message;
      setRoom(room);
      setQueue(room.queue);
    });

    socket.on("update-participants", (guests) => setGuests(guests));
    socket.on("new-track", (track) => setQueue((q) => q.concat(track)));
    socket.on("new-queue", (tracks) => setQueue(tracks));
  }, []);

  if (!room)
    return (
      <Container>
        <Title>Loading ...</Title>
      </Container>
    );

  return (
    <Container>
      <Popup show={qrPopup} close={() => setQrPopup(false)}>
        <Container center vcenter style={{ height: "100vh " }}>
          <QRCode
            value={`${process.env.REACT_APP_PUBLIC_URL}/room/${room.roomId}`}
          />
        </Container>
      </Popup>

      <RoomHeader
        roomId={room.roomId}
        guests={guests}
        type="secondary"
        hostView
      />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Button
          type="red"
          onClick={() => {
            socket.emit("close-room", (r) => {
              // here im not sure, maybe I should redirect to the home inconditionally
              if (r) history.push("/");
              else errorDispatcher("Couldn't close room");
            });
          }}
        >
          Close room
        </Button>

        <Button type="secondary" onClick={() => setQrPopup(true)}>
          <FaQrcode />
        </Button>
      </div>
      <br />

      {/* <Select options={devices} setValue={setSelectedDevice} /> */}

      <QueueList queue={queue} setQueue={setQueue} type="secondary" autoKey />
    </Container>
  );
}
