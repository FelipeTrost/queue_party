import React from "react";
import "./styles.css";

export default function Container({ children, style, center, vcenter }) {
  const classes = ["cool-container"];

  if (center) classes.push("center");
  if (vcenter) classes.push("vcenter");

  const clasesString = classes.join(" ");

  return (
    <div className={clasesString} style={style}>
      {children}
    </div>
  );
}
