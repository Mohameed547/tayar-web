import { configureStore } from "@reduxjs/toolkit";
import captainDashboardReducer from "@/features/captain/store/dashboard-slice";
import captainDataReducer from "@/features/captain/store/data-slice";

export const makeStore = () =>
  configureStore({
    reducer: {
      captainDashboard: captainDashboardReducer,
      captainData: captainDataReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
