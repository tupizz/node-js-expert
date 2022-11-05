import { pipeline } from "stream/promises";
import { readdir } from "fs/promises";
import { createReadStream } from "fs";
import { join } from "path";
import split2 from "split2";

const DATA_FOLDER = "./docs/state-of-js";

const INTEREST_FLAGS = ["interested", "would_use"];

const result = {
  2016: {
    angular: 0,
    react: 0,
  },
  2017: {
    angular: 0,
    react: 0,
  },
  2018: {
    angular: 0,
    react: 0,
  },
  2019: {
    angular: 0,
    react: 0,
  },
};

async function* mapFunction(stream) {
  for await (const item of stream) {
    result[item.year] = {
      react: INTEREST_FLAGS.includes(item.tools?.react?.experience)
        ? result[item.year].react + 1
        : result[item.year].react,
      angular: INTEREST_FLAGS.includes(item.tools?.angular?.experience)
        ? result[item.year].angular + 1
        : result[item.year].angular,
    };

    console.log(result);
  }
}

async function* merge(streams) {
  // we have an array of streams
  for (const readable of streams) {
    // for each stream we should iterate over the chunks
    for await (const chunk of readable) {
      yield chunk;
    }
  }
}

(async function main() {
  const files = await readdir(DATA_FOLDER);

  const streams = files.map((file) =>
    createReadStream(join(DATA_FOLDER, file), { encoding: "utf8" })
  );

  await pipeline(merge(streams), split2(JSON.parse), mapFunction);
})();
