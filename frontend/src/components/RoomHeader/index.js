import React from "react";
import { BsFillPeopleFill } from "react-icons/bs";
import Title from "../Title";

import "./styles.css";

export default function RoomHeader({ roomId, guests, type, hostView }) {
  const guestList = Object.keys(guests);

  let text = `Room: ${roomId}`;
  if (hostView) text = `You're the host of: ${roomId}`;

  return (
    <div className={`cool-room-header ${type === "secondary" ? type : ""}`}>
      <Title>{text}</Title>

      <p className="guests">
        <BsFillPeopleFill /> {"  "} {guestList.length || 0}
      </p>
    </div>
  );
}
