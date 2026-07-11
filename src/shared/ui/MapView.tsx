'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '@/shared/providers/theme-provider'
import { useTranslations } from 'next-intl'
import { Navigation } from 'lucide-react'

interface MapViewProps {
  pickupCoords?: [number, number]
  deliveryCoords?: [number, number]
  captainCoords?: [number, number]
  interactive?: boolean
  onMapClick?: (lat: number, lng: number) => void
  zoom?: number
  height?: string
  locale?: string
}

export default function MapView({
  pickupCoords,
  deliveryCoords,
  captainCoords,
  interactive = false,
  onMapClick,
  zoom = 12,
  height = '350px',
  locale = 'en',
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<L.Map | null>(null)
  const { theme } = useTheme()
  const t = useTranslations('common')
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  
  const pickupMarkerRef = useRef<L.Marker | null>(null)
  const deliveryMarkerRef = useRef<L.Marker | null>(null)
  const captainMarkerRef = useRef<L.Marker | null>(null)
  const polylineRef = useRef<L.Polyline | null>(null)
  
  const [autoFollow, setAutoFollow] = useState(true)
  const hasFitBoundsRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)

  const getGreenPin = (label: string) => L.divIcon({
    className: 'custom-pin-green',
    html: `<div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 9999px; background-color: #10b981; border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);">
      <span style="font-size: 11px; font-weight: 900; color: #ffffff; direction: rtl; unicode-bidi: embed;">${label}</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

  const getRedPin = (label: string) => L.divIcon({
    className: 'custom-pin-red',
    html: `<div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 9999px; background-color: #f43f5e; border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(244, 63, 94, 0.8);">
      <span style="font-size: 11px; font-weight: 900; color: #ffffff; direction: rtl; unicode-bidi: embed;">${label}</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

  const getCaptainIcon = () => L.divIcon({
    className: 'custom-pin-captain',
    html: `<div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 9999px; background-color: #2563eb; border: 2px solid #ffffff; box-shadow: 0 0 12px rgba(37, 99, 235, 0.9); font-size: 18px;">
      🚚
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

  const onMapClickRef = useRef(onMapClick)
  useEffect(() => {
    onMapClickRef.current = onMapClick
  }, [onMapClick])

  useEffect(() => {
    if (!mapContainerRef.current || map) return

    const defaultCenter: [number, number] = [30.0444, 31.2357]
    const initialCenter = pickupCoords || defaultCenter

    const mapInstance = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: zoom,
      zoomControl: true,
      attributionControl: false,
    })

    const satelliteUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'

    const initialTileLayer = L.tileLayer(satelliteUrl, {
      maxZoom: 20,
    }).addTo(mapInstance)

    tileLayerRef.current = initialTileLayer

    setMap(mapInstance)

    if (interactive) {
      mapInstance.on('click', (e: L.LeafletMouseEvent) => {
        if (onMapClickRef.current) {
          onMapClickRef.current(e.latlng.lat, e.latlng.lng)
        }
      })
    }

    return () => {
      mapInstance.remove()
      setMap(null)
    }
  }, [])

  useEffect(() => {
    if (!map || !tileLayerRef.current) return

    const satelliteUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'

    tileLayerRef.current.remove()

    const newTileLayer = L.tileLayer(satelliteUrl, {
      maxZoom: 20,
    }).addTo(map)

    tileLayerRef.current = newTileLayer
  }, [map, theme])

  useEffect(() => {
    if (!map) return

    const bounds: L.LatLngExpression[] = []

    if (pickupCoords && !isNaN(pickupCoords[0]) && !isNaN(pickupCoords[1])) {
      bounds.push(pickupCoords)
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng(pickupCoords)
        pickupMarkerRef.current.setIcon(getRedPin(t('from') || 'From'))
      } else {
        pickupMarkerRef.current = L.marker(pickupCoords, { icon: getRedPin(t('from') || 'From') }).addTo(map)
      }
    } else if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove()
      pickupMarkerRef.current = null
    }

    if (deliveryCoords && !isNaN(deliveryCoords[0]) && !isNaN(deliveryCoords[1])) {
      bounds.push(deliveryCoords)
      if (deliveryMarkerRef.current) {
        deliveryMarkerRef.current.setLatLng(deliveryCoords)
        deliveryMarkerRef.current.setIcon(getGreenPin(t('to') || 'To'))
      } else {
        deliveryMarkerRef.current = L.marker(deliveryCoords, { icon: getGreenPin(t('to') || 'To') }).addTo(map)
      }
    } else if (deliveryMarkerRef.current) {
      deliveryMarkerRef.current.remove()
      deliveryMarkerRef.current = null
    }

    if (captainCoords && !isNaN(captainCoords[0]) && !isNaN(captainCoords[1])) {
      bounds.push(captainCoords)
      if (captainMarkerRef.current) {
        // Animate marker transition smoothly
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current)
        }

        const startLatLng = captainMarkerRef.current.getLatLng()
        const endLatLng = L.latLng(captainCoords[0], captainCoords[1])
        const duration = 1200 // 1.2s interpolation transition
        const startTime = performance.now()

        const animateStep = (time: number) => {
          const elapsed = time - startTime
          const progress = Math.min(elapsed / duration, 1)

          const lat = startLatLng.lat + (endLatLng.lat - startLatLng.lat) * progress
          const lng = startLatLng.lng + (endLatLng.lng - startLatLng.lng) * progress

          if (captainMarkerRef.current) {
            captainMarkerRef.current.setLatLng([lat, lng])
            
            // Sync polyline layout in real-time as marker moves
            if (polylineRef.current && pickupCoords && deliveryCoords) {
              polylineRef.current.setLatLngs([pickupCoords, [lat, lng], deliveryCoords])
            }
          }

          if (progress < 1) {
            animationFrameRef.current = requestAnimationFrame(animateStep)
          } else {
            animationFrameRef.current = null
          }
        }
        animationFrameRef.current = requestAnimationFrame(animateStep)
      } else {
        captainMarkerRef.current = L.marker(captainCoords, { icon: getCaptainIcon() }).addTo(map)
      }
    } else if (captainMarkerRef.current) {
      captainMarkerRef.current.remove()
      captainMarkerRef.current = null
    }

    if (pickupCoords && deliveryCoords && !isNaN(pickupCoords[0]) && !isNaN(deliveryCoords[0])) {
      const routePath = captainCoords && !isNaN(captainCoords[0])
        ? [pickupCoords, captainCoords, deliveryCoords]
        : [pickupCoords, deliveryCoords]

      if (!polylineRef.current) {
        polylineRef.current = L.polyline(routePath, {
          color: '#06b6d4', // High-contrast Cyan
          weight: 4.5,      // Slightly thicker for satellite view
          opacity: 0.9,
          dashArray: '6, 8',
        }).addTo(map)
      }
    } else if (polylineRef.current) {
      polylineRef.current.remove()
      polylineRef.current = null
    }

    if (!hasFitBoundsRef.current && bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] })
      hasFitBoundsRef.current = true
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [map, pickupCoords, deliveryCoords, captainCoords, zoom, t])

  // Separate effect for live auto follow to prevent fitting bounds repeatedly
  useEffect(() => {
    if (map && captainCoords && !isNaN(captainCoords[0]) && !isNaN(captainCoords[1]) && autoFollow) {
      map.panTo(captainCoords)
    }
  }, [map, captainCoords, autoFollow])

  const isAr = locale === 'ar'
  const autoFollowLabel = isAr 
    ? (autoFollow ? "تتبع تلقائي: مفعل" : "تتبع تلقائي: معطل")
    : (autoFollow ? "Auto-Follow: ON" : "Auto-Follow: OFF")

  return (
    <div className="relative w-full rounded-xl border border-zinc-800/80 shadow-inner bg-zinc-950 overflow-hidden">
      <div 
        ref={mapContainerRef} 
        className="w-full"
        style={{ height }} 
      />
      {captainCoords && (
        <button
          type="button"
          onClick={() => {
            setAutoFollow(!autoFollow)
            if (map && captainCoords) map.panTo(captainCoords)
          }}
          className={`absolute bottom-4 right-4 z-[1000] px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border shadow-lg ${
            autoFollow 
              ? "bg-blue-600 border-blue-500 text-white" 
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Navigation className={`h-3.5 w-3.5 shrink-0 transition-transform ${autoFollow ? 'rotate-45' : ''}`} />
          <span>{autoFollowLabel}</span>
        </button>
      )}
    </div>
  )
}

