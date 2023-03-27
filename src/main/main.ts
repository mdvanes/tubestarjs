import { rd2wgs } from "./rd2wgs.js";
import { renderTable } from "./renderTable.js";
import { init as echartsInit } from "echarts";
import L from "leaflet";
import { AppState, setVehicles, VehicleState } from "./state.js";

const map = L.map("map").setView([52.1287049, 5.1870372], 8);

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

const updateMap = (vehicleStates: Array<[string, VehicleState]>) => {
  vehicleStates.map(([id, st]) => {
    const lastLatLong = st.latLong.at(-1);
    if (lastLatLong) {
      L.marker(lastLatLong).addTo(map);
    }
    var polygon = L.polygon(st.latLong).addTo(map);
  });
};

source.addEventListener("message", (message: any) => {
  const { topic, payloadLength, payload } = JSON.parse(message.data);

  const topicElem = document.querySelector("#topic > span");
  if (topicElem) {
    topicElem.innerHTML = topic;
  }
  // const payloadLengthElem = document.querySelector("#payloadLength > span");
  // if (payloadLengthElem) {
  //   payloadLengthElem.innerHTML = payloadLength;
  // }

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
    // markers.forEach((elem) => elem.remove());

    const vehicleStates: Array<[string, VehicleState]> = onroute.map(
      (pos: any): [string, VehicleState] => {
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

        // markers.push(L.marker(latLong));
        // return L.marker(latLong);
        return [key, { latLong: [latLong] }];
      }
    );

    setVehicles(vehicleStates);

    updateMap(vehicleStates);
    // markers.forEach((elem) => {
    //   elem.addTo(map);
    // });

    // renderTable(vehiclePos);
  }
});
