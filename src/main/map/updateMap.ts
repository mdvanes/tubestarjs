import { init as echartsInit } from "echarts";
import L from "leaflet";
import {
  addChartData,
  getMarkers,
  setChartRef,
  setMarkers,
  VehicleState,
} from "../state.js";
import { isDefined } from "../util.js";
import { busIcon } from "./busIcon.js";

const map = L.map("map").setView([52.1287049, 5.1870372], 9);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const initLineChart = () => {
  const chartDom = document.getElementById("linechart");

  if (!chartDom) {
    return;
  }

  const chartRef = echartsInit(chartDom);
  const data: number[] = [];
  const option = {
    xAxis: {
      type: "category",
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data,
        type: "line",
        smooth: true,
      },
    ],
  };

  option && chartRef.setOption(option);

  addChartData(data);
  setChartRef(chartRef);
};

initLineChart();

export const updateMap = (vehicleStates: Array<[string, VehicleState]>) => {
  const currentMarkers = getMarkers();
  currentMarkers.forEach((m) => m.remove());

  const newMarkers = vehicleStates
    .flatMap(([id, st]) => {
      const vehicleMarkers = [];
      if (st.latLong.length > 1) {
        // console.log(id, st.latLong);
        var polyline = L.polyline(st.latLong, {
          stroke: true,
          weight: 2,
          color: "#3388ff",
        }).addTo(map);
        vehicleMarkers.push(polyline);
      }
      const lastLatLong = st.latLong.at(-1);
      if (lastLatLong) {
        const m = L.marker(lastLatLong, { icon: busIcon });
        m.addTo(map);
        vehicleMarkers.push(m);
      }
      return vehicleMarkers;
    })
    .filter(isDefined);

  setMarkers(newMarkers);
};
