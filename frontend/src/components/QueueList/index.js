import React from "react";
import Title from "../Title";
import "./styles.css";

export default function QueueList({ queue, setQueue, style, type, onClick }) {
  return (
    <div className={`cool-queue-list ${type || ""}`} style={style}>
      <Title type="h2">Queue</Title>
      {queue.map((track) => (
        <div
          className="cool-track"
          key={track.id || track.name}
          onClick={onClick && (() => onClick(track.id))}
        >
          <div className="presenter">
            <p className="title">{track.name}</p>
            <p className="artist">{track.artist}</p>
          </div>
          <img src={track.picture} />
        </div>
      ))}
    </div>
  );
}
