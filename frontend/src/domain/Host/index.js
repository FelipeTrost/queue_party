import React, { useState } from "react";
import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { FaQrcode, FaShareAlt } from "react-icons/fa";
import { Helmet } from "react-helmet";
import { useErrorDispatcher } from "../../context/errorDispatcher";

import SpotifySerach from "../../components/SpotifySearch";
import Title from "../../components/Title";
import Container from "../../components/Container";
import RoomHeader from "../../components/RoomHeader";
import QueueList from "../../components/QueueList";
import Popup from "../../components/Popup";
import Button from "../../components/Button";
import useHost from "./hostHook";
import Checkbox from "../../components/Checkbox";

export default function Host() {
  const { secret: roomSecret } = useParams();
  const errorDispatcher = useErrorDispatcher();

  const [qrPopup, setQrPopup] = useState(false);

  const [
    room,
    guests,
    queue,
    permanent,
    togglePermanent,
    accessToken,
    putInQueue,
    updateToken,
    closeRoom,
  ] = useHost(roomSecret);

  if (!room)
    return (
      <Container>
        <Title>Loading ...</Title>
      </Container>
    );

  return (
    <>
      <Helmet>
        <title>Host of {room.roomId}</title>
      </Helmet>
      <Container>
        <Popup show={qrPopup} close={() => setQrPopup(false)}>
          <Container center vcenter style={{ height: "80vh " }}>
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
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <Button
            type="red"
            onClick={closeRoom}
            style={{
              marginTop: "10px",
            }}
          >
            Close room
          </Button>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              marginTop: "10px",
            }}
          >
            <Checkbox
              type="secondary"
              onChange={togglePermanent}
              checked={permanent}
              text="Permanent"
              style={{ marginRight: "10px" }}
            />

            <Button
              type="secondary"
              style={{ marginRight: "10px" }}
              onClick={(e) => {
                const roomLink = `${process.env.REACT_APP_PUBLIC_URL}/room/${room.roomId}`;

                if (navigator.share) {
                  navigator.share({
                    title: "Queue Party",
                    text: `Join room ${room.roomId} and add music to the queue`,
                    url: roomLink,
                  });
                } else {
                  navigator.clipboard
                    .writeText(roomLink)
                    .then(() =>
                      errorDispatcher("Copied room link to clipboard", true)
                    )
                    .catch(() =>
                      errorDispatcher("Failed to copy room link to clipboard")
                    );
                }
              }}
            >
              <FaShareAlt />
            </Button>

            <Button type="secondary" onClick={() => setQrPopup(true)}>
              <FaQrcode />
            </Button>
          </div>
        </div>

        <SpotifySerach
          token={accessToken}
          onTrack={putInQueue}
          updateToken={updateToken}
          type="secondary"
        />

        <QueueList queue={queue} type="secondary" autoKey />
      </Container>
    </>
  );
}
