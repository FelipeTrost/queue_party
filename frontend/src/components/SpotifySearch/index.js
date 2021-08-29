import React, { useEffect, useRef, useState } from "react";
import Container from "../Container";
import Input from "../Input";
import Popup from "../Popup";
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
  const [popup, setPopup] = useState(false);
  const inputRef = useRef();

  const doSearch = async () => {
    const result = await search(token, query);
    if (!result.tracks) return;

    const items = result.tracks.items;

    const tracks = items.map((item) => ({
      name: item.name,
      id: item.id,
      artist: item.artists.map((a) => a.name).join(" "),
      picture: item.album.images[1] ? item.album.images[1].url : "",
    }));

    setResults(tracks);
  };

  useEffect(() => {
    doSearch();
  }, [query]);

  useEffect(() => {
    if (popup && inputRef.current) inputRef.current.focus();
  }, [popup]);

  const close = () => {
    setPopup(false);
    setQuery("");
  };

  return (
    <>
      <Input
        style={{ width: "100%" }}
        placeholder="Search a song"
        onFocus={() => setPopup(true)}
      />

      <Popup show={popup} close={close} animationIn="zoomInDown">
        <Container style={{ padding: "20px 0", color: "black!important" }}>
          <Input
            style={{ width: "100%" }}
            placeholder="Search a song"
            onChange={setQuery}
            type="black"
            Ref={inputRef}
          />

          <QueueList
            queue={results}
            type="black"
            onClick={(t) => {
              close();
              onTrack(t);
            }}
          />
        </Container>
      </Popup>
    </>
  );
}
