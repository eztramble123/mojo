const { PeerServer } = require("peer");

const port = process.env.PORT || 9000;

const server = PeerServer({
  port: Number(port),
  path: "/myapp",
  allow_discovery: true,
  corsOptions: {
    origin: "*",
  },
});

server.on("connection", (client) => {
  console.log(`Peer connected: ${client.getId()}`);
});

server.on("disconnect", (client) => {
  console.log(`Peer disconnected: ${client.getId()}`);
});

console.log(`PeerJS server running on port ${port}`);
