'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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
  
  const pickupMarkerRef = useRef<L.Marker | null>(null)
  const deliveryMarkerRef = useRef<L.Marker | null>(null)
  const captainMarkerRef = useRef<L.Marker | null>(null)
  const polylineRef = useRef<L.Polyline | null>(null)

  const getGreenPin = () => L.divIcon({
    className: 'custom-pin-green',
    html: `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/20 border-2 border-emerald-500 shadow-lg">
      <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

  const getRedPin = () => L.divIcon({
    className: 'custom-pin-red',
    html: `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-rose-500/20 border-2 border-rose-500 shadow-lg">
      <div class="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

  const getCaptainIcon = () => L.divIcon({
    className: 'custom-pin-captain',
    html: `<div class="flex items-center justify-center w-9 h-9 rounded-full bg-blue-500/30 border-2 border-blue-500 shadow-xl">
      <span class="text-sm">🚚</span>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
    }).addTo(mapInstance)

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
    if (!map) return

    const bounds: L.LatLngExpression[] = []

    if (pickupCoords && !isNaN(pickupCoords[0]) && !isNaN(pickupCoords[1])) {
      bounds.push(pickupCoords)
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng(pickupCoords)
      } else {
        pickupMarkerRef.current = L.marker(pickupCoords, { icon: getRedPin() }).addTo(map)
      }
    } else if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove()
      pickupMarkerRef.current = null
    }

    if (deliveryCoords && !isNaN(deliveryCoords[0]) && !isNaN(deliveryCoords[1])) {
      bounds.push(deliveryCoords)
      if (deliveryMarkerRef.current) {
        deliveryMarkerRef.current.setLatLng(deliveryCoords)
      } else {
        deliveryMarkerRef.current = L.marker(deliveryCoords, { icon: getGreenPin() }).addTo(map)
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
          color: '#3b82f6',
          weight: 3.5,
          opacity: 0.8,
          dashArray: '5, 8',
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
  }, [map, pickupCoords, deliveryCoords, captainCoords, zoom])

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full rounded-xl border border-zinc-800/80 shadow-inner bg-zinc-950 overflow-hidden"
      style={{ height }} 
    />
  )
}

