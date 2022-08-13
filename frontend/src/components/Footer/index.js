import React from "react";
import { FaGithub } from "react-icons/fa";

export default function Footer({ absolute }) {
  const styles = {
    position: "relative",
    clear: "both",
    width: "100%",
    textAlign: "center",
    fontSize: "35px",
    padding: "16px",
  };

  if (absolute) {
    styles.position = "absolute";
    styles.bottom = 0;
  }

  return (
    <div style={styles}>
      <a href="http://github.com/felipetrost" style={{ color: "#fff" }}>
        <FaGithub />
      </a>
    </div>
  );
}
