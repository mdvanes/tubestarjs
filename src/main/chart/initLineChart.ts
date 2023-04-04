import { init as echartsInit } from "echarts";
import { addChartData, setChartRef } from "../state.js";

export const initLineChart = () => {
  const chartDom = document.getElementById("linechart");

  if (!chartDom) {
    throw Error("Missing COM");
  }

  const chartRef = echartsInit(chartDom);
  const data: number[] = [];
  const option = {
    xAxis: {
      type: "category",
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data,
        type: "line",
        smooth: true,
      },
    ],
  };

  option && chartRef.setOption(option);

  addChartData(data);
  setChartRef(chartRef);
};
