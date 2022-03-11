import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FaQrcode, FaShareAlt } from "react-icons/fa";

import Container from "../../components/Container";
import Title from "../../components/Title";
import Song from "../../components/Song";
import RoomHeader from "../../components/RoomHeader";
import QueueList from "../../components/QueueList";
import SpotifySerach from "../../components/SpotifySearch";
import { useErrorDispatcher } from "../../context/errorDispatcher";
import Button from "../../components/Button";

import "./styles.css";
import useRoom from "./roomHook";
import Popup from "../../components/Popup";
import QRCode from "react-qr-code";

export default function Room() {
  const { id: roomId } = useParams();
  const [
    loading,
    guests,
    queue,
    spotifyToken,
    putInQueue,
    nowPlaying,
    updateToken,
  ] = useRoom(roomId);
  const errorDispatcher = useErrorDispatcher();

  const [qrPopup, setQrPopup] = useState(false);

  if (loading)
    return (
      <Container>
        <Title>Loading ...</Title>
      </Container>
    );

  return (
    <>
      <Popup show={qrPopup} close={() => setQrPopup(false)}>
        <Container center vcenter style={{ height: "80vh " }}>
          <QRCode
            value={`${process.env.REACT_APP_PUBLIC_URL}/room/${roomId}`}
          />
        </Container>
      </Popup>

      <Helmet>
        <title>Room {roomId}</title>
      </Helmet>
      <Container>
        <RoomHeader roomId={roomId} guests={guests} />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            marginBottom: "20px",
            gap: "5px",
          }}
        >
          <Button type="primary" onClick={() => setQrPopup(true)}>
            <FaQrcode />
          </Button>

          <Button
            type="primary"
            onClick={(e) => {
              const roomLink = `${process.env.REACT_APP_PUBLIC_URL}/room/${roomId}`;

              if (navigator.share) {
                navigator.share({
                  title: "Queue Party",
                  text: `Join room ${roomId} and add music to the queue`,
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

          <div style={{ minWidth: "70%", flexGrow: "1" }}>
            <SpotifySerach
              token={spotifyToken}
              onTrack={putInQueue}
              updateToken={updateToken}
            />
          </div>
        </div>

        {nowPlaying && (
          <>
            <Title type="h2">Now playing</Title>
            <Song track={nowPlaying} type="secondary" />
          </>
        )}

        <QueueList queue={queue} autoKey />
      </Container>
    </>
  );
}
