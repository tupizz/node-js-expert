import axios from "axios";
import { Writable, PassThrough } from "stream";

const API_01 = "http://localhost:3000";
const API_02 = "http://localhost:4000";

const requests = await Promise.all([
  axios({
    method: "get",
    url: API_01,
    responseType: "stream",
  }),
  axios({
    method: "get",
    url: API_02,
    responseType: "stream",
  }),
]);

const results = requests.map(({ data }) => data);

const output = new Writable({
  write(chunk, encoding, callback) {
    const chunkString = chunk.toString();
    const data = JSON.parse(chunkString);

    const apiVersion = chunkString.match(/:"(?<version>.*)(?=--)/).groups
      .version;

    console.log(`[${apiVersion}] - ${chunkString}`);
    callback();
  },
});

function merge(streams) {
  return streams.reduce((prev, current, index, items) => {
    // stream will not close by itself
    current.pipe(prev, { end: false });
    // manually we need to close the stream
    current.on("end", () => items.every((s) => s.ended) && prev.end());
    return prev;
  }, new PassThrough()); // passthrough is the current
}

merge(results).pipe(output);
