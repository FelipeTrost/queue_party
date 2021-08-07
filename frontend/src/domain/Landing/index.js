import React from "react";
import { useHistory } from "react-router-dom";

import Button from "../../components/Button";
import Container from "../../components/Container";
import Title from "../../components/Title";

export default function Landing(props) {
  const router = useHistory();

  return (
    <Container style={{ height: "100vh" }} center vcenter>
      <Title>Queue Party</Title>

      <Button type="secondary">Create Room</Button>
      <Button type="primary" onClick={() => router.push("joinroom")}>
        Join Room
      </Button>
      <br />
    </Container>
  );
}
