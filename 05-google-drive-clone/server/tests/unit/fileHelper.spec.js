import fs from "fs";
import { describe, test, expect, jest } from "@jest/globals";
import FileHelper from "../../src/fileHelper.js";

describe("# FileHelper", () => {
  describe("# getFileStatus()", () => {
    test("it should return file status in correct format", async () => {
      const statMock = {
        dev: 16777231,
        mode: 33188,
        nlink: 1,
        uid: 501,
        gid: 20,
        rdev: 0,
        blksize: 4096,
        ino: 42336364,
        size: 2894717,
        blocks: 5656,
        atimeMs: 1668093982762.341,
        mtimeMs: 1668093975364.0479,
        ctimeMs: 1668093986873.4077,
        birthtimeMs: 1668093975358.9812,
        atime: "2022-11-10T15:26:22.762Z",
        mtime: "2022-11-10T15:26:15.364Z",
        ctime: "2022-11-10T15:26:26.873Z",
        birthtime: "2022-11-10T15:26:15.359Z",
      };

      jest.spyOn(fs.promises, fs.promises.readdir.name).mockResolvedValue(["file.png"]);

      jest.spyOn(fs.promises, fs.promises.stat.name).mockResolvedValue(statMock);

      const mockUser = "tupizz";
      process.env.USER = mockUser;
      const filename = "file.png";

      const expectedResult = [
        {
          size: "2.89 MB",
          lastModified: statMock.birthtime,
          owner: mockUser,
          file: filename,
        },
      ];

      const result = await FileHelper.getFileStatus("/anyFolder");

      expect(fs.promises.stat).toHaveBeenCalledWith(`/anyFolder/${filename}`);
      expect(result).toMatchObject(expectedResult);
    });
  });
});
