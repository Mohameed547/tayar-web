import { Shipment } from "@/modules/customer/types/shipment";
import { Offer } from "@/modules/customer/types/offer";
import { TrackingMilestone } from "@/modules/customer/types/tracking";

// Mock Users
export const mockCustomer = {
  id: "cust-1",
  name: "Mohamed Zohair",
  email: "mohamedzohair547@gmail.com",
  phone: "01063732212",
  role: "customer" as const,
  avatar: "MK",
  isVerified: true,
  createdAt: "2026-01-01",
};

export const mockDriverKarim = {
  id: "driver-1",
  name: "Karim Mostafa",
  email: "karim.m@shipconnect.com",
  phone: "01198765432",
  role: "driver" as const,
  avatar: "KM",
  isVerified: true,
  createdAt: "2026-02-15",
  rating: 4.9,
  reviewsCount: 88,
};

// Mock Shipments
export const mockShipments: Shipment[] = [
  {
    id: "sc-00412",
    trackingNumber: "SC-00412",
    pickupAddress: "Cairo, Maadi",
    deliveryAddress: "Alexandria, Sporting",
    pickupCoords: [30.0444, 31.2357], // Cairo coords
    deliveryCoords: [31.2001, 29.9187], // Alex coords
    weight: 2.5,
    packageType: "small_box",
    deliverySpeed: "standard",
    notes: "Fragile, call before delivery.",
    status: "in_transit",
    distanceKm: 220,
    estimatedPriceMin: 80,
    estimatedPriceMax: 180,
    captain: mockDriverKarim,
    etaDescription: "ETA 2h 15m",
    pickedUpTime: "9:00 AM",
    deliveryProgressPercent: 60,
    selectedOfferId: "offer-2",
    createdAt: "2026-06-05T09:00:00Z",
  },
  {
    id: "sc-00408",
    trackingNumber: "SC-00408",
    pickupAddress: "Giza, Dokki",
    deliveryAddress: "Cairo, Nasr City",
    pickupCoords: [30.0344, 31.2157],
    deliveryCoords: [30.0561, 31.3301],
    weight: 15.0,
    packageType: "medium_box",
    deliverySpeed: "express",
    status: "captain_assignment",
    distanceKm: 25,
    estimatedPriceMin: 50,
    estimatedPriceMax: 100,
    createdAt: "2026-06-05T08:15:00Z",
  },
  {
    id: "sc-00420",
    trackingNumber: "SC-00420",
    pickupAddress: "Cairo, Heliopolis",
    deliveryAddress: "Mansoura, University District",
    pickupCoords: [30.0911, 31.3239],
    deliveryCoords: [31.0413, 31.3564],
    weight: 5.0,
    packageType: "medium_box",
    deliverySpeed: "standard",
    status: "pending_offers",
    distanceKm: 125,
    estimatedPriceMin: 110,
    estimatedPriceMax: 220,
    createdAt: "2026-06-05T11:45:00Z",
  },
];

// Mock Offers for SC-00412
export const mockOffers: Offer[] = [
  {
    id: "offer-1",
    shipmentId: "sc-00412",
    providerName: "Nour Logistics",
    providerType: "office",
    providerRating: 4.8,
    reviewCount: 214,
    price: 95,
    estDelivery: "1d 4h",
    coverage: "insured",
    description: "Fleet of 12 trucks. Same-day pickup guaranteed.",
    isBestValue: true,
  },
  {
    id: "offer-2",
    shipmentId: "sc-00412",
    providerName: "Karim Mostafa",
    providerType: "captain",
    providerRating: 4.9,
    reviewCount: 88,
    price: 80,
    estDelivery: "6h",
    coverage: "none",
    description: "Independent driver, Toyota Hilux. Fastest option.",
  },
  {
    id: "offer-3",
    shipmentId: "sc-00412",
    providerName: "Alex Speed Courier",
    providerType: "office",
    providerRating: 4.5,
    reviewCount: 310,
    price: 120,
    estDelivery: "2d",
    coverage: "insured",
    description: "Reliable courier company operating nationwide.",
  },
  {
    id: "offer-4",
    shipmentId: "sc-00412",
    providerName: "FastEx Egypt",
    providerType: "office",
    providerRating: 4.3,
    reviewCount: 502,
    price: 150,
    estDelivery: "2d",
    coverage: "insured",
    description: "Express shipping services across all governorates.",
  },
];

// Mock Tracking Milestones for SC-00412
export const mockTrackingMilestones: TrackingMilestone[] = [
  {
    step: 1,
    title: "Shipment created",
    timestamp: "9:00 AM",
    status: "completed",
  },
  {
    step: 2,
    title: "Offer accepted",
    timestamp: "9:35 AM",
    status: "completed",
  },
  {
    step: 3,
    title: "Package picked up",
    timestamp: "10:15 AM",
    status: "completed",
  },
  {
    step: 4,
    title: "In transit",
    timestamp: "Now",
    status: "active",
    description: "60% complete",
  },
  {
    step: 5,
    title: "Out for delivery",
    status: "pending",
  },
  {
    step: 6,
    title: "Delivered",
    status: "pending",
  },
];
