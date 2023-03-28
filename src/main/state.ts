export type LatLong = [number, number];

export interface VehicleState {
  latLong: LatLong[];
}

export interface AppState {
  vehicles: Record<string, VehicleState>;
  markers: Array<L.Layer>;
}

const state: AppState = {
  vehicles: {},
  markers: [],
};

export const addLocations = (vehicles: Array<[string, VehicleState]>) => {
  vehicles.forEach(([id, vehicleState]) => {
    if (!state.vehicles[id]) {
      state.vehicles[id] = vehicleState;
    } else {
      state.vehicles[id].latLong = [
        ...state.vehicles[id].latLong,
        ...vehicleState.latLong,
      ];
    }
  });
};

export const getLocations = (): Array<[string, VehicleState]> => {
  return Object.entries(state.vehicles);
};

export const setMarkers = (markers: L.Layer[]) => {
  state.markers = markers;
};

export const getMarkers = (): L.Layer[] => {
  return state.markers;
};
