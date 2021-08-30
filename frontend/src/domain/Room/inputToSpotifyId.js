export default function inputToId(link) {
  const regex = "https://open.spotify.com/track/(.*)\\?(.*)";
  const match = link.match(regex);
  let id;

  if (link.match("spotify:track")) return link;
  else if (!match) id = link;
  else id = match[1];

  return `spotify:track:${id}`;
}
