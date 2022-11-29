import React from "react";
import "./styles.css";

export default function Checkbox({ text, type, style, onChange, checked }) {
  type = !type ? "primary" : type;
  if (
    type !== "primary" &&
    type !== "secondary" &&
    type !== "primary-variant" &&
    type !== "red"
  )
    throw new Error("Invalid button type");

  return (
    <div
      className={`cool-checkbox ${type}`}
      style={style}
      onClick={() => onChange()}
    >
      <label htmlFor={text}> {text} </label>

      <input name={text} type="checkbox" checked={checked} readOnly />
    </div>
  );
}
