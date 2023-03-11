import React from "react";
import { useNavigate } from "react-router-dom";

import Input from "./Input";
import Title from "./Title";
// import Popup from "./Popup";
// import Button from "./Button";

import { useSocket } from "../context/socket";

export default function JoinRoom() {
  const socket = useSocket();
  const navigate = useNavigate();

  const tryJoin = (room) => {
    if (room.length < 3) return;

    socket.emit("probe-room", room, (result) => {
      if (result) navigate(`/room/${room}`);
      console.log(result);
    });
  };

  return (
    <>
      {/* <Popup show={scanner} close={() => setScanner(false)}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <video
            style={{
              width: "100%",
              height: "80vh",
            }}
            ref={ref}
          />
        </div>
      </Popup> */}

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
            autoCorrect="false"
          />

          {/* <Button onClick={() => setScanner(true)}>
            <FaQrcode />
          </Button> */}
        </div>
      </div>
    </>
  );
}
