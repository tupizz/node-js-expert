# Node streams

- process large amount of data on demand
- process data in chunks
- 4 types of streams: readable, writable, duplex, and transform
- Readable streams: `fs.createReadStream()`
  - streams which we are reading from somewhere
- Writable streams: `fs.createWriteStream()`
  - streams which we are writing to somewhere (print data on screen, write to file, etc.)
- Transform streams: `zlib.createGzip()`
  - streams which we are transforming data as it's written or read
  - converting and transforming data



```js
process.stdin
  .pipe(process.stdout)
  .on("data", (msg) => console.log("data", msg.toString()))
  .on("error", (err) => console.log("err", err.toString()))
  .on("end", () => console.log("end"))
  .on("close", () => console.log("close"));
```

creating a big file to work and some example using streams

```bash
// terminal 1
 node -e "require('net').createServer(s => s.pipe(process.stdout)).listen(1338)"

// terminal 2
 node -e "process.stdin.pipe(require('net').connect(1338))"

// creating a big file to process
node -e "process.stdout.write(crypto.randomBytes(1e9))" > big.file
```