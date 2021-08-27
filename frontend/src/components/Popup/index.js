import React from "react";

import "./styles.css";

export default function Popup({ children, show, close }) {
  const actionClass = show ? "enter" : "hide";
  const className = `cool-popup ${actionClass}`;

  return (
    <div className={className}>
      <div className="close">
        <span onClick={close}>X</span>
      </div>

      {show && children}
    </div>
  );
}
