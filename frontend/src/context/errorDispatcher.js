import React, { useRef, createContext, useContext, useState } from "react";
import Error from "../components/Error";

const context = createContext();

export const useErrorDispatcher = () => useContext(context);

export const ErrorContext = ({ children }) => {
  const [error, setError] = useState();
  const activeError = useRef(null);

  const dispatchError = (err) => {
    if (activeError.current != null) clearTimeout(activeError.current);

    setError(err);
    activeError.current = setTimeout(() => {
      setError(null);
    }, 3000);
  };

  return (
    <>
      <context.Provider value={dispatchError}>{children}</context.Provider>
      <Error show={error} text={error} />
    </>
  );
};
