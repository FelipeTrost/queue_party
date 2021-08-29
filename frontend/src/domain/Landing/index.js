import React from "react";
import { useHistory } from "react-router-dom";

import Button from "../../components/Button";
import Container from "../../components/Container";
import Title from "../../components/Title";

const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_SERVER_URL}/spotify&scope=user-modify-playback-state%20user-read-playback-state`;
export default function Landing() {
  const router = useHistory();

  return (
    <div className="landing-background">
      <Container
        style={{
          height: "90vh",
          position: "relative",
          backgroundSize: "cover",
        }}
        center
        vcenter
      >
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
      </Container>
    </div>
  );
}
