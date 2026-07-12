import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getShipments } from "@/features/shipments/api";
import { getWallet } from "@/features/wallet/api";
import { getReviews } from "@/features/reviews/api";
import { getCustomerProfile } from "@/features/profile";
import type { Shipment } from "@/features/shipments/types";
import { getVerificationStatus } from "@/features/verification/api";
import type { VerificationStatus } from "@/features/verification/types";

export interface CustomerState {
  customerName: string;
  shipments: Shipment[];
  walletBalance: string;
  averageRating: string;
  verification: VerificationStatus;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CustomerState = {
  customerName: "Customer",
  shipments: [],
  walletBalance: "EGP 0",
  averageRating: "5.0",
  verification: { isVerified: false, status: "pending", complianceText: "Verification pending." },
  status: "idle",
  error: null,
};

export const fetchCustomerDashboard = createAsyncThunk(
  "customer/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      // 1. Fetch verification status first
      const verStatus = await getVerificationStatus().catch((err) => {
        console.error("Failed to load verification status:", err);
        return {
          isVerified: false,
          status: "pending",
          complianceText: "Your verification request is pending review.",
        };
      });

      const profileName = await getCustomerProfile()
        .then((data) => data.name || "Customer")
        .catch(() => "Customer");



      // 3. Otherwise fetch everything normally
      const [loadedShipments, balance, ratingVal] = await Promise.all([
        getShipments().catch((err) => {
          console.error("Failed to load shipments:", err);
          return [];
        }),
        getWallet()
          .then((w) => `EGP ${w.balance}`)
          .catch((err) => {
            console.error("Failed to load wallet:", err);
            return "EGP 0";
          }),
        getReviews()
          .then((res) => {
            return res && typeof res.averageRating === "number"
              ? res.averageRating.toFixed(1)
              : "5.0";
          })
          .catch((err) => {
            console.error("Failed to load reviews:", err);
            return "5.0";
          }),
      ]);

      return {
        customerName: profileName,
        shipments: loadedShipments,
        walletBalance: balance,
        averageRating: ratingVal,
        verification: verStatus,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load dashboard data");
    }
  }
);

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    updateWalletBalance(state, action: PayloadAction<string>) {
      state.walletBalance = action.payload;
    },
    updateShipmentInStore(state, action: PayloadAction<Shipment>) {
      const index = state.shipments.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.shipments[index] = action.payload;
      } else {
        state.shipments.unshift(action.payload);
      }
    },
    updateShipmentStatusInStore(
      state,
      action: PayloadAction<{ shipmentId: string; status: any }>
    ) {
      const shipment = state.shipments.find((s) => s.id === action.payload.shipmentId);
      if (shipment) {
        shipment.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerDashboard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCustomerDashboard.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.customerName = action.payload.customerName;
        state.shipments = action.payload.shipments;
        state.walletBalance = action.payload.walletBalance;
        state.averageRating = action.payload.averageRating;
        state.verification = action.payload.verification;
      })
      .addCase(fetchCustomerDashboard.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load dashboard data";
      });
  },
});

export const { updateWalletBalance, updateShipmentInStore, updateShipmentStatusInStore } =
  customerSlice.actions;

export default customerSlice.reducer;
