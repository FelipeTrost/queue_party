import React from "react";
import Container from "../Container";

import "./styles.css";

export default function Popup({ children, show, close }) {
  const actionClass = show ? "enter" : "hide";
  const className = `cool-popup ${actionClass}`;

  return (
    <div className={className} onKeyPress={(e) => console.log(e.target)}>
      <span className="close" onClick={close}>
        X
      </span>
      <Container>{show && children}</Container>
    </div>
  );
}
