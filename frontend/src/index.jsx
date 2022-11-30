
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"))

const dev = import.meta.env.DEV;
const Wrapper = dev ? React.Fragment : React.StrictMode;

root.render(
  <Wrapper>
    <App />
  </Wrapper>,
);
