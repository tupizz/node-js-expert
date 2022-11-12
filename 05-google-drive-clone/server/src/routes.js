import FileHelper from "./fileHelper.js";
import { logger } from "./logger.js";
import { dirname, resolve } from "path";
import { fileURLToPath, parse } from "url";
import UploadHandler from "./uploadHandler.js";
import { pipeline } from "stream/promises";

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
    const { headers } = request;
    const { query: socketId } = parse(request.url, true);

    const uploadHandler = new UploadHandler({
      socketId,
      socketIo: this.socketIo,
      downloadsFolder: this.downloadsFolder,
    });

    const onFinish = (response) => () => {
      response.writeHead(200);
      const data = JSON.stringify({ result: "Files uploaded with success!" });
      response.end(data);
    };

    const busboyInstance = uploadHandler.registerEvents(headers, onFinish(response));

    await pipeline(request, busboyInstance);

    logger.info("request finished with success!");
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
