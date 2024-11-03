<script setup>
import { onMounted, onUnmounted } from "vue"
import AMapLoader from "@amap/amap-jsapi-loader"
import { getFiberList, getFiber, getFiberListByAOI, getAOIBorderList, getAOIInfo } from "@/api/gis"

let map = null
const mode = [0, 1]
let infoWindow = null

const addPolygon = (AMap, labelsLayer, data) => {
  const path = []
  const coordinateList = polygonStr2Array(data.polygon)
  for (let i = 0; i < coordinateList.length; i++) {
    path.push(new AMap.LngLat(coordinateList[i][0], coordinateList[i][1]))
  }
  const polygon = new AMap.Polygon({
    path: path,
    fillColor: "#ccebc5",
    strokeOpacity: 1,
    fillOpacity: 0.5,
    strokeColor: "#2b8cbe",
    strokeWeight: 1,
    strokeStyle: "dashed",
    strokeDasharray: [5, 5],
    extData: {
      aoiId: data.aoiId,
      showStatus: 0
    }
  })
  polygon.on("mouseover", () => {
    polygon.setOptions({
      fillOpacity: 0.7,
      fillColor: "#7bccc4"
    })
  })
  polygon.on("mouseout", () => {
    polygon.setOptions({
      fillOpacity: 0.5,
      fillColor: "#ccebc5"
    })
  })
  polygon.on("click", () => {
    const extData = polygon.getExtData()
    clickAOI(AMap, extData.aoiId)
    if (mode[1] === 0) {
      if (extData.showStatus === 0) {
        addFiberByAOI(AMap, labelsLayer, extData.aoiId)
        extData.showStatus = 1
        polygon.setExtData(extData)
      }
    }
  })
  return polygon
}

const polygonStr2Array = (polygonStr) => {
  const coordinateList = []
  const strList = polygonStr.split("|")
  for (let i = 0; i < strList.length; i++) {
    if (strList[i] === "") {
      break
    }
    const itemList = strList[i].split(",")
    coordinateList.push([Number(itemList[0]), Number(itemList[1])])
  }
  return coordinateList
}

const addFibers = (AMap, labelsLayer, sw, ne) => {
  getFiberList(sw.lng, ne.lng, sw.lat, ne.lat).then(function (response) {
    showFibers(AMap, labelsLayer, response)
  })
}

const addFiberByAOI = (AMap, labelsLayer, aoiId) => {
  getFiberListByAOI(aoiId).then(function (response) {
    showFibers(AMap, labelsLayer, response)
  })
}

const showFibers = (AMap, labelsLayer, fiberList) => {
  labelsLayer.clear()
  // 普通点
  const normalMarker = new AMap.Marker({
    anchor: "bottom-center",
    offset: [0, -15]
  })
  const markers = []
  for (let i = 0; i < fiberList.length; i++) {
    const marker = new AMap.LabelMarker({
      position: [fiberList[i].longitude, fiberList[i].latitude],
      icon: {
        type: "image",
        image: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
        size: [6, 9],
        anchor: "bottom-center"
      }
    })
    marker.on("mouseover", function (e) {
      const position = e.data.data && e.data.data.position
      let fiberName = "未知名称"
      getFiber(position[0], position[1]).then(function (response) {
        if (response != null) {
          fiberName = response.fiberName
        }
        normalMarker.setContent(
          '<div class="amap-info-window">' +
            fiberName +
            "," +
            position +
            '<div class="amap-info-sharp"></div>' +
            "</div>"
        )
        normalMarker.setPosition(position)
        map.add(normalMarker)
      })
    })
    marker.on("mouseout", function () {
      map.remove(normalMarker)
    })
    markers.push(marker)
  }
  labelsLayer.add(markers)
}

const clickAOI = (AMap, aoiId) => {
  if (infoWindow !== null) {
    infoWindow.close()
  }
  getAOIInfo(aoiId).then((response) => {
    const content = []
    content.push("<div>AOI名称：" + response.aoiName)
    content.push("地址：" + String(response.address))
    content.push("面积：" + String(response.area))
    content.push("分纤箱数量：" + String(response.fiberNum) + "</div>")
    infoWindow = new AMap.InfoWindow({
      content: content.join("<br>"),
      anchor: "top-left"
    })
    infoWindow.open(map, [Number(response.centerLon), Number(response.centerLat)])
  })
}

onMounted(() => {
  window._AMapSecurityConfig = {
    securityJsCode: import.meta.env.VITE_SECURITY_JS_CODE
  }
  AMapLoader.load({
    key: import.meta.env.VITE_JS_KEY,
    version: "2.0",
    plugins: ["AMap.MapType", "AMap.Geolocation"]
  })
    .then((AMap) => {
      map = new AMap.Map("container", {
        // 设置地图容器id
        viewMode: "3D", // 是否为3D地图模式
        zoom: 16, // 初始化地图级别
        center: [120.7299557, 31.31613526], // 初始化地图中心点位置
        zooms: [14, 20]
      })
      const mapType = new AMap.MapType({
        defaultType: 0 //设置地图类型
      })
      const geolocation = new AMap.Geolocation({
        maximumAge: 0 //定位结果缓存0毫秒，默认：0
      })
      // 创建一个标注层实例
      const labelsLayer = new AMap.LabelsLayer({
        zooms: [3, 20],
        zIndex: 1000,
        collision: false
      })

      map.addControl(mapType)
      map.addControl(geolocation)
      map.add(labelsLayer)

      //创建右键菜单
      const contextMenu = new AMap.ContextMenu()
      contextMenu.addItem(
        "AOI覆盖",
        function () {
          mode[0] = mode[0] === 0 ? 1 : 0
          map.clearMap()
        },
        0
      )
      contextMenu.addItem(
        "分纤箱覆盖",
        function () {
          mode[1] = mode[1] === 0 ? 1 : 0
          map.clearMap()
        },
        0
      )
      map.on("rightclick", function (e) {
        contextMenu.open(map, e.lnglat)
      })

      // 监听地图边界变化
      map.on("moveend", function () {
        const bounds = map.getBounds()
        const sw = bounds.getSouthWest()
        const ne = bounds.getNorthEast()

        map.clearMap()
        if (mode[0] === 1) {
          getAOIBorderList(sw.lng, ne.lng, sw.lat, ne.lat).then(function (response) {
            const aoiList = response
            for (let i = 0; i < aoiList.length; i++) {
              const polygon = addPolygon(AMap, labelsLayer, aoiList[i])
              map.add(polygon)
            }
          })
        }
        if (mode[1] === 1) {
          addFibers(AMap, labelsLayer, sw, ne)
        }
      })
    })
    .catch((e) => {
      console.log(e)
    })
})

onUnmounted(() => {
  map?.destroy()
})
</script>

<template>
  <div id="container" />
</template>

<style scoped>
#container {
  width: 100%;
  height: 800px;
}
</style>
