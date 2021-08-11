import React from "react";
import { useHistory } from "react-router-dom";

import Button from "../../components/Button";
import Container from "../../components/Container";
import Title from "../../components/Title";

const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${process.env.REACT_APP_REDIRECT_URL}t&scope=user-modify-playback-state%20user-read-playback-state`;

export default function Landing() {
  const router = useHistory();
  console.log(process.env);

  return (
    <Container style={{ height: "100vh" }} center vcenter>
      <Title>Queue Party</Title>

      <Button
        type="secondary"
        onClick={() => {
          window.location = spotifyAuthUrl;
        }}
      >
        Create Room
      </Button>
      <br />
      <Button type="primary" onClick={() => router.push("joinroom")}>
        Join Room
      </Button>
      <br />
    </Container>
  );
}
