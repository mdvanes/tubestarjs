import express, { Response } from "express";
import zmq from "zeromq";
import zlib from "zlib";
import xmlJs from "xml-js";
import { TubestarMessage } from "./src/main/tubestar.types";

const sock = zmq.socket("sub");

const TCP_ENDPOINT = "tcp://pubsub.besteffort.ndovloket.nl:7658";
const TCP_ENVELOPE = "/EBS/KV6posinfo";
// const TCP_ENVELOPE = "/RIG/KV6posinfo";
const TCP_PORT = 7658;
const EXPRESS_PORT = process.env.PORT || 3000;
const DEBUG = process.env.DEBUG || false;

let mockRdX = 80000;

const writeMock = (res: Response) => {
  mockRdX += 500;

  const contentObj: TubestarMessage["payload"] = {
    "tmi8:VV_TM_PUSH": {
      "tmi8:KV6posinfo": {
        "tmi8:ONROUTE": [
          {
            "tmi8:dataownercode": { _text: "TS" },
            "tmi8:rd-x": { _text: `${mockRdX}` },
            "tmi8:rd-y": { _text: `${Math.floor(Math.random() * 1000) + 449000}` },
            "tmi8:vehiclenumber": { _text: "1337" },
          },
        ],
      },
    },
  };

  const tubestarMessage: TubestarMessage = {
    topic: "MOCK",
    payloadLength: 1,
    payload: contentObj,
  };

  res.write(`data: ${JSON.stringify(tubestarMessage)}\n\n`);
};

async function run() {
  const app = express();

  app.get("/api/ndov", async function (req, res) {
    console.log("Got /api/ndov");
    res.set({
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
    });
    res.flushHeaders();

    // Tell the client to retry every 10 seconds if connectivity is lost
    res.write("retry: 10000\n\n");

    sock.connect(TCP_ENDPOINT);
    sock.subscribe(TCP_ENVELOPE);
    console.log(`Subscriber connected to port ${TCP_PORT}`);

    if (DEBUG) {
      console.log("Running in DEBUG mode, emmitting mock values");
      setInterval(() => {
        writeMock(res);
      }, 5000);
      writeMock(res);
    }

    sock.on("message", function (topic, message) {
      // console.log(
      //   "Emit: received a message related to:",
      //   topic.toString("utf-8"),
      //   "containing message:"
      //   // message
      // );

      // TODO send data gzipped to client, don't unzip in backend
      zlib.gunzip(message, (err, dezipped) => {
        const content = dezipped.toString();
        const contentObj = xmlJs.xml2js(content, { compact: true });

        // fs.writeFile(
        //   "output.txt",
        //   `${new Date()}\n${content}\n${JSON.stringify(contentObj)}`,
        //   (err) => {
        //     if (err) {
        //       console.error(err);
        //       res.write("error");
        //       return;
        //     }
        //     // file written successfully
        //     res.write(
        //       `data: ${JSON.stringify({
        //         topic: topic.toString("utf-8"),
        //         payloadLength: message.length,
        //         payload: contentObj,
        //       })}\n\n`
        //     );
        //   }
        // );

        const tubestarMessage: TubestarMessage = {
          topic: topic.toString("utf-8"),
          payloadLength: message.length,
          payload: contentObj as TubestarMessage["payload"],
        };

        res.write(`data: ${JSON.stringify(tubestarMessage)}\n\n`);
      });
    });
  });

  app.use(express.static("dist"));

  app.listen(EXPRESS_PORT);
  console.log(`Listening on port ${EXPRESS_PORT}`);
}

run().catch((err) => console.log(err));
