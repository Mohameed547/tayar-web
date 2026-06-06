import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AccountType, Language, ScreenId, Theme } from '@/types'

interface UIState {
  theme:        Theme
  language:     Language
  activeScreen: ScreenId
  accountType:  AccountType
  sidebarOpen:  boolean
  isOnline:     boolean
}

const initialState: UIState = {
  theme:        'light',
  language:     'en',
  activeScreen: 'overview',
  accountType:  'office',
  sidebarOpen:  false,
  isOnline:     true,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload
    },
    toggleLanguage(state) {
      state.language = state.language === 'en' ? 'ar' : 'en'
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload
    },
    setActiveScreen(state, action: PayloadAction<ScreenId>) {
      state.activeScreen = action.payload
    },
    setAccountType(state, action: PayloadAction<AccountType>) {
      state.accountType = action.payload
      // If switching to captain while on office-only screen → reset to overview
      const officeOnly: ScreenId[] = ['deliveries', 'tracking', 'team', 'captain-tracking', 'performance']
      if (action.payload === 'captain' && officeOnly.includes(state.activeScreen)) {
        state.activeScreen = 'overview'
      }
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload
    },
    toggleOnline(state) {
      state.isOnline = !state.isOnline
    },
  },
})

export const {
  toggleTheme, setTheme,
  toggleLanguage, setLanguage,
  setActiveScreen,
  setAccountType,
  toggleSidebar, setSidebarOpen,
  toggleOnline,
} = uiSlice.actions

export default uiSlice.reducer
