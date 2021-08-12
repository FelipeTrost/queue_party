import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Button from "../../components/Button";
import Container from "../../components/Container";
import Input from "../../components/Input";
import Title from "../../components/Title";
import { useErrorDispatcher } from "../../context/errorDispatcher";
import { useSocket } from "../../context/socket";
import { FaSpotify } from "react-icons/fa";
import RoomHeader from "../../components/RoomHeader";
import QueueList from "../../components/QueueList";
import SpotifySerach from "../../components/SpotifySearch";
import Popup from "../../components/Popup";

const inputToId = (link) => {
  const regex = "https://open.spotify.com/track/(.*)\\?(.*)";
  const match = link.match(regex);
  let id;

  if (link.match("spotify:track")) return link;
  else if (!match) id = link;
  else id = match[1];

  return `spotify:track:${id}`;
};

export default function Room() {
  const socket = useSocket();
  const history = useHistory();
  const errorDispatcher = useErrorDispatcher();

  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState({});
  const [queue, setQueue] = useState([]);
  const [songInput, setSongInput] = useState("");
  const [spotifyToken, setSpotifyToken] = useState("");
  const [searchPopup, setSearchPopup] = useState("");

  const { id: roomId } = useParams();

  useEffect(() => {
    socket.emit("join-room", roomId, (success, guests, queue, accessToken) => {
      if (success === false) {
        errorDispatcher("Room doesn't exist");
        return history.push("/");
      }

      setSpotifyToken(accessToken);
      setLoading(false);
      setGuests(guests);
      setQueue(queue);
    });

    socket.on("update-participants", (guests) => setGuests(guests));
    socket.on("new-track", (track) => setQueue((q) => q.concat(track)));
    socket.on("token-update", (accessToken) => setSpotifyToken(accessToken));

    socket.on("room-ended", () => {
      errorDispatcher("Room closed");
      history.push("/");
    });
  }, []);

  const queueit = () => {
    const id = inputToId(songInput);
    console.log(id);
    socket.emit(
      "put-in-queue",
      id,
      (success) => !success && errorDispatcher("Error: probably a bad link")
    );
    setSongInput("");
  };

  if (loading)
    return (
      <Container>
        <Title>Loading ...</Title>
      </Container>
    );

  return (
    <Container>
      <Popup show={searchPopup} close={() => setSearchPopup(false)}>
        <SpotifySerach token={spotifyToken} />
      </Popup>

      <RoomHeader roomId={roomId} guests={guests} />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "stretch",
        }}
      >
        <Input
          style={{ width: "52%" }}
          onChange={(t) => setSongInput(t)}
          value={songInput}
          placeholder="spotify song link"
        />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "stretch",
            width: "32%",
          }}
        >
          <Button style={{ width: "65%" }} onClick={queueit}>
            Queueit
          </Button>

          <Button
            style={{ backgroundColot: "35%" }}
            onClick={() => setSearchPopup(true)}
          >
            <FaSpotify />
          </Button>
        </div>
      </div>
      <QueueList queue={queue} setQueue={setQueue} />
    </Container>
  );
}