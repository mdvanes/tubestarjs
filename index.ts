import zmq from "zeromq";

const sock = zmq.socket("sub");

// TODO:  express (or Nextjs) with SSE, frontend with RxJs observable

sock.connect("tcp://pubsub.besteffort.ndovloket.nl:7658");
sock.subscribe("/EBS/KV6posinfo");
console.log("Subscriber connected to port 7658");

sock.on("message", function (topic, message) {
  console.log(
    "received a message related to:",
    topic,
    "containing message:",
    message
  );
});
