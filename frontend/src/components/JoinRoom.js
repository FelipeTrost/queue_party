import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { ContinuousQrScanner } from "react-webcam-qr-scanner.ts";

import Button from "./Button";
import Input from "./Input";
import Popup from "./Popup";
import Title from "./Title";
import { FaQrcode } from "react-icons/fa";

import { useSocket } from "./../context/socket";

export default function JoinRoom() {
  const socket = useSocket();
  const history = useHistory();
  const [scanner, setScanner] = useState(false);
  const [scanned, setScanned] = useState(false);

  const tryJoin = (room) => {
    if (room.length < 3) return;

    socket.emit("probe-room", room, (result) => {
      if (result) history.push(`/room/${room}`);
    });
  };

  const scann = (result) => {
    if (!result) return;
    const match = result.match(`${process.env.REACT_APP_PUBLIC_URL}/room/(.*)`);
    if (!match) return;

    tryJoin(match[1]);
  };

  useEffect(() => {
    scann(scanned);
  }, [scanned]);

  return (
    <>
      <Popup show={scanner} close={() => setScanner(false)}>
        <div
          styke={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <ContinuousQrScanner
            onQrCode={setScanned}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </Popup>

      <div style={{ width: "100%" }}>
        <Title
          type="h2"
          variant="primary"
          style={{ fontWeight: "bold", textAlgin: "left", width: "100%" }}
        >
          Join a Room
        </Title>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "22px",
            alignItems: "stretch",
            alignContent: "stretch",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Input
            onChange={tryJoin}
            placeholder="Room id"
            style={{ width: "80%" }}
          />

          <Button onClick={() => setScanner(true)}>
            <FaQrcode />
          </Button>
        </div>
      </div>
    </>
  );
}
