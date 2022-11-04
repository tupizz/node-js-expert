import { Duplex } from "stream";

let count = 0;
const server = new Duplex({
  objectMode: true,
  encoding: "utf-8",
  read() {
    const everySecond = (intervalCtx) => {
      if (count++ <= 5) {
        this.push(`My name is Tadeu ${count}\n`);
        return;
      }
      clearInterval(intervalCtx);
      this.push(null);
    };
    setInterval(function () {
      everySecond(this);
    });
  },
  write(chunk, encoding, cb) {
    console.log(`[writable] - ${chunk.toString()}`);
    cb();
  },
});

server.pipe(process.stdout);

// duplex benefits where we can pipe the read to the writable
server.pipe(server);
