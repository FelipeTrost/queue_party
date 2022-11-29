import React from "react";
import { Animated } from "react-animated-css";

import "./styles.css";

export default function Popup({
  children,
  show,
  animationIn,
  animationOut,
  close,
}) {
  return (
    // <div className="cool-popup-container">
    <Animated
      animationIn={animationIn || "slideInUp"}
      animationOut={animationOut || "slideOutDown"}
      animationInDuration={200}
      animationOutDuration={300}
      isVisible={show}
      animateOnMount={false}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 10,
      }}
    >
      <div className="cool-popup">
        <div className="close">
          <span onClick={close}>X</span>
        </div>

        {show && children}
      </div>
    </Animated>
    // </div>
  );
}
