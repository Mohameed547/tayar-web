// Support feature – request / response DTOs
import type { SupportCategory } from "./index";

export interface CreateTicketRequest {
  subject: string;
  category: SupportCategory;
  message: string;
  shipmentId: string;
}

export interface UpdateTicketRequest {
  subject?: string;
  message?: string;
}
