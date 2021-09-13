import React from "react";
import Song from "../Song";
import Title from "../Title";

export default function QueueList({ queue, style, type, onClick, autoKey }) {
  return (
    <div className="cool-queue-list" style={{ ...style, overflow: "auto" }}>
      <Title type="h2">Queue</Title>
      {queue.map((track, i) => (
        <Song
          key={autoKey ? i : track.id}
          onClick={onClick && (() => onClick(track.id))}
          track={track}
          type={type}
          x
        />
      ))}
    </div>
  );
}
