"use client";

import { useEffect, useRef } from "react";
import { useSocket } from "./socket-context";
import { SOCKET_EVENTS } from "./constants";
import { LocationCoordinates, StatusUpdatePayload, NotificationPayload, TrackingErrorPayload } from "./types";

/**
 * Reusable React hook to subscribe to any socket event.
 * Automatically handles registering on mount, cleaning up on unmount,
 * and uses a callback ref to prevent unsubscribe/resubscribe cycles on render.
 *
 * @param event The socket event name to listen to.
 * @param callback Callback function when the event is received.
 */
export function useSocketEvent<T>(
  event: string,
  callback: (data: T) => void,
  _deps?: React.DependencyList
) {
  const { registerListener } = useSocket();
  const callbackRef = useRef<(data: T) => void>(callback);

  // Sync the latest callback reference on every render
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleEvent = (data: T) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    };

    const unsubscribe = registerListener<T>(event, handleEvent);
    return () => {
      unsubscribe();
    };
  }, [event, registerListener]);
}

/**
 * Reusable React hook for shipment-specific real-time tracking.
 * Automatically joins the shipment room, listens for updates, and leaves on unmount.
 */
export function useShipmentTracking(
  shipmentId: string | null | undefined,
  callbacks: {
    onLocationUpdate?: (data: LocationCoordinates) => void;
    onStatusUpdate?: (data: StatusUpdatePayload) => void;
    onError?: (data: TrackingErrorPayload) => void;
  }
) {
  const { joinShipment, leaveShipment } = useSocket();
  const { onLocationUpdate, onStatusUpdate, onError } = callbacks;

  // Join shipment room on mount/change, leave on unmount/change
  useEffect(() => {
    if (!shipmentId) return;

    joinShipment(shipmentId);

    return () => {
      leaveShipment(shipmentId);
    };
  }, [shipmentId, joinShipment, leaveShipment]);

  // Listen to location updates
  useSocketEvent<LocationCoordinates>(
    SOCKET_EVENTS.LOCATION_UPDATE,
    (data) => {
      if (onLocationUpdate) onLocationUpdate(data);
    }
  );

  // Listen to status updates
  useSocketEvent<StatusUpdatePayload>(
    SOCKET_EVENTS.STATUS_UPDATE,
    (data) => {
      if (onStatusUpdate && data.shipmentId === shipmentId) {
        onStatusUpdate(data);
      }
    }
  );

  // Listen to errors
  useSocketEvent<TrackingErrorPayload>(
    SOCKET_EVENTS.TRACKING_ERROR,
    (data) => {
      if (onError) onError(data);
    }
  );
}

/**
 * Reusable React hook for real-time notifications.
 */
export function useNotificationsListener(onNotification: (data: NotificationPayload) => void) {
  useSocketEvent<NotificationPayload>(
    SOCKET_EVENTS.NEW_NOTIFICATION,
    onNotification
  );
}
