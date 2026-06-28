// Captain feature – aggregated API surface
// All functions are re-exported from each domain feature's public barrel.
// Never import directly from internal /api/captain-api.ts paths.
export {
  getCaptainRequests,
  getCaptainRequestById,
  getCaptainOrders,
  getCaptainOrderById,
  updateOrderStatus,
} from "@/features/shipments";

export {
  getCaptainOffers,
  submitOffer,
  withdrawOffer,
} from "@/features/offers";

export {
  getCaptainDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
} from "@/features/tracking";

export {
  getCaptainEarnings,
  getCaptainWallet,
  getCaptainTransactions,
} from "@/features/wallet";

export { getProviderRating } from "@/features/reviews";

export { getTeamCaptains, addTeamCaptain, updateCaptainStatus, updateDriverAvailability, updateOfficeAvailability, assignShipmentToCaptain, reassignShipmentToCaptain, getCaptainTracking } from "@/features/office";
