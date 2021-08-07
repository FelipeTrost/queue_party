import React from "react";
import { useParams } from "react-router-dom";

export default function Host() {
  const { id: roomId } = useParams();
  return <div>wasap</div>;
}
