import React, { useState } from "react";
import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { FaQrcode } from "react-icons/fa";

import Title from "../../components/Title";
import Container from "../../components/Container";
import RoomHeader from "../../components/RoomHeader";
import QueueList from "../../components/QueueList";
import Popup from "../../components/Popup";
import Button from "../../components/Button";
import useHost from "./hostHook";

export default function Host() {
  const { secret: roomSecret } = useParams();

  const [qrPopup, setQrPopup] = useState(false);

  const [room, guests, queue, closeRoom] = useHost(roomSecret);

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
        <Button type="red" onClick={closeRoom}>
          Close room
        </Button>

        <Button type="secondary" onClick={() => setQrPopup(true)}>
          <FaQrcode />
        </Button>
      </div>

      <QueueList queue={queue} type="secondary" autoKey />
    </Container>
  );
}
