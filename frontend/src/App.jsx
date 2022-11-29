import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Room from "./domain/Room";
import Host from "./domain/Host";
import Landing from "./domain/Landing";

import "./styles.css";
import { SocketProvider } from "./context/socket";
import { ErrorContext } from "./context/errorDispatcher";

export default function App() {
  return (
    <SocketProvider>
      <Router>
        <ErrorContext>
          <Routes>
            <Route path="/host/:secret" element= {<Host />} />

            <Route path="/room/:id" element= {<Room />} />

            <Route path="/" element= {<Landing />} />
          </Routes>
        </ErrorContext>
      </Router>
    </SocketProvider>
  );
}
