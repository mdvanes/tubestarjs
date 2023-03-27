import { rd2wgs } from "./rd2wgs.js";
import { init as echartsInit } from "echarts";
import L from "leaflet";

const map = L.map("map").setView([52.1287049, 5.1870372], 8);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const source = new EventSource("/events");

const vehiclePos: any = {};

const renderPos = (v: any) => {
  // document.querySelector("#payload > span").innerHTML = JSON.stringify(vehiclePos);
  // const acc = "";
  const entries = Object.entries(v);
  entries.sort((k1, k2) => {
    // console.log(k1[0], k2[0]);
    if (k1[0] < k2[0]) {
      return -1;
    }
    if (k1[0] > k2[0]) {
      return 1;
    }
    return 0;
  });
  const y = entries.map(([key, val]) => `${key} - ${JSON.stringify(val)}`);
  // acc +=
  // @ts-expect-error
  document.querySelector("#payload > span").innerHTML =
    "<br />" + y.join("<br />");
};

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

source.addEventListener("message", (message: any) => {
  const { topic, payloadLength, payload } = JSON.parse(message.data);

  // @ts-expect-error
  document.querySelector("#topic > span").innerHTML = topic;
  // @ts-expect-error
  document.querySelector("#payloadLength > span").innerHTML = payloadLength;

  data.push(payloadLength);
  myChart?.setOption({
    series: [
      {
        data,
        type: "line",
        smooth: true,
      },
    ],
  });

  const onroute = payload["tmi8:VV_TM_PUSH"]["tmi8:KV6posinfo"]["tmi8:ONROUTE"];

  if (onroute && onroute.map) {
    onroute.map((pos: any) => {
      const owner = pos["tmi8:dataownercode"]["_text"];
      const id = pos["tmi8:vehiclenumber"]["_text"];
      const x = pos["tmi8:rd-x"]["_text"];
      const y = pos["tmi8:rd-y"]["_text"];
      // console.log(owner, id, x, y);
      const key = `${owner}${id}`;

      const wgs = rd2wgs(x, y);
      const latLong: [number, number] = [wgs.lat, wgs.long];

      if (!vehiclePos[key]) {
        vehiclePos[key] = [latLong];
      } else {
        vehiclePos[key].push(latLong);
      }

      // var marker =
      L.marker(latLong).addTo(map);
    });
    // document.querySelector("#payload > span").innerHTML = JSON.stringify(vehiclePos);
    renderPos(vehiclePos);
  }
});
