export type LatLong = [number, number];

export interface VehicleState {
  latLong: LatLong[];
}

export interface AppState {
  vehicles: Record<string, VehicleState>;
  markers: Array<L.Layer>;
  chart: {
    data: number[];
    ref: echarts.ECharts | undefined;
  };
}

const state: AppState = {
  vehicles: {},
  markers: [],
  chart: {
    data: [],
    ref: undefined,
  },
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

export const addChartData = (data: number[]): number[] => {
  state.chart.data = [...state.chart.data, ...data];
  return state.chart.data;
};

export const getChartData = (): number[] => {
  return state.chart.data;
};

export const setChartRef = (chartRef: echarts.ECharts) => {
  state.chart.ref = chartRef;
};

export const getChartRef = (): echarts.ECharts | undefined => {
  return state.chart.ref;
};
