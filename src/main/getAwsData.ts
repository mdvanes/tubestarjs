import { Amplify, API } from "aws-amplify";
// TODO create aws-exports as TypeScript instead of using d.ts?
import awsconfig from "../aws-exports.js";

Amplify.configure(awsconfig);

export const getAwsData = async () => {
  const apiName = "ndov";
  const path = "/ndov";
  const options = {
    headers: {},
  };

  console.log(await API.endpoint(apiName));

  // TODO Typed arguments/response?
  return API.get(apiName, path, options);
};
