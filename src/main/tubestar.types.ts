export interface TubestarMessage {
  topic: string;
  payloadLength: number;
  payload: {
    "tmi8:VV_TM_PUSH"?: {
      "tmi8:KV6posinfo"?: {
        "tmi8:ONROUTE"?: Array<{
          "tmi8:dataownercode": {
            _text: string;
          };
          "tmi8:vehiclenumber": {
            _text: string;
          };
          "tmi8:rd-x": {
            _text: string;
          };
          "tmi8:rd-y": {
            _text: string;
          };
        }>;
      };
    };
  };
}
