// Users feature – request / response DTOs

export interface UpdateUserStatusRequest {
  status: "active" | "suspended" | "pending";
}

export interface UpdateUserRoleRequest {
  role: "customer" | "driver" | "admin";
}
