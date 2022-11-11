import { Readable, Writable, Transform } from "stream";

export default class TestUtil {
  static generateReadableStream(data) {
    return new Readable({
      objectMode: true,
      read() {
        for (const item of data) {
          this.push(item);
        }
        this.push(null);
      },
    });
  }

  static generateWritableStream(onData) {
    return new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        onData(chunk);
        callback(null, chunk);
      },
    });
  }

  static generateTransformStream(onData) {
    // async function* (source) {
    //     for await (const chunk of source) {
    //         onData(chunk);
    //         yield chunk;
    //     }
    // }

    return new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        onData(chunk);
        callback(null, chunk);
      },
    });
  }
}
