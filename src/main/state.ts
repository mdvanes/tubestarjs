type LatLong = [number, number];

export interface VehicleState {
  latLong: LatLong[];
}

export interface AppState {
  vehicles: Record<string, VehicleState>;
}

const state: AppState = {
  vehicles: {},
};

export const setVehicles = (vehicles: Array<[string, VehicleState]>) => {
  vehicles.forEach(([id, vehicleState]) => {
    state.vehicles;

    if (!state.vehicles[id]) {
      state.vehicles[id] = vehicleState;
    } else {
      state.vehicles[id].latLong = [
        ...state.vehicles[id].latLong,
        ...vehicleState.latLong,
      ];
    }
  });
  state.vehicles = Object.fromEntries(vehicles);
};
