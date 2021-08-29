import React from "react";
import "./styles.css";
import { Animated } from "react-animated-css";

export default function Error({ show, text }) {
  console.log("show", show, "text", text);
  return (
    <div className="cool-error-container">
      <Animated
        animationIn="bounceInLeft"
        animationOut="bounceOutRight"
        animateOnMount={false}
        isVisible={show}
      >
        <div className="cool-error">
          <p>{text}</p>
        </div>
      </Animated>
    </div>
  );
}
