import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

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
          <Switch>
            <Route path="/host/:secret">
              <Host />
            </Route>

            <Route path="/room/:id">
              <Room />
            </Route>

            <Route path="/">
              <Landing />
            </Route>
          </Switch>
        </ErrorContext>
      </Router>
    </SocketProvider>
  );
}
