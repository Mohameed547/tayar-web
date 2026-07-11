import { configureStore } from "@reduxjs/toolkit";
import captainDashboardReducer from "@/features/captain/store/dashboard-slice";
import captainDataReducer from "@/features/captain/store/data-slice";
import customerReducer from "@/store/customer-slice";

export const makeStore = () =>
  configureStore({
    reducer: {
      captainDashboard: captainDashboardReducer,
      captainData: captainDataReducer,
      customer: customerReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
