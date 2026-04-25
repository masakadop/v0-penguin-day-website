"use client"

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { PenguinFacility, Region } from "@/lib/penguin-facilities"

const createIcon = (type: "aquarium" | "zoo") => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg shadow-lg ${
      type === "aquarium" ? "bg-sky-500" : "bg-emerald-500"
    }">
      ${type === "aquarium" ? "🐧" : "🐧"}
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

function MapController({
  facilities,
  selectedFacility,
  selectedRegion,
  markerRefs,
}: {
  facilities: PenguinFacility[]
  selectedFacility: PenguinFacility | null
  selectedRegion: Region | "all"
  markerRefs: MutableRefObject<Record<string, L.Marker | null>>
}) {
  const map = useMap()

  const regionalFacilities = useMemo(() => {
    if (selectedRegion === "all") {
      return []
    }

    return facilities.filter((facility) => facility.region === selectedRegion)
  }, [facilities, selectedRegion])

  useEffect(() => {
    if (regionalFacilities.length > 0) {
      const bounds = L.latLngBounds(regionalFacilities.map((facility) => [facility.lat, facility.lng]))
      map.flyToBounds(bounds.pad(0.35), {
        duration: 1,
        maxZoom: 8,
      })

      if (selectedFacility && selectedFacility.region === selectedRegion) {
        const marker = markerRefs.current[selectedFacility.id]
        if (marker) {
          window.setTimeout(() => marker.openPopup(), 150)
        }
      }

      return
    }

    if (selectedFacility) {
      map.flyTo([selectedFacility.lat, selectedFacility.lng], 12, {
        duration: 1,
      })

      const marker = markerRefs.current[selectedFacility.id]
      if (marker) {
        marker.openPopup()
      }
    }
  }, [map, markerRefs, regionalFacilities, selectedFacility, selectedRegion])

  return null
}

interface PenguinMapProps {
  facilities: PenguinFacility[]
  selectedFacility: PenguinFacility | null
  selectedRegion: Region | "all"
  onFacilitySelect: (facility: PenguinFacility) => void
}

export default function PenguinMap({
  facilities,
  selectedFacility,
  selectedRegion,
  onFacilitySelect,
}: PenguinMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const markerRefs = useRef<Record<string, L.Marker | null>>({})

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
        <div className="text-muted-foreground">地図を読み込み中...</div>
      </div>
    )
  }

  return (
    <MapContainer
      center={[36.5, 138.0]}
      zoom={5}
      className="w-full h-full rounded-lg z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController
        facilities={facilities}
        selectedFacility={selectedFacility}
        selectedRegion={selectedRegion}
        markerRefs={markerRefs}
      />
      {facilities.map((facility) => (
        <Marker
          key={facility.id}
          position={[facility.lat, facility.lng]}
          icon={createIcon(facility.type)}
          ref={(marker) => {
            markerRefs.current[facility.id] = marker
          }}
          eventHandlers={{
            click: () => onFacilitySelect(facility),
          }}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-sm">{facility.name}</h3>
              <p className="text-xs text-gray-600 mt-1">{facility.prefecture}</p>
              <p className="text-xs mt-1">{facility.type === "aquarium" ? "水族館" : "動物園"}</p>
              <div className="mt-2">
                <p className="text-xs font-medium">ペンギンの種類:</p>
                <p className="text-xs text-gray-600">{facility.penguinSpecies.join(", ")}</p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
