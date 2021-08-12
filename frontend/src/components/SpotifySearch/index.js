import React, { useEffect, useState } from "react";
import Container from "../Container";
import Input from "../Input";
import QueueList from "../QueueList";

async function search(token, query) {
  try {
    const link = "https://api.spotify.com/v1/search";
    const params = new URLSearchParams({ type: "track", limit: 20, q: query });

    const json = await fetch(`${link}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return await json.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default function SpotifySerach({ token, onTrack }) {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    search(token, query).then(
      (r) =>
        r.tracks &&
        setResults(
          r.tracks.items.map((item) => ({
            name: item.name,
            id: item.id,
            artist: item.artists.map((a) => a.name).join(" "),
            picture: item.album.images[1].url,
          }))
        )
    );
  }, [query]);

  return (
    <Container style={{ padding: "20px 0", color: "black!important" }}>
      <Input
        style={{ width: "100%" }}
        placeholder="Search something"
        onChange={setQuery}
        type="black"
      />
      <QueueList queue={results} type="black" onClick={onTrack} />
    </Container>
  );
}
