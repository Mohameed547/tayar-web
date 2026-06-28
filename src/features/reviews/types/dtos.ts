// Reviews feature – request / response DTOs

export interface CreateReviewRequest {
  shipmentId: string;
  revieweeType: "Driver" | "Office";
  revieweeId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}
