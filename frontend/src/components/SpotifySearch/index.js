import React, { useEffect, useState } from "react";
import Input from "../Input";

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

export default function SpotifySerach({ token }) {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    search(token, query).then((r) => r.tracks && setResults(r.tracks.items));
  }, [query]);

  return (
    <div style={{ color: "#fff" }}>
      <Input placeholder="Search something" onChange={setQuery} />
      {JSON.stringify(results.map((t) => t.name))}
    </div>
  );
}
