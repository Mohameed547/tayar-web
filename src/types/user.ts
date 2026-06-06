
export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  vehicleType: string;
  vehiclePlate: string;
  licenseNumber: string;
  isAvailable: boolean;
  rating: number;
  totalDeliveries: number;
}
