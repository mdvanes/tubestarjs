import L from "leaflet";

export const busIcon = L.icon({
  iconUrl: "assets/bus-blue.png",
  shadowUrl: "assets/bus-shadow.png",
  iconSize: [38, 17], // size of the icon
  shadowSize: [38, 17], // size of the shadow
  iconAnchor: [0, 17], // point of the icon which will correspond to marker's location
  shadowAnchor: [-10, 16], // the same for the shadow
  popupAnchor: [16, -16], // point from which the popup should open relative to the iconAnchor
});
