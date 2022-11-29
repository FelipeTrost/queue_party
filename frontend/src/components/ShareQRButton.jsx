import React, { useState } from "react";
import QRCode from "react-qr-code";
import { FaQrcode } from "react-icons/fa";

import Popup from "./Popup";
import { roomLink } from "../utils/sharing";
import Container from "./Container";
import Button from "./Button";

export default function ShareQR({ roomId, ...rest }) {
  const [qrPopup, setQrPopup] = useState(false);
  return (
    <>
      <Popup show={qrPopup} close={() => setQrPopup(false)}>
        <Container center vcenter style={{ height: "80vh " }}>
          <QRCode value={roomLink(roomId)} />
        </Container>
      </Popup>

      <Button onClick={() => setQrPopup(true)} {...rest}>
        <FaQrcode />
      </Button>
    </>
  );
}
