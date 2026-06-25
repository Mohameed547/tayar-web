// Wallet feature – request / response DTOs

export interface TopUpRequest {
  amount: number;
  paymentMethod: string;
}

export interface WithdrawRequest {
  amount: number;
  destination: string;
}
