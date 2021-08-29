import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Room from "./domain/Room";
import Host from "./domain/Host";
import Landing from "./domain/Landing";

import "./styles.css";
import JoinRoom from "./domain/JoinRoom";
import { SocketProvider } from "./context/socket";
import { ErrorContext } from "./context/errorDispatcher";

export default function App() {
  return (
    <Router>
      <ErrorContext>
        <Switch>
          <Route path="/host/:secret">
            <SocketProvider>
              <Host />
            </SocketProvider>
          </Route>

          <Route path="/room/:id">
            <SocketProvider>
              <Room />
            </SocketProvider>
          </Route>

          <Route path="/joinroom">
            <SocketProvider>
              <JoinRoom />
            </SocketProvider>
          </Route>

          <Route path="/">
            <Landing />
          </Route>
        </Switch>
      </ErrorContext>
    </Router>
  );
}
