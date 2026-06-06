import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type {
  Request, Offer, Order, Delivery, Captain,
  EarningsData, Wallet, Rating, VerificationStatus, Profile,
} from '@/types'
import api from '@/lib/api'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_REQUESTS: Request[] = [
  { id: '#SR-9921', route: 'Heliopolis → Al Agami, Alexandria', weight: '5 kg', packageType: 'Electronics', expiresIn: '20m', pickup: 'Heliopolis, Cairo', dropoff: 'Al Agami, Alexandria' },
  { id: '#SR-9922', route: 'Maadi → Nasr City',                 weight: '3 kg', packageType: 'Documents',   expiresIn: '1h',  pickup: 'Maadi, Cairo',      dropoff: 'Nasr City, Cairo'     },
  { id: '#SR-9923', route: 'Giza → Port Said',                  weight: '22 kg',packageType: 'Furniture',   expiresIn: '2h',  pickup: 'Giza, Cairo',       dropoff: 'Port Said'            },
]

const MOCK_OFFERS: Offer[] = [
  { id: 'OFF-001', requestId: '#SR-9921', quoteEGP: 450, status: 'pending'  },
  { id: 'OFF-002', requestId: '#SR-9920', quoteEGP: 280, status: 'accepted' },
  { id: 'OFF-003', requestId: '#SR-9919', quoteEGP: 620, status: 'rejected' },
]

const MOCK_ORDERS: Order[] = [
  { id: '#ORD-7721', clientName: 'Ahmed M.',  priceEGP: 600, status: 'pending_assignment' },
  { id: '#ORD-7720', clientName: 'Sara K.',   priceEGP: 350, status: 'assigned'           },
]

const MOCK_DELIVERIES: Delivery[] = [
  { id: '#ORD-5501', captain: 'Captain Ahmed R.', route: 'Cairo → Tanta',     status: 'On Road'        },
  { id: '#ORD-5498', captain: 'Captain Mohamed', route: 'Giza → Alexandria', status: 'Out for Delivery'},
]

const MOCK_CAPTAINS: Captain[] = [
  { id: 'CAP-01', name: 'Mohamed El-Sayed', phone: '01023456789', status: 'available' },
  { id: 'CAP-02', name: 'Ahmed Hossam',     phone: '01298765432', status: 'busy'      },
  { id: 'CAP-03', name: 'Tarek Hassan',     phone: '01112345678', status: 'offline'   },
]

const MOCK_EARNINGS: EarningsData = {
  thisMonth:     24900,
  clearedPayouts:18500,
  platformFees:   1200,
  todayEarnings:  4280,
}

const MOCK_WALLET: Wallet = {
  balanceEGP: 6400,
  transactions: [
    { id: 'T1', description: 'Order #ORD-4410 payment', amountEGP:  320, type: 'credit', date: 'Jun 3, 2026' },
    { id: 'T2', description: 'Cashout processing',      amountEGP: 2000, type: 'debit',  date: 'Jun 2, 2026' },
    { id: 'T3', description: 'Order #ORD-4408 payment', amountEGP:  520, type: 'credit', date: 'Jun 1, 2026' },
  ],
}

const MOCK_RATING: Rating = { score: 4.9, totalReviews: 140 }

const MOCK_VERIFICATION: Record<'office' | 'captain', VerificationStatus> = {
  office:  { isVerified: true, complianceText: 'Commercial records and ID card are active.'    },
  captain: { isVerified: true, complianceText: 'National ID Verification is Active.'           },
}

const MOCK_PROFILE: Record<'office' | 'captain', Profile> = {
  office:  { name: 'Sherif Logistics Co.', phone: '+20 100 234 5678' },
  captain: { name: 'Mohamed El-Sayed',     phone: '+20 112 345 6789' },
}

// ─── Async Thunks (ready for real API) ───────────────────────────────────────
export const fetchRequests  = createAsyncThunk('data/fetchRequests',  async () => { try { const r = await api.get('/api/requests');  return r.data as Request[]  } catch { return MOCK_REQUESTS  } })
export const fetchOffers    = createAsyncThunk('data/fetchOffers',    async () => { try { const r = await api.get('/api/offers');    return r.data as Offer[]    } catch { return MOCK_OFFERS    } })
export const fetchOrders    = createAsyncThunk('data/fetchOrders',    async () => { try { const r = await api.get('/api/orders');    return r.data as Order[]    } catch { return MOCK_ORDERS    } })
export const fetchDeliveries= createAsyncThunk('data/fetchDeliveries',async () => { try { const r = await api.get('/api/deliveries');return r.data as Delivery[] } catch { return MOCK_DELIVERIES } })
export const fetchEarnings  = createAsyncThunk('data/fetchEarnings',  async () => { try { const r = await api.get('/api/earnings');  return r.data as EarningsData } catch { return MOCK_EARNINGS } })
export const fetchWallet    = createAsyncThunk('data/fetchWallet',    async () => { try { const r = await api.get('/api/wallet');    return r.data as Wallet     } catch { return MOCK_WALLET    } })
export const fetchCaptains  = createAsyncThunk('data/fetchCaptains',  async () => { try { const r = await api.get('/api/captains');  return r.data as Captain[]  } catch { return MOCK_CAPTAINS  } })

// ─── State Interface ──────────────────────────────────────────────────────────
interface DataState {
  requests:     Request[]
  offers:       Offer[]
  orders:       Order[]
  deliveries:   Delivery[]
  captains:     Captain[]
  earnings:     EarningsData
  wallet:       Wallet
  rating:       Rating
  verification: VerificationStatus
  profile:      Profile
  loading:      boolean
  error:        string | null
}

const initialState: DataState = {
  requests:     MOCK_REQUESTS,
  offers:       MOCK_OFFERS,
  orders:       MOCK_ORDERS,
  deliveries:   MOCK_DELIVERIES,
  captains:     MOCK_CAPTAINS,
  earnings:     MOCK_EARNINGS,
  wallet:       MOCK_WALLET,
  rating:       MOCK_RATING,
  verification: MOCK_VERIFICATION.office,
  profile:      MOCK_PROFILE.office,
  loading:      false,
  error:        null,
}

// ─── Helpers for rejected/fulfilled matchers ──────────────────────────────────
function startLoading(state: DataState)                         { state.loading = true;  state.error = null }
function stopLoading (state: DataState)                         { state.loading = false }
function setError    (state: DataState, msg: string | undefined){ state.loading = false; state.error = msg ?? 'Unknown error' }

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // Sync: swap profile/verification when account type changes
    switchAccountTypeData(state, action: PayloadAction<'office' | 'captain'>) {
      state.profile      = MOCK_PROFILE[action.payload]
      state.verification = MOCK_VERIFICATION[action.payload]
    },
    updateProfile(state, action: PayloadAction<Partial<Profile>>) {
      state.profile = { ...state.profile, ...action.payload }
    },
  },
  extraReducers: builder => {
    // requests
    builder.addCase(fetchRequests.pending,   startLoading)
    builder.addCase(fetchRequests.fulfilled, (s, a) => { stopLoading(s); s.requests = a.payload })
    builder.addCase(fetchRequests.rejected,  (s, a) => setError(s, a.error.message))
    // offers
    builder.addCase(fetchOffers.pending,   startLoading)
    builder.addCase(fetchOffers.fulfilled, (s, a) => { stopLoading(s); s.offers = a.payload })
    builder.addCase(fetchOffers.rejected,  (s, a) => setError(s, a.error.message))
    // orders
    builder.addCase(fetchOrders.pending,   startLoading)
    builder.addCase(fetchOrders.fulfilled, (s, a) => { stopLoading(s); s.orders = a.payload })
    builder.addCase(fetchOrders.rejected,  (s, a) => setError(s, a.error.message))
    // deliveries
    builder.addCase(fetchDeliveries.pending,   startLoading)
    builder.addCase(fetchDeliveries.fulfilled, (s, a) => { stopLoading(s); s.deliveries = a.payload })
    builder.addCase(fetchDeliveries.rejected,  (s, a) => setError(s, a.error.message))
    // earnings
    builder.addCase(fetchEarnings.pending,   startLoading)
    builder.addCase(fetchEarnings.fulfilled, (s, a) => { stopLoading(s); s.earnings = a.payload })
    builder.addCase(fetchEarnings.rejected,  (s, a) => setError(s, a.error.message))
    // wallet
    builder.addCase(fetchWallet.pending,   startLoading)
    builder.addCase(fetchWallet.fulfilled, (s, a) => { stopLoading(s); s.wallet = a.payload })
    builder.addCase(fetchWallet.rejected,  (s, a) => setError(s, a.error.message))
    // captains
    builder.addCase(fetchCaptains.pending,   startLoading)
    builder.addCase(fetchCaptains.fulfilled, (s, a) => { stopLoading(s); s.captains = a.payload })
    builder.addCase(fetchCaptains.rejected,  (s, a) => setError(s, a.error.message))
  },
})

export const { switchAccountTypeData, updateProfile } = dataSlice.actions
export default dataSlice.reducer
