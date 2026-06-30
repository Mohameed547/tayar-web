// Wallet feature – request / response DTOs

export interface TopUpRequest {
  amount: number;
  paymentMethod: string;
  phone?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface WithdrawRequest {
  amount: number;
  destination: string;
}
