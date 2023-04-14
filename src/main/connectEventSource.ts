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
import { updateMap } from "./map/updateMap.js";
import { TubestarMessage } from "./tubestar.types.js";
// import { getAwsData } from "./getAwsData.js";

const DEFAULT_RETRIES = 3;

const onEventMessage = (message: { data: string }) => {
  const { topic, payload }: TubestarMessage = JSON.parse(message.data);

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
      payloadLengthElem.innerHTML = onroute.length.toString();
    }

    const vehicleLocations: Array<[string, VehicleState]> = onroute
      .map((pos): [string, VehicleState] | undefined => {
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

        const wgs = rd2wgs(parseInt(x, 10), parseInt(y, 10));
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

export const connectEventSource = async (retries: number = DEFAULT_RETRIES) => {
  // try {
  //   // TODO Although AWS API.endpoint(apiName) could give an URL that can be used for EventSource, it's a Lambda, so it would not stay open
  //   const awsResponse = await getAwsData();
  //   console.log(awsResponse);
  // } catch (err) {
  //   console.log("AWS failed, skipping");
  // }

  const ndOvSse = new EventSource("/api/ndov");

  let newRetries = retries;

  ndOvSse.addEventListener("open", () => {
    newRetries = DEFAULT_RETRIES;
  });

  ndOvSse.addEventListener("message", onEventMessage);

  ndOvSse.addEventListener("error", (event: Event) => {
    console.log("Event source disconnected because of an error", event.type);
    ndOvSse.close();

    if (newRetries >= 0) {
      setTimeout(() => {
        console.log("reconnect event source");
        connectEventSource(newRetries - 1);
      }, 500);
    } else {
      alert("Error connecting to source");
      location.reload();
    }
  });
};
