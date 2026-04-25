import type { Metadata } from "next"
import PenguinFacilitiesPage from "@/components/penguin-facilities-page"
import {
  getAllPenguinFacilities,
  regions,
  type Region,
} from "@/lib/penguin-facilities"

type SearchParams = Record<string, string | string[] | undefined>

const baseTitle = "ペンギンに会える施設マップ | 世界ペンギンの日"
const baseDescription =
  "全国の水族館・動物園でペンギンに会える施設の一覧と地図。世界ペンギンの日を記念して、お近くのペンギンスポットを探しましょう。"
const ogImage = "/placeholder.jpg"

function normalizeSearchParam(value: string | string[] | undefined): string | null {
  if (typeof value === "string") {
    return value
  }

  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return null
}

function parseRegion(value: string | null): Region | "all" {
  if (!value) {
    return "all"
  }

  return regions.includes(value as Region) ? (value as Region) : "all"
}

function buildMetadataFromParams(region: Region | "all", facilityId: string | null): Metadata {
  const facilities = getAllPenguinFacilities()
  const facility = facilities.find((item) => item.id === facilityId) ?? null
  const selectedFacility =
    region !== "all" && facility && facility.region !== region ? null : facility

  let title = baseTitle
  let description = baseDescription

  if (selectedFacility) {
    title = `${selectedFacility.name}のペンギン情報 | ペンギンに会える施設マップ`
    description = `${selectedFacility.prefecture}（${selectedFacility.region}）の「${selectedFacility.name}」で会えるペンギン情報と地図を掲載。周辺のペンギン施設も一緒に探せます。`
  } else if (region !== "all") {
    title = `${region}のペンギン施設マップ | 世界ペンギンの日`
    description = `${region}でペンギンに会える水族館・動物園を地図と一覧でチェック。気になる施設を比較してお出かけ計画に役立てられます。`
  }

  const params = new URLSearchParams()
  if (region !== "all") {
    params.set("region", region)
  }
  if (selectedFacility) {
    params.set("facility", selectedFacility.id)
  }

  const query = params.toString()
  const pageUrl = query ? `/?${query}` : "/"

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: selectedFacility ? `${selectedFacility.name}のペンギン施設情報` : "ペンギンに会える施設マップ",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

export function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParams
}): Metadata {
  const region = parseRegion(normalizeSearchParam(searchParams?.region))
  const facilityId = normalizeSearchParam(searchParams?.facility)

  return buildMetadataFromParams(region, facilityId)
}

export default function Page({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const initialRegion = parseRegion(normalizeSearchParam(searchParams?.region))
  const initialFacilityId = normalizeSearchParam(searchParams?.facility)

  return <PenguinFacilitiesPage initialRegion={initialRegion} initialFacilityId={initialFacilityId} />
}
