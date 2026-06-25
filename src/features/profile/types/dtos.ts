// Profile feature – request / response DTOs

export interface UpdateCustomerProfileRequest {
  name?: string;
  phone?: string;
  email?: string;
  avatar?: string;
}

export interface UpdateProviderProfileRequest {
  name?: string;
  phone?: string;
}
