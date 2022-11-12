import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { pipeline } from "stream/promises";
import fs from "fs";
import { resolve } from "path";
import UploadHandler from "../../src/uploadHandler.js";
import TestUtil from "../utils/testUtil.js";
import { logger } from "../../src/logger.js";

describe("# UploadHandler test suite", () => {
  // Mocking the io instance methods
  const ioObject = {
    to: (id) => ioObject,
    emit: (event, message) => {},
  };

  beforeEach(() => {
    jest.spyOn(logger, "info").mockImplementation(jest.fn());
  });

  describe("# registerEvents()", () => {
    test("should call onFile and onFinish functions on Busboy instance", () => {
      // Arrange
      const uploadHandler = new UploadHandler({ socketIo: ioObject, socketId: "01" });

      jest.spyOn(uploadHandler, uploadHandler.onFile.name).mockResolvedValue();

      // Mocking the receiving headers
      const headers = {
        "content-type": "multipart/form-data; boundary=",
      };

      const onFinish = jest.fn();

      // Act
      const readableFileStream = TestUtil.generateReadableStream(["chunk", "of", "data"]);
      const busboyInstance = uploadHandler.registerEvents(headers, onFinish);
      busboyInstance.emit("file", "fieldname", readableFileStream, "filename.txt");
      busboyInstance.listeners("finish")[0].call(); // Calling the finish event, in this case it's the onFinish Mock jest function

      // Assert
      expect(uploadHandler.onFile).toHaveBeenCalled();
      expect(onFinish).toHaveBeenCalled();
    });
  });

  describe("# onFile()", () => {
    test("given a stream file it should save it on disk", async () => {
      // Arrange
      const downloadsFolder = "/tmp";
      const handler = new UploadHandler({
        socketId: "01",
        socketIo: ioObject,
        downloadsFolder,
      });

      // streams handled in onFile method
      const onData = jest.fn();
      jest.spyOn(fs, fs.createWriteStream.name).mockImplementation(() => TestUtil.generateWritableStream(onData));

      const onTransform = jest.fn();
      jest
        .spyOn(handler, handler.handleFileBytes.name)
        .mockImplementation(() => TestUtil.generateTransformStream(onTransform));

      const params = {
        fieldname: "video",
        file: TestUtil.generateReadableStream(["hey", "dude"]),
        filename: "mockFile.mov",
      };

      await handler.onFile(...Object.values(params));

      expect(onData.mock.calls.join()).toEqual(["hey", "dude"].join());
      expect(onTransform.mock.calls.join()).toEqual(["hey", "dude"].join());
      expect(fs.createWriteStream).toHaveBeenCalledWith(resolve(handler.downloadsFolder, params.filename));
    });
  });

  describe("# handleFileBytes()", () => {
    test("should call emit function and it is a transform stream", async () => {
      jest.spyOn(ioObject, ioObject.to.name);
      jest.spyOn(ioObject, ioObject.emit.name);

      const handler = new UploadHandler({
        socketId: "01",
        socketIo: ioObject,
      });
      jest.spyOn(handler, handler.canExecute.name).mockReturnValue(true);

      const messages = ["hello", "world", "from", "transform", "stream"];
      const source = TestUtil.generateReadableStream(messages);
      const onWrite = jest.fn();
      const target = TestUtil.generateWritableStream(onWrite);

      // Mimicking what onFile() is doing inside
      await pipeline(source, handler.handleFileBytes("filename.txt"), target);

      expect(ioObject.to).toHaveBeenCalledTimes(messages.length);
      expect(ioObject.emit).toHaveBeenCalledTimes(messages.length);
      expect(onWrite).toHaveBeenCalledTimes(messages.length);
      expect(onWrite.mock.calls.join()).toEqual(messages.join());
    });

    test("given message timerDelay as 2secs it should emit only two messages during 3 seconds period", async () => {
      jest.spyOn(ioObject, ioObject.emit.name);

      // Mock all Date.now()
      const day = "2021-07-01 01:01";

      //  Date.now() do this.lastMessageSent em handleBytes
      const onFirstLastMessageSent = TestUtil.getTimeFromDate(`${day}:00`);

      // "hello" message
      const onFirstCanExecute = TestUtil.getTimeFromDate(`${day}:02`);
      const onSecondUpdateLastMessageSent = onFirstCanExecute;

      // "world" message (cannot execute, less than 2secs)
      const onSecondCanExecute = TestUtil.getTimeFromDate(`${day}:03`);

      // "from" message
      const onThirdCanExecute = TestUtil.getTimeFromDate(`${day}:04`);

      TestUtil.mockDateNow([
        onFirstLastMessageSent,
        onFirstCanExecute,
        onSecondUpdateLastMessageSent,
        onSecondCanExecute,
        onThirdCanExecute,
      ]);

      const messages = ["hello", "world", "from"];
      const source = TestUtil.generateReadableStream(messages);
      const onWrite = jest.fn();
      const target = TestUtil.generateWritableStream(onWrite);

      // Mimicking what onFile() is doing inside
      const handler = new UploadHandler({
        socketId: "01",
        socketIo: ioObject,
        messageTimeDelay: 2000,
      });
      await pipeline(source, handler.handleFileBytes("filename.txt"), target);

      expect(ioObject.emit).toHaveBeenCalledTimes(2);

      const [firstCallResult, secondCallResult] = ioObject.emit.mock.calls;

      expect(firstCallResult).toEqual([
        handler.ON_UPLOAD_EVENT,
        { processedAlready: "hello".length, filename: "filename.txt" },
      ]);

      expect(secondCallResult).toEqual([
        handler.ON_UPLOAD_EVENT,
        { processedAlready: messages.join("").length, filename: "filename.txt" },
      ]);
    });
  });

  describe("# canExecute()", () => {
    test("should return true when time is later than specified delay", async () => {
      const handler = new UploadHandler({
        socketId: "",
        socketIo: null,
        downloadsFolder: "./",
        messageTimeDelay: 1_000,
      });

      const timeNow = TestUtil.getTimeFromDate("2021-07-01 00:00:03");
      TestUtil.mockDateNow([timeNow]);
      const lastExecution = TestUtil.getTimeFromDate("2021-07-01 00:00:00");
      const result = handler.canExecute(lastExecution);
      expect(result).toBeTruthy();
    });

    test("should return false when time is before than specified delay", () => {
      const handler = new UploadHandler({
        socketId: "",
        socketIo: null,
        downloadsFolder: "./",
        messageTimeDelay: 5_000,
      });

      const timeNow = TestUtil.getTimeFromDate("2021-07-01 00:00:03");
      TestUtil.mockDateNow([timeNow]);
      const lastExecution = TestUtil.getTimeFromDate("2021-07-01 00:00:02");
      // this can't be executed because it's less than 2 seconds which is the messageTimeDelay messageTimeDelay
      const result = handler.canExecute(lastExecution);
      expect(result).toBeFalsy();
    });
  });
});
