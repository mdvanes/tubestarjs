import L from "leaflet";
import {
  getMapRef,
  getMarkers,
  LayerState,
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
  currentMarkers.forEach((m) => m.ref.remove());

  const newMarkers = vehicleStates
    .flatMap(([id, st]): LayerState[] => {
      const vehicleMarkers: LayerState[] = [];
      if (st.latLong.length > 1) {
        // console.log(id, st.latLong);
        var polyline = L.polyline(st.latLong, {
          stroke: true,
          weight: 2,
          color: "#3388ff",
        }).addTo(mapRef);
        vehicleMarkers.push({
          id,
          type: "polyline",
          ref: polyline,
        });
      }
      const lastLatLong = st.latLong.at(-1);
      if (lastLatLong) {
        // const currentMarker = currentMarkers.find(
        //   (m) => m.id === id && m.type === "marker"
        // );
        // if (currentMarker) {
        //   // console.log((currentMarker.ref as L.Marker).getLatLng());
        //   (currentMarker.ref as L.Marker).setLatLng(lastLatLong);
        //   vehicleMarkers.push(currentMarker);
        // } else {
        const m = L.marker(lastLatLong, { icon: busIcon });
        m.addTo(mapRef);
        vehicleMarkers.push({
          id,
          type: "marker",
          ref: m,
        });
        // }
      }
      return vehicleMarkers;
    })
    .filter(isDefined);

  setMarkers(newMarkers);
};
