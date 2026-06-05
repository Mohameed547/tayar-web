import type { Language } from '@/types'

const translations = {
  en: {
    // Nav
    nav_shipmentOps: 'Shipment Operations',
    nav_overview: 'Dashboard',
    nav_requests: 'Incoming Requests',
    nav_offers: 'Submitted Offers',
    nav_orders: 'Accepted Orders',
    nav_deliveries: 'Current Deliveries',
    nav_tracking: 'Shipment Tracking',
    nav_finance: 'Finance',
    nav_earnings: 'Earnings',
    nav_wallet: 'Wallet',
    nav_team_mgmt: 'Team Management',
    nav_team: 'Team Captains',
    nav_captainTracking: 'Captain Tracking',
    nav_performance: 'Performance',
    nav_account: 'Account',
    nav_ratings: 'Ratings',
    nav_profile: 'Profile',
    nav_verification: 'Verification',

    // Topbar
    online: 'Online',
    offline: 'Offline',
    accountType_office: 'Shipping Office',
    accountType_captain: 'Independent Captain',

    // Screens
    screen_overview: 'Dashboard',
    screen_requests: 'Incoming Requests',
    screen_offers: 'Submitted Offers',
    screen_orders: 'Accepted Orders',
    screen_deliveries: 'Current Deliveries',
    screen_tracking: 'Shipment Tracking',
    screen_earnings: 'Earnings',
    screen_wallet: 'Wallet',
    screen_team: 'Team Captains',
    'screen_captain-tracking': 'Captain Tracking Center',
    screen_performance: 'Performance Report',
    screen_ratings: 'Ratings',
    screen_verification: 'Verification',
    screen_profile: 'Profile',

    // Overview
    overview_title: 'Provider Dashboard',
    overview_sub: 'Overview of your platform activities and performance stats.',
    todayEarnings: "Today's Earnings",
    activeDeliveries: 'Active Deliveries',
    newRequests: 'New Requests',
    ratingScore: 'Rating Score',
    latestRequest: 'Latest Request',
    captainsStatus: 'Captains Status',
    captainsOnline: '4 Captains Online · 2 On Delivery',

    // Requests
    requests_title: 'Incoming Shipment Requests',
    requests_sub: 'Review available leads in your zone and push your quote.',
    sendOffer: 'Send Offer',
    pickup: 'Pickup',
    dropoff: 'Dropoff',
    expiresIn: 'Expires in',

    // Offers
    offers_title: 'Submitted Offers',
    offers_sub: 'Bids you sent out waiting for client confirmation.',
    request_col: 'Request',
    yourQuote: 'Your Quote',
    status_col: 'Status',
    pendingResponse: 'Pending Response',
    accepted: 'Accepted',
    rejected: 'Rejected',

    // Orders
    orders_title: 'Accepted Orders',
    orders_sub: 'Confirmed jobs by the client. Ready to proceed.',
    assignCaptain: 'Assign Captain',
    pickUpCargo: 'Pick Up Cargo',
    clientConfirmed: 'Client confirmed pricing:',

    // Deliveries
    deliveries_title: 'Current Deliveries',
    deliveries_sub: 'Monitor real-time live execution of orders by your hub.',
    orderId: 'Order ID',
    assignedCaptain: 'Assigned Captain',
    route: 'Route',
    onRoad: 'On Road',
    outForDelivery: 'Out for Delivery',

    // Tracking
    tracking_title: 'Shipment Tracking',
    tracking_sub: 'Trace customer cargo lifecycle and map updates.',
    mapPlaceholder: 'Simulated GIS / Map View Frame',
    timeline_title: 'Timeline Milestones',
    tl_pickedUp: 'Cargo Picked Up',
    tl_inTransit: 'In Transit Hub',

    // Earnings
    earnings_title: 'Financial Earnings',
    earnings_sub: 'Analytical ledger of gross payments cleared on ShipConnect.',
    thisMonth: 'This Month',
    clearedPayouts: 'Cleared Payouts',
    platformFees: 'Platform Fees Deducted',

    // Wallet
    wallet_title: 'Wallet & Balances',
    wallet_sub: 'Manage liquid cash and fast instant withdrawals.',
    availableBalance: 'Available Balance',
    withdrawBtn: 'Withdraw to Bank / Vodafone Cash',
    recentTransactions: 'Recent Transactions',
    credit: 'Credit',
    debit: 'Debit',

    // Team
    team_title: 'Team Captains Management',
    team_sub: 'Add, remove and manage operators active under your license.',
    captain_col: 'Captain',
    phone_col: 'Phone',
    available: 'Available',
    busy: 'Busy',
    addCaptain: 'Add Captain',

    // Captain Tracking
    captainTracking_title: 'Captain Tracking Center',
    captainTracking_sub: 'Live geographic coverage map of your registered drivers.',
    captainTracking_map: 'All active fleet connections are listed on map.',

    // Performance
    performance_title: 'Captain Performance Reports',
    performance_sub: 'Track completed deliveries counts, speed ratios and success rates.',
    topPerformer: 'Top Performer this week:',
    topPerformerDetail: 'Michael (44 completed trips, 99% success rating)',

    // Ratings
    ratings_title: 'Ratings & Customer Reviews',
    ratings_sub: 'Feedback loop coming from users who completed trips with you.',
    ratingsBase: 'Based on 140+ individual platform reviews',

    // Verification
    verification_title: 'KYC Identity Verification',
    verification_sub: 'Upload government compliance docs to keep active.',
    accountVerified: 'Account status verified',

    // Profile
    profile_title: 'Public Profile',
    profile_sub: 'Manage information shown to customers during bidding.',
    legalName: 'Legal Full Name / Corporate Entity',
    contactNumber: 'Contact Number',
    saveProfile: 'Save Profile',
  },

  ar: {
    // Nav
    nav_shipmentOps: 'عمليات الشحن',
    nav_overview: 'لوحة التحكم',
    nav_requests: 'الطلبات الواردة',
    nav_offers: 'العروض المقدمة',
    nav_orders: 'الطلبات المقبولة',
    nav_deliveries: 'الشحنات الجارية',
    nav_tracking: 'تتبع الشحنات',
    nav_finance: 'المالية',
    nav_earnings: 'الأرباح',
    nav_wallet: 'المحفظة',
    nav_team_mgmt: 'إدارة الفليت والموظفين',
    nav_team: 'كباتن المكتب',
    nav_captainTracking: 'تتبع الكباتن',
    nav_performance: 'تقييم الأداء',
    nav_account: 'الحساب',
    nav_ratings: 'التقييمات',
    nav_profile: 'الملف الشخصي',
    nav_verification: 'التوثيق',

    // Topbar
    online: 'نشط',
    offline: 'غير نشط',
    accountType_office: 'مكتب شحن ولوجستيات',
    accountType_captain: 'كابتن مستقل',

    // Screens
    screen_overview: 'لوحة التحكم',
    screen_requests: 'الطلبات الواردة',
    screen_offers: 'العروض المقدمة',
    screen_orders: 'الطلبات المقبولة',
    screen_deliveries: 'الشحنات الحالية',
    screen_tracking: 'تتبع الشحنة',
    screen_earnings: 'الأرباح المادية',
    screen_wallet: 'المحفظة والرصيد',
    screen_team: 'أفراد الكباتن',
    'screen_captain-tracking': 'تتبع الكباتن حياً',
    screen_performance: 'تقارير الأداء',
    screen_ratings: 'التقييمات والآراء',
    screen_verification: 'حالة التوثيق',
    screen_profile: 'الحساب الشخصي',

    // Overview
    overview_title: 'لوحة التحكم للمزود',
    overview_sub: 'نظرة عامة على أنشطتك على المنصة وإحصائيات الأداء.',
    todayEarnings: 'أرباح اليوم',
    activeDeliveries: 'الشحنات النشطة',
    newRequests: 'الطلبات الجديدة',
    ratingScore: 'معدل التقييم',
    latestRequest: 'أحدث الطلبات الواردة',
    captainsStatus: 'حالة الكباتن الحالية',
    captainsOnline: '٤ كباتن متصلون · ٢ في التوصيل',

    // Requests
    requests_title: 'طلبات الشحن الواردة',
    requests_sub: 'استعرض طلبات الزبائن المتاحة في نطاقك وقدم تسعيرتك للعميل.',
    sendOffer: 'تقديم عرض سعر',
    pickup: 'نقطة الاستلام',
    dropoff: 'نقطة التسليم',
    expiresIn: 'ينتهي خلال',

    // Offers
    offers_title: 'العروض المقدمة والأسعار',
    offers_sub: 'العروض والتسعيرات التي أرسلتها وفي انتظار موافقة العميل عليها.',
    request_col: 'الطلب',
    yourQuote: 'سعرك المعروض',
    status_col: 'الحالة',
    pendingResponse: 'قيد الانتظار',
    accepted: 'مقبول',
    rejected: 'مرفوض',

    // Orders
    orders_title: 'الطلبات المقبولة',
    orders_sub: 'الطلبات المؤكدة من العميل وجاهزة للتنفيذ فوراً.',
    assignCaptain: 'تعيين كابتن',
    pickUpCargo: 'بدء الشحنة واستلامها',
    clientConfirmed: 'تسعيرة العميل المؤكدة:',

    // Deliveries
    deliveries_title: 'الشحنات الجارية',
    deliveries_sub: 'متابعة تنفيذ الشحنات الجارية حالياً من خلال مكتبك.',
    orderId: 'رقم الطلب',
    assignedCaptain: 'الكابتن المسؤول',
    route: 'خط السير',
    onRoad: 'في الطريق',
    outForDelivery: 'خرج للتسليم',

    // Tracking
    tracking_title: 'تتبع مسار الشحنات',
    tracking_sub: 'تتبع دورة حياة شحنة العميل وتحديثات الخريطة الجغرافية.',
    mapPlaceholder: 'إطار عرض الخريطة الجغرافية',
    timeline_title: 'مراحل التوصيل',
    tl_pickedUp: 'تم استلام الشحنة',
    tl_inTransit: 'متوجهة لمدينة الوصول',

    // Earnings
    earnings_title: 'الأرباح والتقارير المالية',
    earnings_sub: 'السجل التحليلي لإجمالي المدفوعات التي تمت تسويتها على المنصة.',
    thisMonth: 'الشهر الحالي',
    clearedPayouts: 'أرباح تم سحبها',
    platformFees: 'رسوم المنصة المقتطعة',

    // Wallet
    wallet_title: 'المحفظة والرصيد',
    wallet_sub: 'إدارة الرصيد المالي المتاح وطلبات السحب الفوري السريعة.',
    availableBalance: 'الرصيد المتاح للسحب',
    withdrawBtn: 'سحب الحساب للبنك / فودافون كاش',
    recentTransactions: 'آخر المعاملات المالية',
    credit: 'إضافة',
    debit: 'خصم',

    // Team
    team_title: 'إدارة كباتن المكتب',
    team_sub: 'إضافة وتعديل وحذف مناديب التوصيل التابعين لمكتبك المسجل.',
    captain_col: 'الكابتن',
    phone_col: 'رقم الهاتف',
    available: 'متاح',
    busy: 'مشغول',
    addCaptain: 'إضافة كابتن',

    // Captain Tracking
    captainTracking_title: 'مركز تتبع الكباتن',
    captainTracking_sub: 'الخريطة الحية للمواقع الجغرافية لسطول السائقين التابعين لك.',
    captainTracking_map: 'جميع اتصالات أفراد الأسطول النشطة معروضة الآن على الرادار الجغرافي.',

    // Performance
    performance_title: 'تقارير أداء الكباتن',
    performance_sub: 'متابعة أرقام التوصيل المكتملة ومعدلات السرعة والنجاح لكل مندوب.',
    topPerformer: 'الأعلى كفاءة هذا الأسبوع:',
    topPerformerDetail: 'محمد السيد (44 رحلة مكتملة، نسبة نجاح 99٪)',

    // Ratings
    ratings_title: 'التقييمات وآراء العملاء',
    ratings_sub: 'الآراء القادمة من المستخدمين الذين أكملوا رحلات شحن معك.',
    ratingsBase: 'بناءً على أكثر من 140 تقييم منفصل على المنصة',

    // Verification
    verification_title: 'توثيق الهوية والملفات القانونية',
    verification_sub: 'رفع الأوراق والمستندات القانونية لضمان استمرار تنشيط الحساب وسحب الأموال.',
    accountVerified: 'حالة الحساب: موثق',

    // Profile
    profile_title: 'الملف الشخصي للمزود',
    profile_sub: 'إدارة البيانات المعروضة للعملاء عند تقديمك عروض الأسعار لهم.',
    legalName: 'الاسم القانوني بالكامل / اسم الشركة',
    contactNumber: 'رقم التواصل',
    saveProfile: 'حفظ التعديلات',
  },
} as const

export type TranslationKey = keyof typeof translations.en

export function t(key: TranslationKey, lang: Language): string {
  return (translations[lang] as Record<string, string>)[key] ?? key
}

export default translations
