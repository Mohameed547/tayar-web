import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

// Domain APIs — imported through each feature's public barrel
import { getCaptainRequests, getCaptainOrders } from "@/features/shipments";
import { getCaptainOffers }                      from "@/features/offers";
import { getCaptainDeliveries }                  from "@/features/tracking";
import { getTeamCaptains }                       from "@/features/office";
import { getCaptainEarnings, getCaptainWallet }  from "@/features/wallet";
import { getProviderRating }                     from "@/features/reviews";

import {
  mockProviderDashboardData,
  mockProfileByAccount,
  mockVerificationByAccount,
  type ProviderDashboardData,
} from "@/features/captain/data/mock-dashboard-data";

import type { AccountType } from "@/features/captain/types";
import type { ProviderProfile } from "@/features/profile";
import type { VerificationStatus } from "@/features/verification";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export interface CaptainDataState extends ProviderDashboardData {
  profile: ProviderProfile;
  verification: VerificationStatus;
  status: RequestStatus;
  error: string | null;
}

const initialState: CaptainDataState = {
  ...mockProviderDashboardData,
  profile: mockProfileByAccount.office,
  verification: mockVerificationByAccount.office,
  status: "idle",
  error: null,
};

// Fetches each domain independently — no monolith
export const fetchCaptainDashboard = createAsyncThunk<
  ProviderDashboardData,
  void,
  { rejectValue: string }
>("captainData/fetchDashboard", async (_, { rejectWithValue }) => {
  try {
    const [requests, offers, orders, deliveries, captains, earnings, wallet, rating] =
      await Promise.all([
        getCaptainRequests(),
        getCaptainOffers(),
        getCaptainOrders(),
        getCaptainDeliveries(),
        getTeamCaptains(),
        getCaptainEarnings(),
        getCaptainWallet(),
        getProviderRating(),
      ]);

    return { requests, offers, orders, deliveries, captains, earnings, wallet, rating };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load dashboard data";
    return rejectWithValue(message);
  }
});

const captainDataSlice = createSlice({
  name: "captainData",
  initialState,
  reducers: {
    switchAccountTypeData(state, action: PayloadAction<AccountType>) {
      state.profile = mockProfileByAccount[action.payload];
      state.verification = mockVerificationByAccount[action.payload];
    },
    updateProfile(state, action: PayloadAction<Partial<ProviderProfile>>) {
      state.profile = { ...state.profile, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCaptainDashboard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCaptainDashboard.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
        state.status = "succeeded";
      })
      .addCase(fetchCaptainDashboard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Unknown error";
      });
  },
});

export const { switchAccountTypeData, updateProfile } =
  captainDataSlice.actions;

export default captainDataSlice.reducer;
