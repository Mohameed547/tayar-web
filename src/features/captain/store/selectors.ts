// Selectors for the captain dashboard store slices.
// RootState keys "captainDashboard" and "captainData" are unchanged.
import type { RootState } from "@/store";

// ─── Dashboard UI state (dashboard-slice) ─────────────────────────────────────
export const selectActiveScreen  = (state: RootState) => state.captainDashboard.activeScreen;
export const selectAccountType   = (state: RootState) => state.captainDashboard.accountType;
export const selectSidebarOpen   = (state: RootState) => state.captainDashboard.sidebarOpen;
export const selectIsOnline      = (state: RootState) => state.captainDashboard.isOnline;

// ─── Domain data (data-slice) ─────────────────────────────────────────────────
export const selectRequests      = (state: RootState) => state.captainData.requests;
export const selectOffers        = (state: RootState) => state.captainData.offers;
export const selectOrders        = (state: RootState) => state.captainData.orders;
export const selectDeliveries    = (state: RootState) => state.captainData.deliveries;
export const selectCaptains      = (state: RootState) => state.captainData.captains;
export const selectEarnings      = (state: RootState) => state.captainData.earnings;
export const selectWallet        = (state: RootState) => state.captainData.wallet;
export const selectRating        = (state: RootState) => state.captainData.rating;
export const selectVerification  = (state: RootState) => state.captainData.verification;
export const selectProfile       = (state: RootState) => state.captainData.profile;
export const selectCaptainDataStatus = (state: RootState) => state.captainData.status;
export const selectCaptainDataError  = (state: RootState) => state.captainData.error;
