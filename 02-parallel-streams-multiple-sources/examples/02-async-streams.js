import { pipeline } from "stream/promises";
import { setTimeout } from "timers/promises";

async function* myCustomReadableStream() {
  yield Buffer.from("Hello world, how are you?!");
  await setTimeout(250);
  yield Buffer.from("custom readable stream"); // similar to Readable.push()
  await setTimeout(250);
  yield Buffer.from("custom readable stream");
}

async function* myCustomTransformStream(stream) {
  for await (const chunk of stream) {
    console.log("[transform] transforming ->", chunk.toString());
    yield chunk.toString().toLowerCase().replace(/\s/g, "_");
  }
}

async function* myCustomWritableStream(stream) {
  for await (const chunk of stream) {
    console.log("[writable] writing to console ->", chunk);
  }
}

try {
  const controller = new AbortController();

  //  in case we need to cancel something we can call controller.abort()

  await pipeline(
    myCustomReadableStream,
    myCustomTransformStream,
    myCustomWritableStream,
    { signal: controller.signal }
  );
} catch (error) {
  console.error(error.message);
}

console.log("process has finished!");
