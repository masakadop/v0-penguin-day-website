"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { PenguinFacility } from "@/lib/penguin-facilities"

// Custom penguin marker icon
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

function MapController({ selectedFacility }: { selectedFacility: PenguinFacility | null }) {
  const map = useMap()

  useEffect(() => {
    if (selectedFacility) {
      map.flyTo([selectedFacility.lat, selectedFacility.lng], 12, {
        duration: 1,
      })
    }
  }, [selectedFacility, map])

  return null
}

interface PenguinMapProps {
  facilities: PenguinFacility[]
  selectedFacility: PenguinFacility | null
  onFacilitySelect: (facility: PenguinFacility) => void
}

export default function PenguinMap({ facilities, selectedFacility, onFacilitySelect }: PenguinMapProps) {
  const [isMounted, setIsMounted] = useState(false)

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
      <MapController selectedFacility={selectedFacility} />
      {facilities.map((facility) => (
        <Marker
          key={facility.id}
          position={[facility.lat, facility.lng]}
          icon={createIcon(facility.type)}
          eventHandlers={{
            click: () => onFacilitySelect(facility),
          }}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-sm">{facility.name}</h3>
              <p className="text-xs text-gray-600 mt-1">{facility.prefecture}</p>
              <p className="text-xs mt-1">
                {facility.type === "aquarium" ? "水族館" : "動物園"}
              </p>
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
