"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapIcon, List, Filter } from "lucide-react"
import {
  getAllPenguinFacilities,
  regions,
  type PenguinFacility,
  type Region,
} from "@/lib/penguin-facilities"
import FacilityCard from "@/components/facility-card"

// Dynamic import for map to avoid SSR issues with Leaflet
const PenguinMap = dynamic(() => import("@/components/penguin-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
      <div className="text-muted-foreground">地図を読み込み中...</div>
    </div>
  ),
})

export default function PenguinFacilitiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegion, setSelectedRegion] = useState<Region | "all">("all")
  const [selectedType, setSelectedType] = useState<"all" | "aquarium" | "zoo">("all")
  const [selectedFacility, setSelectedFacility] = useState<PenguinFacility | null>(null)
  const [viewMode, setViewMode] = useState<"map" | "list">("map")

  const facilities = getAllPenguinFacilities()

  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      const matchesSearch =
        searchQuery === "" ||
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.prefecture.includes(searchQuery) ||
        facility.penguinSpecies.some((s) => s.includes(searchQuery))

      const matchesRegion = selectedRegion === "all" || facility.region === selectedRegion
      const matchesType = selectedType === "all" || facility.type === selectedType

      return matchesSearch && matchesRegion && matchesType
    })
  }, [facilities, searchQuery, selectedRegion, selectedType])

  const facilityStats = useMemo(() => {
    const aquariums = facilities.filter((f) => f.type === "aquarium").length
    const zoos = facilities.filter((f) => f.type === "zoo").length
    return { total: facilities.length, aquariums, zoos }
  }, [facilities])

  const updateFacilityQuery = useCallback(
    (facilityId: string | null) => {
      const currentUrl = new URL(window.location.href)
      const params = new URLSearchParams(currentUrl.search)
      if (facilityId) {
        params.set("facility", facilityId)
      } else {
        params.delete("facility")
      }

      const query = params.toString()
      const url = query ? `${currentUrl.pathname}?${query}` : currentUrl.pathname
      window.history.replaceState(null, "", url)
    },
    [],
  )

  useEffect(() => {
    const syncSelectedFacilityFromUrl = () => {
      const facilityId = new URLSearchParams(window.location.search).get("facility")
      if (!facilityId) {
        setSelectedFacility(null)
        return
      }

      const facility = facilities.find((item) => item.id === facilityId) ?? null
      setSelectedFacility(facility)
    }

    syncSelectedFacilityFromUrl()
    window.addEventListener("popstate", syncSelectedFacilityFromUrl)
    return () => window.removeEventListener("popstate", syncSelectedFacilityFromUrl)
  }, [facilities])

  const handleFacilitySelect = (facility: PenguinFacility) => {
    setSelectedFacility(facility)
    updateFacilityQuery(facility.id)
    if (viewMode === "list") {
      setViewMode("map")
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-sky-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-sky-900 flex items-center gap-2">
                <span className="text-3xl">🐧</span>
                ペンギンに会える施設マップ
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                世界ペンギンの日（4月25日）を記念して
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="bg-sky-100 text-sky-700">
                水族館 {facilityStats.aquariums}
              </Badge>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                動物園 {facilityStats.zoos}
              </Badge>
              <Badge variant="outline">計 {facilityStats.total} 施設</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-sky-100 p-4 mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="施設名、都道府県、ペンギンの種類で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Region Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex flex-wrap gap-1">
                <Button
                  variant={selectedRegion === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRegion("all")}
                  className="text-xs"
                >
                  全国
                </Button>
                {regions.map((region) => (
                  <Button
                    key={region}
                    variant={selectedRegion === region ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRegion(region)}
                    className="text-xs"
                  >
                    {region}
                  </Button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1">
              <Button
                variant={selectedType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("all")}
                className="text-xs"
              >
                すべて
              </Button>
              <Button
                variant={selectedType === "aquarium" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("aquarium")}
                className="text-xs"
              >
                水族館
              </Button>
              <Button
                variant={selectedType === "zoo" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("zoo")}
                className="text-xs"
              >
                動物園
              </Button>
            </div>
          </div>
        </div>

        {/* View Toggle for Mobile */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <p className="text-sm text-muted-foreground">
            {filteredFacilities.length} 件の施設が見つかりました
          </p>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "map" | "list")}>
            <TabsList className="grid w-[160px] grid-cols-2">
              <TabsTrigger value="map" className="flex items-center gap-1">
                <MapIcon className="h-4 w-4" />
                地図
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-1">
                <List className="h-4 w-4" />
                一覧
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map */}
          <div
            className={`lg:flex-1 lg:sticky lg:top-[100px] lg:h-[calc(100vh-140px)] ${
              viewMode === "list" ? "hidden lg:block" : ""
            }`}
          >
            <div className="h-[400px] lg:h-full rounded-xl overflow-hidden shadow-sm border border-sky-100">
              <PenguinMap
                facilities={filteredFacilities}
                selectedFacility={selectedFacility}
                onFacilitySelect={handleFacilitySelect}
              />
            </div>
          </div>

          {/* Facility List */}
          <div
            className={`lg:w-[400px] xl:w-[450px] ${viewMode === "map" ? "hidden lg:block" : ""}`}
          >
            <div className="hidden lg:block mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredFacilities.length} 件の施設が見つかりました
              </p>
            </div>
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {filteredFacilities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>検索条件に一致する施設が見つかりませんでした</p>
                </div>
              ) : (
                filteredFacilities.map((facility) => (
                  <FacilityCard
                    key={facility.id}
                    facility={facility}
                    isSelected={selectedFacility?.id === facility.id}
                    onSelect={handleFacilitySelect}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-12 py-8 border-t border-sky-100">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              世界ペンギンの日（World Penguin Day）は毎年4月25日に祝われます。
            </p>
            <p>
              この日はペンギンの保護と生態系の重要性について意識を高める日です。
            </p>
            <p className="mt-4 text-xs">
              ※ 施設情報は変更される場合があります。訪問前に各施設の公式サイトをご確認ください。
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}
