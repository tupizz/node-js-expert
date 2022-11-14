import Busboy from "busboy";
import fs from "fs";
import { pipeline } from "stream/promises";
import { logger } from "./logger.js";

export default class UploadHandler {
  constructor({ socketIo, socketId, downloadsFolder, messageTimeDelay = 200 }) {
    this.socketIo = socketIo;
    this.socketId = socketId;
    this.downloadsFolder = downloadsFolder;
    this.messageTimeDelay = messageTimeDelay;
    this.ON_UPLOAD_EVENT = "file-upload";
  }

  // backpressure paradigm
  canExecute(lastExecution) {
    return Date.now() - lastExecution >= this.messageTimeDelay;
  }

  handleFileBytes(filename) {
    this.lastMessageSent = Date.now();

    async function* handlerData(source) {
      let processedAlready = 0;
      for await (const chunk of source) {
        yield chunk;
        processedAlready += chunk.length;

        if (!this.canExecute(this.lastMessageSent)) {
          continue;
        }

        this.lastMessageSent = Date.now();
        this.socketIo.to(this.socketId).emit(this.ON_UPLOAD_EVENT, { filename, processedAlready });
        logger.info(`File [${filename}] got ${processedAlready} bytes to ${this.socketId}`);
      }
    }

    return handlerData.bind(this);
  }

  async onFile(fieldname, file, filename) {
    const saveTo = `${this.downloadsFolder}/${filename}`;

    await pipeline(
      // 1st - get readable stream
      file,
      // 2nd - filter, convert and transform data
      this.handleFileBytes.apply(this, [filename]),
      // 3rd - writable stream
      fs.createWriteStream(saveTo)
    );

    logger.info(`File [${filename}] finished`);
  }

  registerEvents(headers, onFinish) {
    const busboy = new Busboy({ headers });

    busboy.on("file", this.onFile.bind(this));
    busboy.on("finish", onFinish);

    return busboy;
  }
}
