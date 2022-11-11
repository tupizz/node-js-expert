import pino from "pino";

const logger = pino({
  prettyPrint: {
    colorize: true,
    ignore: "pid,hostname",
  },
});

export { logger };
