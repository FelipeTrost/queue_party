import React from "react";
import Button from "./Button";
import { FaShareAlt } from "react-icons/fa";
import { useErrorDispatcher } from "../context/errorDispatcher";
import { share } from "../utils/sharing";

export default function ShareButton({ roomId, ...rest }) {
  const errorDispatcher = useErrorDispatcher();

  return (
    <Button
      style={{ marginRight: "10px" }}
      onClick={() => share(roomId, errorDispatcher)}
      {...rest}
    >
      <FaShareAlt />
    </Button>
  );
}
