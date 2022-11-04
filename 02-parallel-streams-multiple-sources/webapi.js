import http from "http";
import { Readable } from "stream";
import { faker } from "@faker-js/faker";

function apiOne(req, res) {
  let count = 0;
  const MAX_ITEMS = 99;
  const FREQUENCY = 250;

  const readable = new Readable({
    read() {
      const everySecond = (interval) => {
        if (count++ <= MAX_ITEMS) {
          this.push(
            JSON.stringify({
              id: count,
              version: "api1--" + faker.random.numeric(),
              name: faker.name.fullName(),
              createdAt: new Date(),
            }) + "\n"
          );
          return;
        }
        clearInterval(interval);
        this.push(null);
      };

      setInterval(function () {
        everySecond(this);
      }, FREQUENCY);
    },
  });

  readable.pipe(res);
}

function apiTwo(req, res) {
  let count = 0;
  const MAX_ITEMS = 99;
  const FREQUENCY = 250;

  const readable = new Readable({
    read() {
      const everySecond = (interval) => {
        if (count++ <= MAX_ITEMS) {
          this.push(
            JSON.stringify({
              id: count,
              version: "api2--" + faker.random.numeric(),
              fullName: faker.name.fullName(),
              company: faker.company.catchPhrase(),
              createdAt: new Date(),
            }) + "\n"
          );
          return;
        }
        clearInterval(interval);
        this.push(null);
      };

      setInterval(function () {
        everySecond(this);
      }, FREQUENCY);
    },
  });

  readable.pipe(res);
}

http
  .createServer(apiOne)
  .listen(3000, () => console.log(`server running at http://localhost:3000`));

http
  .createServer(apiTwo)
  .listen(4000, () => console.log(`server running at http://localhost:4000`));
