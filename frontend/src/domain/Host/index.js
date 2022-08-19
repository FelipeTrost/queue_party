import React from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";

import SpotifySerach from "../../components/SpotifySearch";
import Title from "../../components/Title";
import Container from "../../components/Container";
import RoomHeader from "../../components/RoomHeader";
import QueueList from "../../components/QueueList";
import Button from "../../components/Button";
import useHost from "./hostHook";
import Checkbox from "../../components/Checkbox";
import ShareQR from "../../components/ShareQRButton";
import ShareButton from "../../components/ShareButton";

export default function Host() {
  const { secret: roomSecret } = useParams();

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

            <ShareButton roomId={room.roomId} type="secondary" />

            <ShareQR roomId={room.roomId} type="secondary" />
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
