import React from "react";
import "./styles.css";

export default function Error({ show, text }) {
  const classes = ["cool-error"];
  if (!show) classes.push("hide");

  return (
    <div className="cool-error-container">
      <div className={classes.join(" ")}>
        <p>{text}</p>
      </div>
    </div>
  );
}
