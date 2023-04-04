import { initLineChart } from "./chart/initLineChart.js";
import { connectEventSource } from "./connectEventSource.js";
import { initMap } from "./map/updateMap.js";

initLineChart();
initMap();
connectEventSource();
