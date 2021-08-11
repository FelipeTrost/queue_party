import React from "react";
import "./styles.css";

export default function Button({ children, onClick, type, style }) {
  type = !type ? "primary" : type;

  if (type !== "primary" && type !== "secondary" && type !== "primary-variant")
    throw new Error("Invalid button type");

  return (
    <button
      style={style}
      className={`cool-button button-base ripple ${type}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
