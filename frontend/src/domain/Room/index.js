import React from "react";
import { useParams } from "react-router-dom";

export default function Room() {
  const { id: roomId } = useParams();
  return <div>Room {roomId}</div>;
}
