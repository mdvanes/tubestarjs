import { isDefined } from "./util.js";
import { rd2wgs } from "./rd2wgs.js";
import {
  addChartData,
  addLocations,
  getChartRef,
  getLocations,
  LatLong,
  VehicleState,
} from "./state.js";
import { updateMap } from "./updateMap.js";

const onEventMessage = (message: { data: any }) => {
  const { topic, payloadLength, payload } = JSON.parse(message.data);

  const topicElem = document.querySelector("#topic > span");
  if (topicElem) {
    topicElem.innerHTML = topic;
  }

  const onroute =
    payload["tmi8:VV_TM_PUSH"]?.["tmi8:KV6posinfo"]?.["tmi8:ONROUTE"] ?? [];

  const newData = addChartData([onroute.length]);
  const chartRef = getChartRef();

  //   data.push(onroute.length);
  chartRef?.setOption({
    series: [
      {
        data: newData,
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

        // if (!vehiclePos[key]) {
        //   vehiclePos[key] = [latLong];
        // } else {
        //   vehiclePos[key].push(latLong);
        // }

        return [key, { latLong: [latLong] }];
      })
      .filter(isDefined);

    addLocations(vehicleLocations);

    updateMap(getLocations());
    // renderTable(vehiclePos);
  }
};

export const connectEventSource = () => {
  const ndOvSse = new EventSource("/api/ndov");

  ndOvSse.addEventListener("message", onEventMessage);

  ndOvSse.addEventListener("error", (event: Event) => {
    console.log("Event source disconnected because of an error", event.type);
    ndOvSse.close();
    setTimeout(() => {
      console.log("reconnect event source");
      connectEventSource();
    }, 500);
  });
};
