import { configureStore } from '@reduxjs/toolkit'
import uiReducer   from './features/uiSlice'
import dataReducer from './features/dataSlice'

export const store = configureStore({
  reducer: {
    ui:   uiReducer,
    data: dataReducer,
  },
})

export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
