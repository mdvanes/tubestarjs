import express from "express";
import zmq from "zeromq";
import zlib from "zlib";
import xmlJs from "xml-js";

const sock = zmq.socket("sub");

const TCP_ENDPOINT = "tcp://pubsub.besteffort.ndovloket.nl:7658";
const TCP_ENVELOPE = "/EBS/KV6posinfo";
const TCP_PORT = 7658;
const EXPRESS_PORT = 3000;

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

        res.write(
          `data: ${JSON.stringify({
            topic: topic.toString("utf-8"),
            payloadLength: message.length,
            payload: contentObj,
          })}\n\n`
        );
      });
    });
  });

  app.use(express.static("dist"));

  app.listen(EXPRESS_PORT);
  console.log(`Listening on port ${EXPRESS_PORT}`);
}

run().catch((err) => console.log(err));
