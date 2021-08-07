import React from "react";
import "./styles.css";

export default function Title({ children, center, type }) {
  const classes = ["cool-title"];
  if (center) classes.push("center");
  const clasesString = classes.join(" ");

  if (!type || type === "h1")
    return <h1 className={clasesString}>{children}</h1>;
  else if (type === "h2") return <h2 className={clasesString}>{children}</h2>;
  else if (type === "h3") return <h3 className={clasesString}>{children}</h3>;
  else if (type === "h5") return <h4 className={clasesString}>{children}</h4>;
}
