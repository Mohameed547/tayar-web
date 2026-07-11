import { Socket } from "socket.io-client";

export type SocketStatus =
  | "connected"
  | "disconnected"
  | "connecting"
  | "reconnecting"
  | "error";

export interface LocationCoordinates {
  coords: [number, number]; // [longitude, latitude]
  progressPercent: number;
  updatedAt: string;
}

export interface StatusUpdatePayload {
  shipmentId: string;
  status: string;
  note?: string;
  timestamp: string;
}

export interface NotificationPayload {
  _id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  relatedShipment?: string;
  isRead: boolean;
  createdAt: string;
}

export interface TrackingErrorPayload {
  message: string;
}

export interface SocketContextType {
  socket: Socket | null;
  status: SocketStatus;
  error: Error | null;
  isOnline: boolean;
  
  // Room Actions
  joinShipment: (shipmentId: string) => void;
  leaveShipment: (shipmentId: string) => void;
  joinOffice: (officeId: string) => void;
  leaveOffice: (officeId: string) => void;
  joinRole: (role: string) => void;
  leaveRole: (role: string) => void;
  
  // Event Emitters
  emitLocation: (shipmentId: string, lng: number, lat: number) => void;
  
  // Custom Listener Registration (Centralized, prevents duplicates)
  registerListener: <T>(event: string, callback: (data: T) => void) => () => void;
}
