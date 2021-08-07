import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Room from "./domain/Room";
import Host from "./domain/Host";
import Landing from "./domain/Landing";

import "./styles.css";
import JoinRoom from "./domain/JoinRoom";

export default function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/host/:id">
            <Host />
          </Route>

          <Route path="/room/:id">
            <Room />
          </Route>

          <Route path="/joinroom">
            <JoinRoom />
          </Route>

          <Route path="/">
            <Landing />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
