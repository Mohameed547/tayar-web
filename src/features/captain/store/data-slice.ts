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
import { getProviderRating }                     from "@/features/reviews/api/captain-api";
import { getVerificationStatus }                 from "@/features/verification";

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
  requests: [],
  offers: [],
  orders: [],
  deliveries: [],
  captains: [],
  earnings: {
    thisMonth: 0,
    clearedPayouts: 0,
    platformFees: 0,
    todayEarnings: 0,
  },
  wallet: {
    balanceEGP: 0,
    transactions: [],
  },
  rating: {
    score: 0,
    totalReviews: 0,
    averageRating: 0,
    ratingsCount: 0,
    reviews: [],
  },
  profile: mockProfileByAccount.office,
  verification: { isVerified: false, complianceText: "Verification pending.", status: "pending" },
  status: "idle",
  error: null,
};

// Fetches each domain independently — no monolith
export const fetchCaptainDashboard = createAsyncThunk<
  ProviderDashboardData & { verification: VerificationStatus },
  "office" | "captain" | undefined,
  { rejectValue: string }
>("captainData/fetchDashboard", async (accountType, { rejectWithValue }) => {
  try {
    const isOffice = accountType === "office";

    // 1. Fetch verification status first
    const verStatus = await getVerificationStatus().catch((err) => {
      console.error("Failed to fetch verification status:", err);
      return {
        isVerified: false,
        status: "pending",
        complianceText: "Your verification request is pending review.",
      };
    });

    // 2. If not verified, do not load any protected data (return empty/zero structures to remove mock data)
    if (!verStatus.isVerified) {
      return {
        requests: [],
        offers: [],
        orders: [],
        deliveries: [],
        captains: [],
        earnings: {
          thisMonth: 0,
          clearedPayouts: 0,
          platformFees: 0,
          todayEarnings: 0,
        },
        wallet: {
          balanceEGP: 0,
          transactions: [],
        },
        rating: {
          score: 0,
          totalReviews: 0,
          averageRating: 0,
          ratingsCount: 0,
          reviews: [],
        },
        verification: verStatus,
      };
    }

    // 3. If verified, fetch everything as usual
    const [requests, offers, orders, deliveries, captains, earnings, wallet, rating] =
      await Promise.all([
        getCaptainRequests().catch((err) => {
          console.error("Failed to fetch requests:", err);
          return [];
        }),
        getCaptainOffers().catch((err) => {
          console.error("Failed to fetch offers:", err);
          return [];
        }),
        getCaptainOrders(accountType).catch((err) => {
          console.error("Failed to fetch orders:", err);
          return [];
        }),
        getCaptainDeliveries().catch((err) => {
          console.error("Failed to fetch deliveries:", err);
          return [];
        }),
        isOffice
          ? getTeamCaptains().catch((err) => {
              console.error("Failed to fetch team captains:", err);
              return [];
            })
          : Promise.resolve([]),
        getCaptainEarnings(accountType).catch((err) => {
          console.error("Failed to fetch earnings:", err);
          return { thisMonth: 0, clearedPayouts: 0, platformFees: 0, todayEarnings: 0 };
        }),
        getCaptainWallet().catch((err) => {
          console.error("Failed to fetch wallet:", err);
          return { balanceEGP: 0, transactions: [] };
        }),
        getProviderRating(accountType).catch((err) => {
          console.error("Failed to fetch rating:", err);
          return { score: 0, totalReviews: 0, averageRating: 0, ratingsCount: 0, reviews: [] };
        }),
      ]);

    return { requests, offers, orders, deliveries, captains, earnings, wallet, rating, verification: verStatus };
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
    addCaptainToStore(state, action: PayloadAction<any>) {
      if (!Array.isArray(state.captains)) {
        state.captains = [];
      }
      state.captains.unshift(action.payload);
    },
    setCaptainsInStore(state, action: PayloadAction<any[]>) {
      state.captains = action.payload;
    },
    updateCaptainStatusInStore(state, action: PayloadAction<{ id: string; status: any }>) {
      if (Array.isArray(state.captains)) {
        const captain = state.captains.find((c: any) => (c.id === action.payload.id || c._id === action.payload.id));
        if (captain) {
          captain.status = action.payload.status;
        }
      }
    },
    updateCaptainRelationshipStatusInStore(state, action: PayloadAction<{ id: string; relationshipStatus: any }>) {
      if (Array.isArray(state.captains)) {
        const captain = state.captains.find((c: any) => (c.id === action.payload.id || c._id === action.payload.id));
        if (captain) {
          captain.relationshipStatus = action.payload.relationshipStatus;
        }
      }
    },
    setVerificationStatusInStore(state, action: PayloadAction<VerificationStatus>) {
      state.verification = action.payload;
    },
    removeCaptainFromStore(state, action: PayloadAction<string>) {
      if (Array.isArray(state.captains)) {
        state.captains = state.captains.filter((c: any) => c.id !== action.payload && c._id !== action.payload);
      }
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

export const {
  switchAccountTypeData,
  updateProfile,
  addCaptainToStore,
  updateCaptainStatusInStore,
  setCaptainsInStore,
  updateCaptainRelationshipStatusInStore,
  setVerificationStatusInStore,
  removeCaptainFromStore
} = captainDataSlice.actions;

export default captainDataSlice.reducer;
