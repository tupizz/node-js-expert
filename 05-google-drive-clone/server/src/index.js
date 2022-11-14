import https from "https";
import http from "http";
import fs from "fs";
import { Server } from "socket.io";
import { logger } from "./logger.js";
import Routes from "./routes.js";

const PORT = process.env.PORT || 3000;

const isProd = process.env.NODE_ENV === "production";

process.env.USER = process.env.USER ?? "tupizz";

const localHostSSL = {
  key: fs.readFileSync("./certificates/key.pem"),
  cert: fs.readFileSync("./certificates/cert.pem"),
};

const routes = new Routes();

let server;
if (isProd) {
  server = http.createServer(routes.handler.bind(routes));
} else {
  server = https.createServer(localHostSSL, routes.handler.bind(routes));
}

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: false,
  },
});

routes.setSocketInstance(io);
io.on("connection", (socket) => logger.info(`Someone connected: ${socket.id}`));

const startServer = () => {
  const { address, port } = server.address();
  logger.info(`Server started at https://${address}:${port}`);
};

server.listen(PORT, startServer);
