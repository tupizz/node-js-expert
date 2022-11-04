import http from "http";
import { readFileSync, createReadStream } from "fs";

//   curl http://localhost:3000 -o output.txt

http
  .createServer((req, res) => {
    createReadStream("big.file").pipe(res);
  })
  .listen(3000, () => console.log("running on 3000"));
