export type LatLong = [number, number];

export interface VehicleState {
  latLong: LatLong[];
}

export interface LayerState {
  id: string;
  type: "marker" | "polyline";
  ref: L.Layer;
}

export interface AppState {
  chart: {
    data: number[];
    ref: echarts.ECharts | undefined;
  };
  map: {
    markers: Array<LayerState>;
    ref: L.Map | undefined;
  };
  vehicles: Record<string, VehicleState>;
}

const state: AppState = {
  chart: {
    data: [],
    ref: undefined,
  },
  map: {
    markers: [],
    ref: undefined,
  },
  vehicles: {},
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

export const setMarkers = (markers: LayerState[]) => {
  state.map.markers = markers;
};

export const getMarkers = (): LayerState[] => {
  return state.map.markers;
};

export const setMapRef = (mapRef: L.Map) => {
  state.map.ref = mapRef;
};

export const getMapRef = (): L.Map | undefined => {
  return state.map.ref;
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
