import api from "@/lib/api/client";
import { mockProviderDashboardData } from "@/modules/captain/data/mock-provider-data";
import type { ProviderDashboardData } from "@/modules/captain/types/provider";

type DashboardResource = keyof ProviderDashboardData;

async function getResource<Key extends DashboardResource>(
  resource: Key
): Promise<ProviderDashboardData[Key]> {
  try {
    const response = await api.get<ProviderDashboardData[Key]>(
      `/api/${resource}`
    );
    return response.data;
  } catch {
    return mockProviderDashboardData[resource];
  }
}

export async function getProviderDashboardData(): Promise<ProviderDashboardData> {
  const [
    requests,
    offers,
    orders,
    deliveries,
    captains,
    earnings,
    wallet,
    rating,
  ] = await Promise.all([
    getResource("requests"),
    getResource("offers"),
    getResource("orders"),
    getResource("deliveries"),
    getResource("captains"),
    getResource("earnings"),
    getResource("wallet"),
    getResource("rating"),
  ]);

  return {
    requests,
    offers,
    orders,
    deliveries,
    captains,
    earnings,
    wallet,
    rating,
  };
}
