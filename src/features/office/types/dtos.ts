import type { Captain } from "./index";

export interface AddTeamCaptainRequest {
  name: string;
  phone: string;
  status: Captain["status"];
}

export interface UpdateCaptainStatusRequest {
  status: Captain["status"];
}
