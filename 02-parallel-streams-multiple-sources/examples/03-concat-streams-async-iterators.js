import axios from "axios";
import { pipeline } from "stream/promises";

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

// writable stream
async function* outputGenerator(stream) {
  for await (const chunk of stream) {
    const apiVersion = chunk.match(/:"(?<version>.*)(?=--)/).groups.version;
    console.log(`[${apiVersion}] - ${chunk} \n`);
  }
}

// pass through stream
async function* merge(streams) {
  for (const readable of streams) {
    readable.setEncoding("utf8"); // object mode

    for await (const chunk of readable) {
      for (const line of chunk.trim().split(/\n/)) {
        yield line;
      }
    }
  }
}

await pipeline(merge(results), outputGenerator);
