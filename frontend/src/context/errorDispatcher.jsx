import React, { useRef, createContext, useContext, useState } from "react";
import Error from "../components/Error";

const context = createContext();

export const useErrorDispatcher = () => useContext(context);

export const ErrorContext = ({ children }) => {
  const [error, setError] = useState("");
  const [green, setGreen] = useState(false);
  const [show, setShow] = useState(false);
  const activeError = useRef(null);

  const dispatchError = (err, g) => {
    if (activeError.current != null) clearTimeout(activeError.current);

    setGreen(g || false);

    setError(err);
    setShow(true);

    activeError.current = setTimeout(() => {
      setShow(false);
    }, 3000);
  };

  return (
    <>
      <context.Provider value={dispatchError}>{children}</context.Provider>
      <Error show={show} text={error} green={green} />
    </>
  );
};
