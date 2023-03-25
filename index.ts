import express from "express";
import zmq from "zeromq";

const sock = zmq.socket("sub");

const TCP_ENDPOINT = "tcp://pubsub.besteffort.ndovloket.nl:7658";
const TCP_ENVELOPE = "/EBS/KV6posinfo";
const TCP_PORT = 7658;
const EXPRESS_PORT = 3000;

async function run() {
  const app = express();

  app.get("/events", async function (req, res) {
    console.log("Got /events");
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
      console.log(
        "Emit: received a message related to:",
        topic.toString("utf-8"),
        "containing message:",
        message
      );

      res.write(
        `data: ${JSON.stringify({
          topic: topic.toString("utf-8"),
          payload: message.length,
        })}\n\n`
      );
    });
  });

  app.use(express.static("public"));

  app.listen(EXPRESS_PORT);
  console.log(`Listening on port ${EXPRESS_PORT}`);
}

run().catch((err) => console.log(err));
