// Purpose: One authenticated Socket.IO connection shared across the app.
// The JWT is sent in the handshake; the backend derives identity from it and
// auto-joins the user's personal room, so consumers never emit a raw `join`.
import { createContext, useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

const socketBase = () =>
  (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
    /\/?api\/?$/i,
    "",
  );

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem("token");
    const s = io(socketBase(), {
      auth: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current = s;
    setSocket(s);

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketContext;
