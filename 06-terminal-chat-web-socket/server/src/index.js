import Event from "events";
import SocketServer from "./server.js";
import { constants } from "./constants.js";
import Controller from "./controller.js";

const port = process.env.PORT || 9898;
const socketServer = new SocketServer({ port });

const eventEmitter = new Event();
const server = await socketServer.initialize(eventEmitter);
console.log("socket server is running at", server.address().port);

const controller = new Controller({ socketServer: server });
eventEmitter.on(constants.event.NEW_USER_CONNECTED, controller.onNewConnection.bind(controller));
