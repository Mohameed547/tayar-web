/**
 * Socket.IO Constants
 * Centralized registry for events, room prefixes, and configuration.
 */

export const SOCKET_CONFIG = {
  DEFAULT_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  RECONNECTION_ATTEMPTS: 10,
  RECONNECTION_DELAY: 2000,
  RECONNECTION_DELAY_MAX: 5000,
  TIMEOUT: 20000,
  TRANSPORTS: ["websocket"],
};

export const SOCKET_EVENTS = {
  // Built-in Socket.IO events
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
  RECONNECT: "reconnect",
  RECONNECT_ATTEMPT: "reconnect_attempt",
  RECONNECT_FAILED: "reconnect_failed",
  RECONNECT_ERROR: "reconnect_error",

  // Outbound events (Client -> Server)
  JOIN_SHIPMENT: "joinShipment",
  LEAVE_SHIPMENT: "leaveShipment",
  JOIN_OFFICE: "joinOffice",
  LEAVE_OFFICE: "leaveOffice",
  JOIN_ROLE: "joinRole",
  LEAVE_ROLE: "leaveRole",
  CAPTAIN_UPDATE_LOCATION: "captain:updateLocation",

  // Inbound events (Server -> Client)
  LOCATION_UPDATE: "locationUpdate",
  STATUS_UPDATE: "statusUpdate",
  NEW_NOTIFICATION: "newNotification",
  TRACKING_ERROR: "trackingError",
  TICKET_MESSAGE: (ticketId: string) => `ticket:${ticketId}:message`,
} as const;

export const SOCKET_ROOMS = {
  USER: (userId: string) => `user:${userId}`,
  SHIPMENT: (shipmentId: string) => `shipment:${shipmentId}`,
  OFFICE: (officeId: string) => `office:${officeId}`,
  ROLE: (role: string) => `role:${role}`,
} as const;
