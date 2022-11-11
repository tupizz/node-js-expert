import fs from "fs";
import prettyBytes from "pretty-bytes";

export default class FileHelper {
  static async getFileStatus(downloadsFolder) {
    // find all files in dir
    const currentFiles = await fs.promises.readdir(downloadsFolder);

    // for each file in dir get file stats
    const statuses = await Promise.all(currentFiles.map((file) => fs.promises.stat(`${downloadsFolder}/${file}`)));

    return statuses.map(({ birthtime, size }, index) => {
      return {
        size: prettyBytes(size),
        lastModified: birthtime,
        owner: process.env.USER,
        file: currentFiles[index],
      };
    });
  }
}
