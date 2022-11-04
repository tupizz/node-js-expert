import { Readable, Writable } from "stream";

// data source
const readable = new Readable({
  read() {
    this.push("Hello");
    this.push("World");

    this.push("Hello");
    this.push("World");

    this.push(null); // end of stream
  },
});

// output of data
const writable = new Writable({
  write(chunk, encoding, callback) {
    console.log(chunk.toString());
    callback();
  },
});

readable.pipe(writable);

readable.pipe(process.stdout);
