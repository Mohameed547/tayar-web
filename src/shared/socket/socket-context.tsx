"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { tokenStorage } from "@/lib/auth/token-storage";
import { SOCKET_CONFIG, SOCKET_EVENTS } from "./constants";
import { SocketStatus, SocketContextType } from "./types";

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<SocketStatus>("disconnected");
  const [error, setError] = useState<Error | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  
  const prevTokenRef = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Keep track of active room memberships so we can automatically
  // re-join them if the connection drops and reconnects.
  const activeRoomsRef = useRef<{
    shipments: Set<string>;
    offices: Set<string>;
    roles: Set<string>;
  }>({
    shipments: new Set(),
    offices: new Set(),
    roles: new Set(),
  });

  // Central listener registry to prevent duplicate listener bindings on the raw socket
  const listenersRef = useRef<Record<string, Set<(data: any) => void>>>({});

  // Browser-level online/offline status detection & connection recovery
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      console.log("Browser network status: Online. Restoring socket connection...");
      if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatus("disconnected");
      console.warn("Browser network status: Offline.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Connect / Disconnect based on token state
  useEffect(() => {
    const checkToken = () => {
      const token = tokenStorage.getToken();
      if (token === prevTokenRef.current) return;
      prevTokenRef.current = token;

      if (!token) {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
          setSocket(null);
          setStatus("disconnected");
        }
        return;
      }

      setStatus("connecting");

      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      const newSocket = io(SOCKET_CONFIG.DEFAULT_URL, {
        auth: { token },
        transports: SOCKET_CONFIG.TRANSPORTS,
        reconnection: true,
        reconnectionAttempts: SOCKET_CONFIG.RECONNECTION_ATTEMPTS,
        reconnectionDelay: SOCKET_CONFIG.RECONNECTION_DELAY,
        reconnectionDelayMax: SOCKET_CONFIG.RECONNECTION_DELAY_MAX,
        timeout: SOCKET_CONFIG.TIMEOUT,
      });

      newSocket.on("connect", () => {
        setStatus("connected");
        setError(null);
        console.log("Centralized Socket connected:", newSocket.id);

        // Auto re-join rooms
        activeRoomsRef.current.shipments.forEach((id) => {
          newSocket.emit(SOCKET_EVENTS.JOIN_SHIPMENT, id);
        });
        activeRoomsRef.current.offices.forEach((id) => {
          newSocket.emit(SOCKET_EVENTS.JOIN_OFFICE, id);
        });
        activeRoomsRef.current.roles.forEach((role) => {
          newSocket.emit(SOCKET_EVENTS.JOIN_ROLE, role);
        });

        // Rebind all current active event listeners to this new socket
        Object.keys(listenersRef.current).forEach((event) => {
          newSocket.off(event);
          newSocket.on(event, (data: any) => {
            listenersRef.current[event]?.forEach((cb) => {
              try {
                cb(data);
              } catch (err) {
                console.error(`Error in socket listener for event ${event}:`, err);
              }
            });
          });
        });
      });

      newSocket.on("disconnect", (reason) => {
        setStatus("disconnected");
        console.log("Centralized Socket disconnected:", reason);
      });

      newSocket.on("connect_error", (err) => {
        setStatus("error");
        setError(err);
        console.error("Centralized Socket connection error:", err);
      });

      newSocket.on("reconnect_attempt", (attempt) => {
        setStatus("reconnecting");
        console.log(`Centralized Socket reconnecting (attempt ${attempt})...`);
      });

      newSocket.on("reconnect_failed", () => {
        setStatus("disconnected");
        console.error("Centralized Socket reconnection failed.");
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    };

    checkToken();
    const interval = setInterval(checkToken, 2000);

    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Central registerListener implementation
  const registerListener = useCallback(<T,>(event: string, callback: (data: T) => void) => {
    if (!listenersRef.current[event]) {
      listenersRef.current[event] = new Set();
      
      const currentSocket = socketRef.current;
      if (currentSocket) {
        currentSocket.on(event, (data: any) => {
          listenersRef.current[event]?.forEach((cb) => {
            try {
              cb(data);
            } catch (err) {
              console.error(`Error in socket listener for event ${event}:`, err);
            }
          });
        });
      }
    }
    
    listenersRef.current[event].add(callback);
    
    return () => {
      const callbacks = listenersRef.current[event];
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          const currentSocket = socketRef.current;
          if (currentSocket) {
            currentSocket.off(event);
          }
          delete listenersRef.current[event];
        }
      }
    };
  }, []);

  // Room Join Actions
  const joinShipment = useCallback((shipmentId: string) => {
    activeRoomsRef.current.shipments.add(shipmentId);
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.JOIN_SHIPMENT, shipmentId);
    }
  }, []);

  const leaveShipment = useCallback((shipmentId: string) => {
    activeRoomsRef.current.shipments.delete(shipmentId);
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.LEAVE_SHIPMENT, shipmentId);
    }
  }, []);

  const joinOffice = useCallback((officeId: string) => {
    activeRoomsRef.current.offices.add(officeId);
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.JOIN_OFFICE, officeId);
    }
  }, []);

  const leaveOffice = useCallback((officeId: string) => {
    activeRoomsRef.current.offices.delete(officeId);
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.LEAVE_OFFICE, officeId);
    }
  }, []);

  const joinRole = useCallback((role: string) => {
    activeRoomsRef.current.roles.add(role);
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.JOIN_ROLE, role);
    }
  }, []);

  const leaveRole = useCallback((role: string) => {
    activeRoomsRef.current.roles.delete(role);
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.LEAVE_ROLE, role);
    }
  }, []);

  // Emitters
  const emitLocation = useCallback((shipmentId: string, lng: number, lat: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.CAPTAIN_UPDATE_LOCATION, { shipmentId, lng, lat });
    }
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        status,
        error,
        isOnline,
        joinShipment,
        leaveShipment,
        joinOffice,
        leaveOffice,
        joinRole,
        leaveRole,
        emitLocation,
        registerListener,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
