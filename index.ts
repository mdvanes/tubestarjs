import zmq from "zeromq";
import express from "express";
import fs from "fs";

const sock = zmq.socket("sub");

const TCP_ENDPOINT = "tcp://pubsub.besteffort.ndovloket.nl:7658";
const TCP_ENVELOPE = "/EBS/KV6posinfo";
const TCP_PORT = 7658;

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
    let count = 0;

    // while (true) {
    //   await new Promise((resolve) => setTimeout(resolve, 1000));

    //   console.log("Emit", ++count);
    //   // Emit an SSE that contains the current 'count' as a string
    //   res.write(`data: ${count}\n\n`);
    // }

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

      count++;

      res.write(`data: ${count}\n\n`);
    });
  });

  const index = fs.readFileSync("./index.html", "utf8");
  app.get("/", (req, res) => res.send(index));

  app.listen(3000);
  console.log("Listening on port 3000");
}

run().catch((err) => console.log(err));
