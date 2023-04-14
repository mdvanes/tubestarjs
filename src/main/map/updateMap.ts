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

  // nlmaps_grijs https://leaflet-extras.github.io/leaflet-providers/preview/
  L.tileLayer(
    "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/grijs/EPSG:3857/{z}/{x}/{y}.png",
    {
      minZoom: 6,
      maxZoom: 19,
      bounds: [
        [50.5, 3.25],
        [54, 7.6],
      ],
      attribution:
        'Kaartgegevens &copy; <a href="https://www.kadaster.nl">Kadaster</a>',
    }
  ).addTo(mapRef);

  // Default
  // L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  //   maxZoom: 19,
  //   attribution:
  //     '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  // }).addTo(mapRef);

  setMapRef(mapRef);
};

export const updateMap = (vehicleStates: Array<[string, VehicleState]>) => {
  const mapRef = getMapRef();
  if (!mapRef) {
    throw new Error("Invalid map ref");
  }
  const currentMarkers = getMarkers();

  const newMarkers = vehicleStates
    .flatMap(([id, st]): LayerState[] => {
      const vehicleMarkers: LayerState[] = [];
      const lastLatLong = st.latLong.at(-1);

      if (lastLatLong) {
        const currentLine = currentMarkers.find(
          (m) => m.id === id && m.type === "polyline"
        );
        if (currentLine) {
          (currentLine.ref as L.Polyline).addLatLng(lastLatLong);
          vehicleMarkers.push(currentLine);
        } else {
          const polyline = L.polyline(st.latLong, {
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
        const currentMarker = currentMarkers.find(
          (m) => m.id === id && m.type === "marker"
        );
        if (currentMarker) {
          (currentMarker.ref as L.Marker).setLatLng(lastLatLong);
          vehicleMarkers.push(currentMarker);
        } else {
          const m = L.marker(lastLatLong, { icon: busIcon });
          m.bindPopup(`${id}`);
          m.addTo(mapRef);
          vehicleMarkers.push({
            id,
            type: "marker",
            ref: m,
          });
        }
      }
      return vehicleMarkers;
    })
    .filter(isDefined);

  setMarkers(newMarkers);
};
