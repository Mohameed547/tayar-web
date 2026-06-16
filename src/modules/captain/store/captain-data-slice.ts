import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { getProviderDashboardData } from "@/modules/captain/api/provider-api";
import {
  mockProfileByAccount,
  mockProviderDashboardData,
  mockVerificationByAccount,
} from "@/modules/captain/data/mock-provider-data";
import type {
  AccountType,
  ProviderDashboardData,
  ProviderProfile,
  VerificationStatus,
} from "@/modules/captain/types/provider";

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

export const fetchCaptainDashboard = createAsyncThunk<
  ProviderDashboardData,
  void,
  { rejectValue: string }
>("captainData/fetchDashboard", async (_, { rejectWithValue }) => {
  try {
    return await getProviderDashboardData();
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
