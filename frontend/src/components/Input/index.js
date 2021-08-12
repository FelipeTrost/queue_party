import React, { useState, useEffect } from "react";
import "./styles.css";

export default function Input({ onChange, placeholder, value, style, type }) {
  const [text, setText] = useState("");

  // if the user decides to controle the value themselves, they can
  const userControlled = value !== undefined;

  useEffect(() => onChange && onChange(text), [text]);

  return (
    <input
      style={style}
      className={`cool-input ${type || ""}`}
      placeholder={placeholder}
      value={userControlled ? value : text}
      onChange={(e) => (userControlled ? onChange : setText)(e.target.value)}
    />
  );
}
