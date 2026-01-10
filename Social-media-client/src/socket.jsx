import { createContext, useMemo, useContext, useEffect } from "react";
import io from "socket.io-client";
import { server } from "./constants/config";

const SocketContext = createContext();

const getSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }) => {
  const socket = useMemo(
    () => 
      io(server, { 
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        // Force websocket transport for mobile reliability
        transports: ['websocket', 'polling'],
        // Enable upgrade for better mobile compatibility
        upgrade: true,
        // Prevent connection drops on mobile when tab is backgrounded
        rememberUpgrade: true,
      }), 
    []
  );

  // Add socket connection monitoring for debugging mobile issues
  useEffect(() => {
    const handleConnect = () => {
      console.log('✅ Socket connected');
    };

    const handleDisconnect = (reason) => {
      console.log('❌ Socket disconnected:', reason);
      // Auto-reconnect on mobile network drops
      if (reason === 'transport close' || reason === 'ping timeout') {
        console.log('🔄 Attempting reconnection...');
      }
    };

    const handleConnectError = (error) => {
      console.log('❌ Socket connection error:', error.message);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider, getSocket };
