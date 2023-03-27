// example: {"x":"92637","y":"451196"} ->
// 92637, 451196
// 52.04557, 4.47814
// console.log(rd2wgs(92637, 451196));

export interface WGS {
  lat: number;
  long: number;
}

//  source: https://github.com/mmmenno/rd2wgs/blob/master/rd2wgs.php
export const rd2wgs = (x: number, y: number): WGS => {
  const dX = (x - 155000) * Math.pow(10, -5);
  const dY = (y - 463000) * Math.pow(10, -5);

  const sumN =
    3235.65389 * dY +
    -32.58297 * Math.pow(dX, 2) +
    -0.2475 * Math.pow(dY, 2) +
    -0.84978 * Math.pow(dX, 2) * dY +
    -0.0655 * Math.pow(dY, 3) +
    -0.01709 * Math.pow(dX, 2) * Math.pow(dY, 2) +
    -0.00738 * dX +
    0.0053 * Math.pow(dX, 4) +
    -0.00039 * Math.pow(dX, 2) * Math.pow(dY, 3) +
    0.00033 * Math.pow(dX, 4) * dY +
    -0.00012 * dX * dY;

  const sumE =
    5260.52916 * dX +
    105.94684 * dX * dY +
    2.45656 * dX * Math.pow(dY, 2) +
    -0.81885 * Math.pow(dX, 3) +
    0.05594 * dX * Math.pow(dY, 3) +
    -0.05607 * Math.pow(dX, 3) * dY +
    0.01199 * dY +
    -0.00256 * Math.pow(dX, 3) * Math.pow(dY, 2) +
    0.00128 * dX * Math.pow(dY, 4) +
    0.00022 * Math.pow(dY, 2) +
    -0.00022 * Math.pow(dX, 2) +
    0.00026 * Math.pow(dX, 5);

  const lat = 52.15517 + sumN / 3600;
  const long = 5.387206 + sumE / 3600;

  return { lat, long };
};
