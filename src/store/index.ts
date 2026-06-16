import { configureStore } from "@reduxjs/toolkit";
import captainDashboardReducer from "@/modules/captain/store/captain-dashboard-slice";
import captainDataReducer from "@/modules/captain/store/captain-data-slice";

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
