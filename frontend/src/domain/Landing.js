import React from "react";
import { Helmet } from "react-helmet";
import { FaPlusCircle } from "react-icons/fa";

import Button from "../components/Button";
import Container from "../components/Container";
import Title from "../components/Title";

import JoinRoom from "../components/JoinRoom";

const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_SERVER_URL}/spotify&scope=user-modify-playback-state%20user-read-playback-state`;
export default function Landing() {
  return (
    <>
      <Helmet>
        <title>Queue party</title>
      </Helmet>

      <div className="landing-background">
        <Container
          style={{
            height: "80vh",
            position: "relative",
            backgroundSize: "cover",
            maxWidth: "400px",
          }}
          center
          vcenter
        >
          <Title style={{ marginBottom: "50px" }}>Queue Party</Title>

          <JoinRoom />

          <div
            style={{
              width: "100%",
            }}
          >
            <Title
              type="h2"
              variant="secondary"
              style={{
                fontWeight: "bold",
                textAlgin: "left",
                width: "100%",
                marginTop: "50px",
              }}
            >
              Create a Room
            </Title>

            <Button
              type="secondary"
              onClick={() => {
                window.location = spotifyAuthUrl;
              }}
            >
              <FaPlusCircle />
            </Button>
          </div>
        </Container>
      </div>
    </>
  );
}
