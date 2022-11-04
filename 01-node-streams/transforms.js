import { createWriteStream } from "fs";
import { Readable, Transform, Writable } from "stream";

function generateRandomStringWithLength(length) {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// data source
const readable = new Readable({
  objectMode: true, // this way we can send objects in the stream
  read() {
    for (let i = 0; i < 1e3; i++) {
      const person = {
        id: generateRandomStringWithLength(5),
        createdAt: new Date(),
      };
      this.push(person);
    }
    this.push(null); // end of stream
  },
});

// process
const transform = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    const result = {
      id: chunk.id.toUpperCase(),
      userCreatedAtYear: new Date(chunk.createdAt).getFullYear(),
      metadata: {
        user: "John Doe",
        node: "v14.15.4",
      },
    };

    callback(null, `${JSON.stringify(result, null, 2)}\n`);
  },
});

const pipeline = readable
  .pipe(transform)
  .pipe(createWriteStream("./output.json", { encoding: "utf-8" }));

pipeline.on("close", () => console.log("ended"));
