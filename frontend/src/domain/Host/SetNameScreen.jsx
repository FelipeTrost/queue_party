import React, { useState } from "react";
import { FaArrowRight, FaRandom } from "react-icons/fa";

import Button from "../../components/Button";
import Container from "../../components/Container";
import Input from "../../components/Input";
import Title from "../../components/Title";

export default function SetNameScreen({ sendName }) {
  const [customName, setCustomName] = useState("");

  return (
    <Container
      style={{
        height: "80vh",
        position: "relative",
        backgroundSize: "cover",
        maxWidth: "400px",
      }}
      center
      vcenter
    >
      <div style={{ marginTop: "-100px" }}>
        <Title style={{ marginBottom: "50px" }}>
          Pick a name for your room
        </Title>

        <div
          style={{
            width: "100%",
          }}
        >
          <Title
            type="h2"
            variant="secondary"
            style={{
              fontWeight: "bold",
              textAlgin: "left",
              width: "100%",
              marginTop: "50px",
            }}
          >
            Custom name
          </Title>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "22px",
              alignItems: "stretch",
              alignContent: "stretch",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Input
              onChange={setCustomName}
              placeholder="Room name"
              style={{ width: "80%" }}
              type="secondary"
              autoCorrect="false"
            />

            <Button type="secondary" onClick={() => sendName(customName)}>
              <FaArrowRight />
            </Button>
          </div>
        </div>

        <div
          style={{
            width: "100%",
          }}
        >
          <Title
            type="h2"
            variant="secondary"
            style={{
              fontWeight: "bold",
              textAlgin: "left",
              width: "100%",
              marginTop: "50px",
            }}
          >
            Random name
          </Title>

          <Button type="secondary" onClick={() => sendName()}>
            <FaRandom />
          </Button>
        </div>
      </div>
    </Container>
  );
}
