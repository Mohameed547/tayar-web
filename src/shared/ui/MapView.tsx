'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '@/shared/providers/theme-provider'
import { useTranslations } from 'next-intl'

interface MapViewProps {
  pickupCoords?: [number, number]
  deliveryCoords?: [number, number]
  captainCoords?: [number, number]
  interactive?: boolean
  onMapClick?: (lat: number, lng: number) => void
  zoom?: number
  height?: string
}

export default function MapView({
  pickupCoords,
  deliveryCoords,
  captainCoords,
  interactive = false,
  onMapClick,
  zoom = 12,
  height = '350px',
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
        pickupMarkerRef.current.setIcon(getRedPin(t('from')))
      } else {
        pickupMarkerRef.current = L.marker(pickupCoords, { icon: getRedPin(t('from')) }).addTo(map)
      }
    } else if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove()
      pickupMarkerRef.current = null
    }

    if (deliveryCoords && !isNaN(deliveryCoords[0]) && !isNaN(deliveryCoords[1])) {
      bounds.push(deliveryCoords)
      if (deliveryMarkerRef.current) {
        deliveryMarkerRef.current.setLatLng(deliveryCoords)
        deliveryMarkerRef.current.setIcon(getGreenPin(t('to')))
      } else {
        deliveryMarkerRef.current = L.marker(deliveryCoords, { icon: getGreenPin(t('to')) }).addTo(map)
      }
    } else if (deliveryMarkerRef.current) {
      deliveryMarkerRef.current.remove()
      deliveryMarkerRef.current = null
    }

    if (captainCoords && !isNaN(captainCoords[0]) && !isNaN(captainCoords[1])) {
      bounds.push(captainCoords)
      if (captainMarkerRef.current) {
        captainMarkerRef.current.setLatLng(captainCoords)
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

      if (polylineRef.current) {
        polylineRef.current.setLatLngs(routePath)
      } else {
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

    if (bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] })
    } else if (bounds.length === 1) {
      map.setView(bounds[0], zoom)
    }
  }, [map, pickupCoords, deliveryCoords, captainCoords, zoom, t])

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full rounded-xl border border-zinc-800/80 shadow-inner bg-zinc-950 overflow-hidden"
      style={{ height }} 
    />
  )
}

