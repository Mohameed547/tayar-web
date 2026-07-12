'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, X, Lock, User, FileText } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setActiveScreen, setOnlineState } from '@/features/captain/store/dashboard-slice'
import {
  selectAccountType,
  selectOrders,
  selectCaptains,
} from '@/features/captain/store/selectors'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import Card from '@/shared/ui/Card'
import Badge from '@/shared/ui/Badge'
import { assignShipmentToCaptain, reassignShipmentToCaptain, updateDriverAvailability } from '@/features/office'
import { updateOrderStatus, acceptAssignment, rejectAssignment, pingLocation } from '@/features/shipments'
import { fetchCaptainDashboard } from '@/features/captain/store/data-slice'
import { useLocale } from 'next-intl'
import { useSocket, useNotificationsListener, useSocketEvent } from '@/shared/socket'

import dynamic from 'next/dynamic'

const MapView = dynamic(() => import("@/shared/ui/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] w-full bg-[var(--color-bg-muted)] flex items-center justify-center text-xs text-[var(--color-text-sub)] font-semibold border border-[var(--color-border)] rounded-xl mt-3">
      Loading map...
    </div>
  ),
})

function OrderAssignmentControl({ order, captains, isRTL }: { order: any; captains: any[]; isRTL: boolean }) {
  const dispatch = useAppDispatch()
  const t = useCaptainTranslations()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [discount, setDiscount] = useState<number>(0)

  const handleAssign = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const captainId = e.target.value
    if (!captainId) return

    setLoading(true)
    setErrorMsg('')
    try {
      if (order.status === 'pending_assignment') {
        await assignShipmentToCaptain(order.id, captainId, discount)
      } else {
        await reassignShipmentToCaptain(order.id, captainId, discount)
      }
      dispatch(fetchCaptainDashboard('office'))
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.response?.data?.message || err.message || t('orderActionError'))
    } finally {
      setLoading(false)
    }
  }

  // Filter out offline captains, captains in independent mode, or captains active for another office.
  // We keep the captain currently assigned to the order (if any) so it remains selected.
  const activeCaptains = captains.filter(c => {
    if (order.captain && order.captain.id === c.userId) return true;
    return (
      c.status !== 'offline' &&
      c.workingMode === 'office' &&
      c.activeOfficeId &&
      c.officeId &&
      c.activeOfficeId === c.officeId
    );
  })
  const sortedCaptains = [...activeCaptains].sort((a, b) => {
    if (a.status === 'available' && b.status !== 'available') return -1
    if (a.status !== 'available' && b.status === 'available') return 1
    return 0
  })

  const currentCaptain = captains.find(c => c.userId === order.captain?.id)
  const selectedValue = currentCaptain ? currentCaptain.id : ""

  return (
    <div className="flex flex-col gap-1.5 items-end">
      {errorMsg && (
        <span className="text-[10px] text-red-400 font-medium mb-1 max-w-[200px] text-right">
          {errorMsg}
        </span>
      )}
      <div className="flex items-center gap-2">
        {loading && (
          <div className="h-3.5 w-3.5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin" />
        )}

        {/* Discount input field */}
        <div className="flex items-center gap-1.5 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg px-2 py-1">
          <span className="text-[10px] text-[var(--color-text-sub)] font-medium">{t('discountLabel')}</span>
          <input
            type="number"
            min={0}
            max={100}
            value={discount}
            onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
            disabled={loading || order.status === 'in_progress' || order.status === 'delivered'}
            className="w-12 bg-transparent text-xs font-semibold text-[var(--color-text-main)] outline-none text-center"
          />
        </div>

        <select
          value={selectedValue}
          disabled={loading || order.status === 'in_progress' || order.status === 'delivered'}
          onChange={handleAssign}
          className="bg-[var(--color-bg-card)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-main)] rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-50"
        >
          <option value="">
            {order.status === 'pending_assignment'
              ? t('reassignCaptain')
              : t('selectCaptain')}
          </option>
          {sortedCaptains.map((cap) => (
            <option key={cap.id} value={cap.id} disabled={cap.status !== 'available' && cap.id !== selectedValue}>
              {cap.name} ({cap.status === 'available' ? t('captainAvailable') : t('captainBusy')})
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function CaptainOrderActionControl({ order, isRTL, t }: { order: any; isRTL: boolean; t: any }) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const locale = useLocale()
  const captainT = useCaptainTranslations()
  const [acceptLoading, setAcceptLoading] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const getErrorMessage = (err: any) => {
    const data = err.response?.data;
    const errorCode = data?.errorCode;
    if (errorCode === 'OFFICE_MODE_ACTIVE') {
      return locale === 'ar' 
        ? '⚠️ غير مسموح: يجب التبديل إلى "وضع المكتب" لقبول هذه الشحنة.' 
        : '⚠️ Not allowed: You must switch to "Office Mode" to accept this shipment.';
    }
    if (errorCode === 'INDEPENDENT_MODE_ACTIVE') {
      return locale === 'ar'
        ? '⚠️ غير مسموح: يجب التبديل إلى "الوضع المستقل" لقبول هذه الشحنة.'
        : '⚠️ Not allowed: You must switch to "Independent Mode" to accept this shipment.';
    }
    return data?.message || err.message || t('orderActionError');
  }

  // PoD Modal States
  const [showPodModal, setShowPodModal] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [packageImage, setPackageImage] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const currentStatus = order.rawStatus || order.status;

  const handleAcceptAssignment = async () => {
    setAcceptLoading(true)
    setErrorMsg('')
    try {
      await acceptAssignment(order.id)
      dispatch(fetchCaptainDashboard('captain'))
    } catch (err: any) {
      console.error(err)
      setErrorMsg(getErrorMessage(err))
    } finally {
      setAcceptLoading(false)
    }
  }

  const handleRejectAssignment = async () => {
    setRejectLoading(true)
    setErrorMsg('')
    try {
      await rejectAssignment(order.id)
      dispatch(fetchCaptainDashboard('captain'))
    } catch (err: any) {
      console.error(err)
      setErrorMsg(getErrorMessage(err))
    } finally {
      setRejectLoading(false)
    }
  }

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPackageImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (order.captainStatus === 'pending') {
    return (
      <div className="flex flex-col gap-1.5 items-end">
        {errorMsg && (
          <span className="text-[10px] text-red-400 font-medium mb-1 max-w-[200px] text-right">
            {errorMsg}
          </span>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleAcceptAssignment}
            disabled={acceptLoading || rejectLoading}
            className="px-3 py-[6px] bg-green-600 hover:bg-green-700 text-white text-[12px] font-semibold rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {acceptLoading && (
              <span className="h-3 w-3 rounded-full border-2 border-t-transparent border-white animate-spin" />
            )}
            {t('acceptOffer')}
          </button>
          <button
            onClick={handleRejectAssignment}
            disabled={acceptLoading || rejectLoading}
            className="px-3 py-[6px] bg-red-600 hover:bg-red-700 text-white text-[12px] font-semibold rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {rejectLoading && (
              <span className="h-3 w-3 rounded-full border-2 border-t-transparent border-white animate-spin" />
            )}
            {t('rejectOffer')}
          </button>
        </div>
      </div>
    )
  }

  if (currentStatus === 'delivered') {
    return null
  }

  const handleAction = async () => {
    let nextStatus = 'delivered';
    if (currentStatus === 'assigned' || currentStatus === 'captain_assignment') {
      nextStatus = 'picked_up';
    } else if (currentStatus === 'picked_up') {
      nextStatus = 'in_transit';
    } else if (currentStatus === 'in_transit' || currentStatus === 'out_for_delivery') {
      nextStatus = 'delivered';
    }

    if (nextStatus === 'delivered') {
      router.push(`/captain-dashboard/verify/${order.id}`);
      return;
    }

    setLoading(true)
    setErrorMsg('')
    try {
      await updateOrderStatus(order.id, { status: nextStatus as any })
      dispatch(fetchCaptainDashboard('captain'))
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.response?.data?.message || err.message || t('orderActionError'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !recipientName) {
      setErrorMsg(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    setLoading(true)
    setErrorMsg('')

    const canvas = canvasRef.current;
    let signatureBase64: string | null = null;
    if (canvas) {
      const blank = document.createElement('canvas');
      blank.width = canvas.width;
      blank.height = canvas.height;
      if (canvas.toDataURL() !== blank.toDataURL()) {
        signatureBase64 = canvas.toDataURL();
      }
    }

    let coords: { lat: number; lng: number } | null = null;
    try {
      coords = await new Promise<{ lat: number; lng: number } | null>((resolve) => {
        if (!navigator.geolocation) {
          resolve(null);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      });
    } catch (gErr) {
      console.error("Geolocation error:", gErr);
    }

    if (!coords) {
      setErrorMsg(isRTL ? 'يرجى السماح بالوصول للموقع الجغرافي لتأكيد التوصيل' : 'Please allow location access to verify delivery');
      setLoading(false);
      return;
    }

    try {
      await updateOrderStatus(order.id, {
        status: 'delivered' as any,
        otpCode,
        recipientName,
        signatureImage: signatureBase64 || undefined,
        packageImage: packageImage || undefined,
        lat: coords.lat,
        lng: coords.lng,
      })

      dispatch(setOnlineState(true))
      try {
        await updateDriverAvailability('available')
      } catch (dbErr) {
        console.error("Failed to update captain status in DB:", dbErr)
      }
      dispatch(fetchCaptainDashboard('captain'))
      setShowPodModal(false)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.response?.data?.message || err.message || t('orderActionError'))
    } finally {
      setLoading(false)
    }
  }

  let buttonText = t('markDelivered')
  let buttonBg = 'bg-blue-600 hover:bg-blue-700'

  if (currentStatus === 'assigned' || currentStatus === 'captain_assignment') {
    buttonText = t('pickUpCargo')
    buttonBg = 'bg-green-600 hover:bg-green-700'
  } else if (currentStatus === 'picked_up') {
    buttonText = t('startRoute')
    buttonBg = 'bg-amber-600 hover:bg-amber-700'
  }

  return (
    <div className="flex flex-col gap-1.5 items-end">
      {errorMsg && (
        <span className="text-[10px] text-red-400 font-medium mb-1 max-w-[200px] text-right">
          {errorMsg}
        </span>
      )}
      <button
        onClick={handleAction}
        disabled={loading}
        className={`px-3 py-[6px] ${buttonBg} text-white text-[12px] font-semibold rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50`}
      >
        {loading && (
          <span className="h-3 w-3 rounded-full border-2 border-t-transparent border-white animate-spin" />
        )}
        {buttonText}
      </button>

      {showPodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div 
            dir={isRTL ? 'rtl' : 'ltr'}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 text-white"
          >
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800">
              <h3 className="text-md font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-500" />
                {isRTL ? 'تأكيد إثبات التوصيل' : 'Confirm Proof of Delivery'}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowPodModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPod} className="p-5 space-y-4">
              {/* Recipient Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRTL ? 'اسم المستلم *' : 'Recipient Name *'}
                </label>
                <div className="relative">
                  <span className={`absolute inset-y-0 ${isRTL ? 'right-3' : 'left-3'} flex items-center text-slate-500`}>
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder={isRTL ? 'أدخل اسم الشخص الذي استلم الشحنة' : 'Enter name of recipient'}
                    className={`w-full bg-slate-800 border border-slate-700 rounded-lg py-2 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-500`}
                  />
                </div>
              </div>

              {/* OTP Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRTL ? 'رمز التحقق (OTP) *' : 'Verification Code (OTP) *'}
                </label>
                <div className="relative">
                  <span className={`absolute inset-y-0 ${isRTL ? 'right-3' : 'left-3'} flex items-center text-slate-500`}>
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="XXXXXX"
                    className={`w-full bg-slate-800 border border-slate-700 rounded-lg py-2 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-sm font-mono tracking-widest text-center text-white focus:outline-none focus:border-blue-500 placeholder-slate-500`}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isRTL 
                    ? 'اطلب رمز الـ OTP المكون من 6 أرقام من العميل لتأكيد تسليم الشحنة.' 
                    : 'Ask the customer for the 6-digit OTP code to verify delivery.'}
                </p>
              </div>

              {/* Package Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRTL ? 'صورة الشحنة المسلمة' : 'Delivered Package Photo'}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg cursor-pointer text-xs font-medium text-slate-200 transition-colors">
                    <Camera className="h-3.5 w-3.5" />
                    {isRTL ? 'التقاط / رفع صورة' : 'Capture / Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  {packageImage && (
                    <div className="relative h-10 w-10 border border-slate-700 rounded-md overflow-hidden">
                      <img src={packageImage} alt="Package" className="h-full w-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setPackageImage(null)}
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700"
                      >
                        <X className="h-2 w-2" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Digital Signature canvas */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {isRTL ? 'توقيع المستلم' : 'Recipient Signature'}
                  </label>
                  <button 
                    type="button" 
                    onClick={clearCanvas}
                    className="text-[10px] text-red-400 hover:text-red-300 font-medium"
                  >
                    {isRTL ? 'مسح التوقيع' : 'Clear'}
                  </button>
                </div>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={380}
                    height={120}
                    className="w-full h-[120px] bg-slate-950 border border-slate-800 rounded-lg cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={endDrawing}
                  />
                </div>
              </div>

              {/* Error block */}
              {errorMsg && (
                <div className="text-xs text-red-400 font-medium text-center bg-red-950/40 border border-red-900/50 py-1.5 rounded-lg">
                  {errorMsg}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPodModal(false)}
                  className="flex-1 py-2 border border-slate-800 hover:bg-slate-800 text-xs font-semibold rounded-lg transition-colors text-slate-300"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-semibold rounded-lg transition-colors text-white flex items-center justify-center gap-1.5"
                >
                  {loading && (
                    <span className="h-3 w-3 rounded-full border-2 border-t-transparent border-white animate-spin" />
                  )}
                  {isRTL ? 'تأكيد الشحنة' : 'Confirm Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Orders() {
  const dispatch = useAppDispatch()
  const t = useCaptainTranslations()
  const accountType = useAppSelector(selectAccountType)
  const orders = useAppSelector(selectOrders)
  const captains = useAppSelector(selectCaptains)
  const locale = useLocale()
  const isRTL = locale === 'ar'
  const isOffice = accountType === 'office'
  const [expandedMapId, setExpandedMapId] = useState<string | null>(null)

  const { emitLocation } = useSocket()

  // Real-time notifications and status updates inside the orders view
  useNotificationsListener(() => {
    dispatch(fetchCaptainDashboard(accountType))
  })

  useSocketEvent("statusUpdate", () => {
    dispatch(fetchCaptainDashboard(accountType))
  })

  // Background location pinging for active shipments in transit via Socket.IO
  useEffect(() => {
    if (accountType !== 'captain') return;

    const activeOrders = orders.filter(o => {
      const s = o.rawStatus || o.status;
      return s === 'picked_up' || s === 'in_transit' || s === 'in_progress' || s === 'out_for_delivery';
    });

    if (activeOrders.length === 0) return;

    const intervalId = setInterval(() => {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Emit the live location coordinates via Socket.IO for each active order
          for (const order of activeOrders) {
            try {
              emitLocation(order.id, longitude, latitude);
              console.log(`Socket emitted location for order ${order.id}: [${longitude}, ${latitude}]`);
            } catch (err) {
              console.error(`Failed to emit location via socket for order ${order.id}:`, err);
            }
          }
        },
        (err) => console.error("Error reading geolocation for background ping:", err),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }, 15000); // Send location update every 15 seconds

    return () => clearInterval(intervalId);
  }, [accountType, orders, emitLocation]);

  const getStatusBadge = (status: string, captainName?: string, rawStatus?: string, captainStatus?: string) => {
    const finalStatus = rawStatus || status;
    if (captainStatus === 'pending') {
      return <Badge variant="amber">{t('offerPending')}</Badge>
    }
    if (captainStatus === 'rejected') {
      return <Badge variant="red">{t('rejectedByCaptain')}</Badge>
    }
    switch (finalStatus) {
      case 'pending_assignment':
        return <Badge variant="amber">{t('pendingAssignment')}</Badge>
      case 'assigned':
        return (
          <Badge variant="blue">
            {t('assignedTo', { name: captainName || 'Captain' })}
          </Badge>
        )
      case 'picked_up':
        return <Badge variant="amber">{t('pickedUpStatus')}</Badge>
      case 'in_progress':
      case 'in_transit':
        return <Badge variant="green">{t('inTransit')}</Badge>
      case 'delivered':
        return <Badge variant="gray">{t('deliveredStatus')}</Badge>
      default:
        return null
    }
  }

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('orders_title')}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('orders_sub')}</p>
      </div>

      <div className="flex flex-col gap-3">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-sm text-[var(--color-text-sub)] bg-[var(--color-bg-card)]/20 border border-[var(--color-border)]/40 rounded-xl">
            {t('noOrders')}
          </div>
        ) : (
          orders.map(order => (
            <Card key={order.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="text-[14px] font-semibold text-[var(--color-text-main)]">
                      {t('orderId')} #{order.id.slice(-6).toUpperCase()}
                    </h3>
                    {getStatusBadge(order.status, order.captain?.name, order.rawStatus, order.captainStatus)}
                  </div>
                  {order.captainPrice !== undefined && order.captainPrice !== null ? (
                    <p className="text-[12px] text-[var(--color-text-sub)]">
                      {t('payout')} <span className="text-green-400 font-bold">EGP {order.captainPrice}</span>
                    </p>
                  ) : (
                    <p className="text-[12px] text-[var(--color-text-sub)]">
                      {t('clientConfirmed')} EGP {order.priceEGP}
                    </p>
                  )}
                  {isOffice ? (
                    order.captain && (
                      <p className="text-[11px] text-[var(--color-text-sub)] mt-1">
                        {t('phone_col')}: {order.captain.phone}
                      </p>
                    )
                  ) : (
                    order.clientPhone && (
                      <p className="text-[11px] text-[var(--color-text-sub)] mt-1">
                        {t('phone_col')}: {order.clientPhone}
                      </p>
                    )
                  )}
                  {order.pickupAddress && (
                    <p className="text-[11px] text-[var(--color-text-sub)] mt-1">
                      <span className="font-semibold text-[var(--color-text-main)]">{t('pickupAddress')}:</span> {order.pickupAddress}
                    </p>
                  )}
                  {order.deliveryAddress && (
                    <p className="text-[11px] text-[var(--color-text-sub)] mt-1">
                      <span className="font-semibold text-[var(--color-text-main)]">{t('deliveryAddress')}:</span> {order.deliveryAddress}
                    </p>
                  )}
                </div>
                <div>
                  {isOffice ? (
                    <OrderAssignmentControl order={order} captains={captains} isRTL={isRTL} />
                  ) : (
                    <CaptainOrderActionControl order={order} isRTL={isRTL} t={t} />
                  )}
                </div>
              </div>

              {/* Collapsible Route Map for Captain */}
              {order.pickupCoords && order.deliveryCoords && (
                (order.status as string) === 'assigned' ||
                (order.status as string) === 'picked_up' ||
                (order.status as string) === 'in_progress' ||
                (order.status as string) === 'in_transit' ||
                (order.status as string) === 'delivered' ||
                order.rawStatus === 'assigned' ||
                order.rawStatus === 'picked_up' ||
                order.rawStatus === 'in_progress' ||
                order.rawStatus === 'in_transit' ||
                order.rawStatus === 'delivered'
              ) && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border)]/60 flex flex-col gap-3">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <button
                      onClick={() => setExpandedMapId(expandedMapId === order.id ? null : order.id)}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      🗺️ {expandedMapId === order.id ? t('hideMap') : t('showMap')}
                    </button>

                    <div className="flex gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${order.pickupCoords[0] > order.pickupCoords[1] ? order.pickupCoords[1] : order.pickupCoords[0]},${order.pickupCoords[0] > order.pickupCoords[1] ? order.pickupCoords[0] : order.pickupCoords[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-extrabold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded transition-colors uppercase tracking-wider"
                      >
                        🚀 {order.pickupAddress ? (order.pickupAddress.length > 25 ? order.pickupAddress.slice(0, 25) + '...' : order.pickupAddress) : t('navPickup')}
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryCoords[0] > order.deliveryCoords[1] ? order.deliveryCoords[1] : order.deliveryCoords[0]},${order.deliveryCoords[0] > order.deliveryCoords[1] ? order.deliveryCoords[0] : order.deliveryCoords[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-extrabold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded transition-colors uppercase tracking-wider"
                      >
                        🚀 {order.deliveryAddress ? (order.deliveryAddress.length > 25 ? order.deliveryAddress.slice(0, 25) + '...' : order.deliveryAddress) : t('navDelivery')}
                      </a>
                    </div>
                  </div>

                  {expandedMapId === order.id && (
                    <div className="rounded-lg overflow-hidden border border-[var(--color-border)]">
                      <MapView
                        pickupCoords={order.pickupCoords[0] > order.pickupCoords[1] ? [order.pickupCoords[1], order.pickupCoords[0]] : [order.pickupCoords[0], order.pickupCoords[1]]}
                        deliveryCoords={order.deliveryCoords[0] > order.deliveryCoords[1] ? [order.deliveryCoords[1], order.deliveryCoords[0]] : [order.deliveryCoords[0], order.deliveryCoords[1]]}
                        zoom={12}
                        height="250px"
                        shipmentStatus={order.rawStatus || order.status}
                        locale={locale}
                      />
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
