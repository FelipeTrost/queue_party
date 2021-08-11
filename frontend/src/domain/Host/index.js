import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import QRCode from "react-qr-code";
import { FaQrcode } from "react-icons/fa";

import Title from "../../components/Title";
import Container from "../../components/Container";
import { useSocket } from "../../context/socket";
import { useErrorDispatcher } from "../../context/errorDispatcher";
import RoomHeader from "../../components/RoomHeader";
import QueueList from "../../components/QueueList";
import Select from "../../components/Select";
import Popup from "../../components/Popup";
import Button from "../../components/Button";

export default function Host() {
  const history = useHistory();
  const socket = useSocket();
  const errorDispatcher = useErrorDispatcher();

  const [room, setRoom] = useState(null);
  const [guests, setGuests] = useState({});
  const [queue, setQueue] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [qrPopup, setQrPopup] = useState(false);

  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  const token = urlParams.get("access_token");

  if (!token) history.push("/");

  useEffect(() => {
    socket.emit("create-room", token, (room) => {
      if (!room) {
        errorDispatcher("couldn't create room");
        return history.push("/");
      }

      setRoom(room);
    });

    socket.on("update-participants", (guests) => setGuests(guests));
    socket.on("new-track", (track) => setQueue((q) => q.concat(track)));

    // Get devices
    fetch("https://api.spotify.com/v1/me/player/devices", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then((r) => setDevices([{ id: 0, name: "whatever" }, ...r.devices]))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    socket.emit("update-device", selectedDevice);
  }, [selectedDevice]);

  if (!room)
    return (
      <Container>
        <Title>Loading ...</Title>
      </Container>
    );

  return (
    <Container>
      <Popup show={qrPopup} close={() => setQrPopup(false)}>
        <Container center vcenter style={{ height: "100vh " }}>
          <QRCode
            value={`${process.env.REACT_APP_PUBLIC_URL}/room/${room.roomId}`}
          />
        </Container>
      </Popup>

      <RoomHeader
        roomId={room.roomId}
        guests={guests}
        type="secondary"
        hostView
      />

      <Button type="secondary" onClick={() => setQrPopup(true)}>
        <FaQrcode />
      </Button>
      <br />

      {/* <Select options={devices} setValue={setSelectedDevice} /> */}

      <QueueList queue={queue} setQueue={setQueue} type="secondary" />
    </Container>
  );
}
