import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { ContinuousQrScanner } from "react-webcam-qr-scanner.ts";

import Button from "../../components/Button";
import Container from "../../components/Container";
import Input from "../../components/Input";
import Popup from "../../components/Popup";
import Title from "../../components/Title";

import { useSocket } from "../../context/socket";
import { Helmet } from "react-helmet";
import { findAllInRenderedTree } from "react-dom/test-utils";

export default function JoinRoom() {
  const socket = useSocket();
  const history = useHistory();
  const [scanner, setScanner] = useState(false);
  const [scanned, setScanned] = useState(false);

  const tryJoin = (room) => {
    room = room.toUpperCase();

    if (room.length >= 3)
      socket.emit("probe-room", room, (result) => {
        if (result) history.push(`/room/${room}`);
      });
  };

  const scann = (result) => {
    if (!result) return;
    const match = result.match(`${process.env.REACT_APP_PUBLIC_URL}/room/(.*)`);
    console.log("result", result, match);
    if (!match) return;
    tryJoin(match[1]);
  };

  useEffect(() => {
    scann(scanned);
  }, [scanned]);

  return (
    <>
      <Helmet>
        <title>Join room</title>
      </Helmet>
      <Container style={{ height: "100vh" }} center vcenter>
        <Popup show={scanner} close={() => setScanner(false)}>
          <Container vcenter style={{ height: "80vh" }}>
            <ContinuousQrScanner
              onQrCode={setScanned}
              style={{ width: "100%", height: "100%" }}
            />
          </Container>
        </Popup>

        <Title>Join a queue room</Title>

        <Input onChange={tryJoin} placeholder="Room id" />
        <Title type="h2">OR</Title>
        <Button onClick={() => setScanner(true)}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            Scan QR-code
          </div>
        </Button>

        <br />
      </Container>
    </>
  );
}
