export const renderTable = (v: any) => {
  // document.querySelector("#payload > span").innerHTML = JSON.stringify(vehiclePos);
  // const acc = "";
  const entries = Object.entries(v);
  entries.sort((k1, k2) => {
    // console.log(k1[0], k2[0]);
    if (k1[0] < k2[0]) {
      return -1;
    }
    if (k1[0] > k2[0]) {
      return 1;
    }
    return 0;
  });
  const y = entries.map(([key, val]) => `${key} - ${JSON.stringify(val)}`);
  // acc +=
  // @ts-expect-error
  document.querySelector("#payload > span").innerHTML =
    "<br />" + y.join("<br />");
};
