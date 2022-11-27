/*
    node index.js \
        --username "Tadeu" \
        --room "room01" \
        --hostUri "localhost"
*/

import Events from "events";
import CliConfig from "./src/cliConfig.js";
import SocketClient from "./src/socket.js";
import TerminalController from "./src/terminal-controller.js";

// const componentEmitter = new Events();
// const controller = new TerminalController();
// await controller.initializeTable(componentEmitter);

(async function run() {
  const [, , ...commands] = process.argv;
  const config = CliConfig.parseArguments(commands);
  const socketClient = new SocketClient({
    host: config.host,
    port: config.port,
    protocol: config.protocol,
  });
  await socketClient.initialize();
})();
