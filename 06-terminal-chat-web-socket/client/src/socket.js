export default class SocketClient {
  #serverConnection = {};

  constructor({ host, port, protocol }) {
    this.host = host;
    this.port = port;
    this.protocol = protocol;
  }

  async initialize() {
    this.#serverConnection = await this.createConnection();
    console.log("I connected to the server!!!");
  }

  async createConnection() {
    // this.protocol == http or https
    const http = await import(this.protocol);

    const req = http.request({
      port: 9898,
      host: "localhost",
      headers: {
        Connection: "Upgrade",
        Upgrade: "websocket",
      },
    });

    req.end();

    return new Promise((resolve) => {
      req.once("upgrade", (res, socket) => resolve({ socket }));
    });

    // req.on("upgrade", (res, socket) => {
    //   socket.on("data", (data) => {
    //     console.log(`data received: ${data.toString()}`);
    //   });

    //   setInterval(() => {
    //     socket.write("hello");
    //   }, 500);
    // });
  }
}
