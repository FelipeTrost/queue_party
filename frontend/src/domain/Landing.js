import React from "react";
import { Helmet } from "react-helmet";

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
          }}
          center
          vcenter
        >
          <Title style={{ marginBottom: "50px" }}>Queue Party</Title>

          {/* <div> */}
          <JoinRoom />

          <Title type="h2">Or</Title>

          <Button
            type="secondary"
            // style={{
            //   marginTop: "20px",
            // }}
            onClick={() => {
              window.location = spotifyAuthUrl;
            }}
          >
            Create Room
          </Button>
          {/* </div> */}
        </Container>
      </div>
    </>
  );
}
