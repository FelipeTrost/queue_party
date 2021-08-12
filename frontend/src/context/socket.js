import React, {
  useRef,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { io } from "socket.io-client";

const context = createContext();

export const useSocket = () => useContext(context);

export const SocketProvider = ({ children }) => {
  const socket = useRef(null);
  const [connected, setConnected] = useState();

  useEffect(() => {
    socket.current = io(process.env.REACT_APP_SERVER_URL);

    socket.current.on("connect", () => {
      setConnected(true);
    });
  }, []);

  return (
    <context.Provider value={socket.current}>
      {connected && children}
    </context.Provider>
  );
};
