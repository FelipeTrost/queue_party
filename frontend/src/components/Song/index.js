import React from "react";

import "./styles.css";

export default function Song({ onClick, key, track, type }) {
  return (
    <div className={`cool-track ${type || ""}`} key={key} onClick={onClick}>
      <div className="presenter">
        <p className="title">{track.name}</p>
        <p className="artist">{track.artist}</p>
      </div>
      <img src={track.picture} alt={track.name} />
    </div>
  );
}
