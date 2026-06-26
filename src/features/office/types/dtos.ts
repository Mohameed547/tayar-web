import type { Captain } from "./index";

export interface AddTeamCaptainRequest {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  vehicleType: "motorcycle" | "car" | "van" | "truck";
  plateNumber: string;
}

export interface UpdateCaptainStatusRequest {
  status: Captain["status"];
}
