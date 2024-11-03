import { busiRequest } from "@/utils/service"

export function getCableList(swLng: number, neLng: number, swLat: number, neLat: number) {
  return busiRequest({
    url: "/network/cables",
    method: "get",
    params: {
      swLng,
      neLng,
      swLat,
      neLat
    }
  })
}

export function getCable(lng: number, lat: number) {
  return busiRequest({
    url: "/network/cable",
    method: "get",
    params: {
      lng,
      lat
    }
  })
}

export function getResourceList(swLng: number, neLng: number, swLat: number, neLat: number) {
  return busiRequest({
    url: "/network/resources",
    method: "get",
    params: {
      swLng,
      neLng,
      swLat,
      neLat
    }
  })
}

export function getResource(lng: number, lat: number) {
  return busiRequest({
    url: "/network/resource",
    method: "get",
    params: {
      lng,
      lat
    }
  })
}

export function getResourceListByAOI(aoiId: string) {
  return busiRequest({
    url: "/network/resources/" + aoiId,
    method: "get"
  })
}

export function getFiberList(swLng: number, neLng: number, swLat: number, neLat: number) {
  return busiRequest({
    url: "/network/fibers",
    method: "get",
    params: {
      swLng,
      neLng,
      swLat,
      neLat
    }
  })
}

export function getFiber(lng: number, lat: number) {
  return busiRequest({
    url: "/network/fiber",
    method: "get",
    params: {
      lng,
      lat
    }
  })
}

export function getFiberListByAOI(aoiId: string) {
  return busiRequest({
    url: "/network/fibers/" + aoiId,
    method: "get"
  })
}

export function getAOIBorderList(swLng: number, neLng: number, swLat: number, neLat: number) {
  return busiRequest({
    url: "/aoi/list",
    method: "get",
    params: {
      swLng,
      neLng,
      swLat,
      neLat
    }
  })
}

export function getAOIInfo(aoiId: string) {
  return busiRequest({
    url: "/aoi/info/" + aoiId,
    method: "get"
  })
}
