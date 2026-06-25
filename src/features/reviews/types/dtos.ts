// Reviews feature – request / response DTOs

export interface CreateReviewRequest {
  captainId: string;
  officeId?: string;
  shipmentId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}
