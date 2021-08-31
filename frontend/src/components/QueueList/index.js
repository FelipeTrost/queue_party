import React from "react";
import Title from "../Title";
import "./styles.css";

export default function QueueList({ queue, style, type, onClick, autoKey }) {
  return (
    <div className={`cool-queue-list ${type || ""}`} style={style}>
      <Title type="h2">Queue</Title>
      {queue.map((track, i) => (
        <div
          className="cool-track"
          key={autoKey ? i : track.id}
          onClick={onClick && (() => onClick(track.id))}
        >
          <div className="presenter">
            <p className="title">{track.name}</p>
            <p className="artist">{track.artist}</p>
          </div>
          <img src={track.picture} alt={track.name} />
        </div>
      ))}
    </div>
  );
}
