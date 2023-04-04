import L from "leaflet";
import {
  getMapRef,
  getMarkers,
  setMapRef,
  setMarkers,
  VehicleState,
} from "../state.js";
import { isDefined } from "../util.js";
import { busIcon } from "./busIcon.js";

export const initMap = () => {
  const mapRef = L.map("map").setView([52.1287049, 5.1870372], 9);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapRef);

  setMapRef(mapRef);
};

export const updateMap = (vehicleStates: Array<[string, VehicleState]>) => {
  const mapRef = getMapRef();
  if (!mapRef) {
    throw new Error("Invalid map ref");
  }
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
        }).addTo(mapRef);
        vehicleMarkers.push(polyline);
      }
      const lastLatLong = st.latLong.at(-1);
      if (lastLatLong) {
        const m = L.marker(lastLatLong, { icon: busIcon });
        m.addTo(mapRef);
        vehicleMarkers.push(m);
      }
      return vehicleMarkers;
    })
    .filter(isDefined);

  setMarkers(newMarkers);
};
