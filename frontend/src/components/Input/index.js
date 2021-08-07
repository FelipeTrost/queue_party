import React, { useState, useEffect } from "react";
import "./styles.css";

export default function Input({ onChange, placeholder }) {
  const [text, setText] = useState("");

  useEffect(() => onChange && onChange(text), [text]);

  return (
    <input
      className="cool-input"
      placeholder={placeholder}
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
  );
}
