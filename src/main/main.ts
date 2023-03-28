import { rd2wgs } from "./rd2wgs.js";
import { renderTable } from "./renderTable.js";
import { init as echartsInit } from "echarts";
import L from "leaflet";
import {
  addLocations,
  VehicleState,
  getLocations,
  setMarkers,
  getMarkers,
  LatLong,
} from "./state.js";

const map = L.map("map").setView([52.1287049, 5.1870372], 9);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const source = new EventSource("/events");

const vehiclePos: any = {};

const renderLineChart = (): {
  data: any[];
  myChart: echarts.ECharts | undefined;
} => {
  const chartDom = document.getElementById("linechart");

  if (!chartDom) {
    return { data: [], myChart: undefined };
  }

  const myChart = echartsInit(chartDom);
  const data: any[] = [];
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

  option && myChart.setOption(option);

  return { data, myChart };
};

const { data, myChart } = renderLineChart();

export const isDefined = <T>(value: T | undefined): value is T => {
  return typeof value !== "undefined";
};

const busIcon = L.icon({
  iconUrl: "assets/bus-blue.png",
  shadowUrl: "assets/bus-shadow.png",
  iconSize: [38, 17], // size of the icon
  shadowSize: [38, 17], // size of the shadow
  iconAnchor: [0, 17], // point of the icon which will correspond to marker's location
  shadowAnchor: [-10, 16], // the same for the shadow
  popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
});

const updateMap = (vehicleStates: Array<[string, VehicleState]>) => {
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

source.addEventListener("message", (message: any) => {
  const { topic, payloadLength, payload } = JSON.parse(message.data);

  const topicElem = document.querySelector("#topic > span");
  if (topicElem) {
    topicElem.innerHTML = topic;
  }

  const onroute =
    payload["tmi8:VV_TM_PUSH"]?.["tmi8:KV6posinfo"]?.["tmi8:ONROUTE"] ?? [];

  data.push(onroute.length);
  myChart?.setOption({
    series: [
      {
        data,
        type: "line",
        smooth: true,
      },
    ],
  });

  if (onroute && onroute.map) {
    const payloadLengthElem = document.querySelector("#payloadLength > span");
    if (payloadLengthElem) {
      payloadLengthElem.innerHTML = onroute.length;
    }

    const vehicleLocations: Array<[string, VehicleState]> = onroute
      .map((pos: any): [string, VehicleState] | undefined => {
        const owner = pos["tmi8:dataownercode"]["_text"];
        const id = pos["tmi8:vehiclenumber"]["_text"];
        const x = pos["tmi8:rd-x"]["_text"];
        const y = pos["tmi8:rd-y"]["_text"];
        const key = `${owner}${id}`;

        const isInvalidRd = x === "-1" && y === "-1";
        if (isInvalidRd) {
          console.log(owner, id, x, y, isInvalidRd, typeof x);
          return undefined;
        }

        const wgs = rd2wgs(x, y);
        const latLong: LatLong = [wgs.lat, wgs.long];

        if (!vehiclePos[key]) {
          vehiclePos[key] = [latLong];
        } else {
          vehiclePos[key].push(latLong);
        }

        return [key, { latLong: [latLong] }];
      })
      .filter(isDefined);

    addLocations(vehicleLocations);

    updateMap(getLocations());
    // renderTable(vehiclePos);
  }
});
