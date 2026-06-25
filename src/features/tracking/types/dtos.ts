import type { Delivery } from "./index";

export interface UpdateDeliveryStatusRequest {
  status: Delivery["status"];
}
