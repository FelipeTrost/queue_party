import React from "react";
import Button from "../../components/Button";
import Container from "../../components/Container";
import Input from "../../components/Input";
import Title from "../../components/Title";

export default function JoinRoom() {
  return (
    <Container style={{ height: "100vh" }} center vcenter>
      <Title>Join a queue room</Title>

      <Input placeholder="Room id" />
      <Title type="h2">OR</Title>
      <Button>Scan QR-code</Button>

      <br />
    </Container>
  );
}
