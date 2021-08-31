import React from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";

import Container from "../../components/Container";
import Title from "../../components/Title";
import RoomHeader from "../../components/RoomHeader";
import QueueList from "../../components/QueueList";
import SpotifySerach from "../../components/SpotifySearch";

import "./styles.css";
import useRoom from "./roomHook";

export default function Room() {
  const { id: roomId } = useParams();
  const [loading, guests, queue, spotifyToken, putInQueue] = useRoom(roomId);

  if (loading)
    return (
      <Container>
        <Title>Loading ...</Title>
      </Container>
    );

  return (
    <>
      <Helmet>
        <title>Room {roomId}</title>
      </Helmet>
      <Container>
        <RoomHeader roomId={roomId} guests={guests} />

        <SpotifySerach token={spotifyToken} onTrack={putInQueue} />

        <QueueList queue={queue} autoKey />
      </Container>
    </>
  );
}
