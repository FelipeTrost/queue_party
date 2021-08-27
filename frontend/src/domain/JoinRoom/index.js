import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import QrReader from "react-qr-reader";
import { FaQrcode } from "react-icons/fa";

import Button from "../../components/Button";
import Container from "../../components/Container";
import Input from "../../components/Input";
import Popup from "../../components/Popup";
import Title from "../../components/Title";

import { useSocket } from "../../context/socket";

export default function JoinRoom() {
  const socket = useSocket();
  const history = useHistory();
  const [scanner, setScanner] = useState(false);

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

  return (
    <Container style={{ height: "100vh" }} center vcenter>
      <Popup show={scanner} close={() => setScanner(false)}>
        <Container>
          <div
            style={{
              height: "100vh ",
              padding: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <QrReader
              delay={300}
              onError={console.error}
              onScan={scann}
              style={{ width: "100%" }}
              showViewFinder={false}
            />
          </div>
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
          <FaQrcode />
        </div>
      </Button>

      <br />
    </Container>
  );
}
