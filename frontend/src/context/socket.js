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

let pong = false;
const ping = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (pong) resolve();
      else reject();
    }, 500);
  });

export const SocketProvider = ({ children }) => {
  const socket = useRef(null);
  const [connected, setConnected] = useState();

  useEffect(() => {
    const socketObject = io(process.env.REACT_APP_SERVER_URL, {
      reconnectionDelayMax: 1000,
    });

    socket.current = socketObject;

    socket.current.on("connect", () => {
      setConnected(true);
    });

    socket.current.on("pong", () => (pong = true));

    return () => socketObject.disconnect();
  }, []);

  return (
    <context.Provider value={socket.current}>
      {connected && children}
    </context.Provider>
  );
};
