<script setup>
import { onMounted, onUnmounted } from "vue"
import AMapLoader from "@amap/amap-jsapi-loader"
import { getCableList, getCable } from "@/api/gis"

let map = null
const addCables = (AMap, labelsLayer, sw, ne) => {
  getCableList(sw.lng, ne.lng, sw.lat, ne.lat).then(function (response) {
    showCables(AMap, labelsLayer, response)
  })
}

const showCables = (AMap, labelsLayer, cableList) => {
  labelsLayer.clear()
  // 普通点
  const normalMarker = new AMap.Marker({
    anchor: "bottom-center",
    offset: [0, -15]
  })
  const markers = []
  for (let i = 0; i < cableList.length; i++) {
    const marker = new AMap.LabelMarker({
      position: [cableList[i].longitude, cableList[i].latitude],
      icon: {
        type: "image",
        image: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
        size: [6, 9],
        anchor: "bottom-center"
      }
    })
    marker.on("mouseover", function (e) {
      const position = e.data.data && e.data.data.position
      let cableName = "未知名称"
      getCable(position[0], position[1]).then(function (response) {
        if (response != null) {
          cableName = response.cableName
        }
        normalMarker.setContent(
          '<div class="amap-info-window">' +
            cableName +
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
        zoom: 15, // 初始化地图级别
        center: [120.7299557, 31.31613526] // 初始化地图中心点位置
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

      // 监听地图边界变化
      map.on("moveend", function () {
        const bounds = map.getBounds()
        const sw = bounds.getSouthWest()
        const ne = bounds.getNorthEast()

        map.clearMap()
        addCables(AMap, labelsLayer, sw, ne)
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
