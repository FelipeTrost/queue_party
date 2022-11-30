import React, { useState, useEffect } from "react";
// import { useHistory } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useZxing } from "react-zxing";

import Button from "./Button";
import Input from "./Input";
import Popup from "./Popup";
import Title from "./Title";
import { FaQrcode } from "react-icons/fa";

import { useSocket } from "../context/socket";

export default function JoinRoom() {
  const socket = useSocket();
  // const history = useHistory();
  const navigate = useNavigate();
  const [scanner, setScanner] = useState(false);

  const { ref, start } = useZxing({
    onResult(result) {
      tryJoin(result);
      const match = scanned.match(`${import.meta.env.VITE_APP_PUBLIC_URL}/room/(.*)`);
      if (!match) tryJoin(match[1]);
    }
  });
    
  useEffect(()=>{
    start();
  }, []);

  const tryJoin = (room) => {
    if (room.length < 3) return;

    socket.emit("probe-room", room, (result) => {
      if (result) navigate(`/room/${room}`);
    });
  };

  return (
    <>
      <Popup show={scanner} close={() => setScanner(false)}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <video style={{
            width: "100%",
            height: "80vh",
          }} ref={ref} />
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
