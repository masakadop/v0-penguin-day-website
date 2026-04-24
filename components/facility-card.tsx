"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, ExternalLink } from "lucide-react"
import type { PenguinFacility } from "@/lib/penguin-facilities"
import { cn } from "@/lib/utils"

interface FacilityCardProps {
  facility: PenguinFacility
  isSelected: boolean
  onSelect: (facility: PenguinFacility) => void
}

export default function FacilityCard({ facility, isSelected, onSelect }: FacilityCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-sky-500 bg-sky-50/50"
      )}
      onClick={() => onSelect(facility)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{facility.name}</CardTitle>
          <Badge
            variant="secondary"
            className={cn(
              "shrink-0 text-xs",
              facility.type === "aquarium" ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"
            )}
          >
            {facility.type === "aquarium" ? "水族館" : "動物園"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="leading-tight">{facility.address}</span>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">ペンギンの種類</p>
          <div className="flex flex-wrap gap-1">
            {facility.penguinSpecies.map((species) => (
              <Badge key={species} variant="outline" className="text-xs">
                {species}
              </Badge>
            ))}
          </div>
        </div>
        {facility.website && (
          <a
            href={facility.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-sm text-sky-600 hover:text-sky-800 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            公式サイト
          </a>
        )}
      </CardContent>
    </Card>
  )
}
