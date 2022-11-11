import FileHelper from "./fileHelper.js";
import { logger } from "./logger.js";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDownloadsFolder = resolve(__dirname, "../", "downloads");

export default class Routes {
  downloadsFolder;
  socketIo;

  constructor(downloadsFolder = defaultDownloadsFolder) {
    this.downloadsFolder = downloadsFolder;
    this.fileHelper = FileHelper;
  }

  setSocketInstance(socketIo) {
    this.socketIo = socketIo;
  }

  async defaultRoute(request, response) {
    logger.info(`defaultRoute`);
    response.end("hello world");
  }

  async options(request, response) {
    logger.info(`options`);
    response.writeHead(204);
    response.end();
  }

  async post(request, response) {
    logger.info(`post`);
    response.end();
  }

  async get(request, response) {
    logger.info(`getting all files`);
    const files = await this.fileHelper.getFileStatus(this.downloadsFolder);
    response.writeHead(200);
    response.end(JSON.stringify(files));
  }

  async handler(request, response) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    const chosenMethodHandler = this[request.method.toLowerCase()] || this.defaultRoute;

    return chosenMethodHandler.apply(this, [request, response]);
  }
}
