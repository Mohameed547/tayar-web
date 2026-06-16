import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  AccountType,
  ScreenId,
} from "@/modules/captain/types/provider";

export interface CaptainDashboardState {
  activeScreen: ScreenId;
  accountType: AccountType;
  sidebarOpen: boolean;
  isOnline: boolean;
}

const officeOnlyScreens: ReadonlySet<ScreenId> = new Set([
  "deliveries",
  "tracking",
  "team",
  "captain-tracking",
  "performance",
]);

const initialState: CaptainDashboardState = {
  activeScreen: "overview",
  accountType: "office",
  sidebarOpen: false,
  isOnline: true,
};

const captainDashboardSlice = createSlice({
  name: "captainDashboard",
  initialState,
  reducers: {
    setActiveScreen(state, action: PayloadAction<ScreenId>) {
      state.activeScreen = action.payload;
    },
    setAccountType(state, action: PayloadAction<AccountType>) {
      state.accountType = action.payload;

      if (
        action.payload === "captain" &&
        officeOnlyScreens.has(state.activeScreen)
      ) {
        state.activeScreen = "overview";
      }
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleOnline(state) {
      state.isOnline = !state.isOnline;
    },
  },
});

export const {
  setActiveScreen,
  setAccountType,
  toggleSidebar,
  setSidebarOpen,
  toggleOnline,
} = captainDashboardSlice.actions;

export default captainDashboardSlice.reducer;
