import { describe, test, expect, jest } from "@jest/globals";
import { logger } from "../../src/logger.js";
import Routes from "../../src/routes.js";
import UploadHandler from "../../src/uploadHandler.js";
import TestUtil from "../utils/testUtil.js";

describe("# Routes test suite", () => {
  beforeEach(() => {
    jest.spyOn(logger, "info").mockImplementation(jest.fn());
  });

  const request = TestUtil.generateReadableStream(["some", "file", "bytes"]);
  const response = TestUtil.generateWritableStream(() => {});
  const defaultParams = {
    request: Object.assign(request, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      method: "",
      body: {},
    }),
    response: Object.assign(response, {
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn(),
    }),
    values: () => Object.values(defaultParams),
  };

  describe("# setSocketInstance()", () => {
    test("setSocket should store io instance", () => {
      const routes = new Routes();

      // Mocking the io instance methods
      const ioObject = {
        to: (id) => ioObject,
        emit: (event, message) => {},
      };

      routes.setSocketInstance(ioObject);
      expect(routes.socketIo).toStrictEqual(ioObject);
    });
  });

  describe("# handler()", () => {
    test("given an inexistent route it should choose the default route", async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams,
      };
      params.request.method = "inexistent";
      await routes.handler(...params.values());
      expect(params.response.end).toHaveBeenCalledWith("hello world");
    });

    test("it should set any request with CORS enabled", async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams,
      };
      params.request.method = "GET";
      await routes.handler(...params.values());
      expect(params.response.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Origin", "*");
    });

    test("given method OPTIONS it should choose options() route", async () => {
      const routes = new Routes();
      const optionsSpy = jest.spyOn(routes, "options");
      const params = {
        ...defaultParams,
      };
      params.request.method = "OPTIONS";
      await routes.handler(...params.values());
      expect(params.response.writeHead).toHaveBeenCalledWith(204);
      expect(params.response.end).toHaveBeenCalled();
      expect(optionsSpy).toHaveBeenCalledWith(params.request, params.response);
    });

    test("given method GET it should choose get() route", async () => {
      const routes = new Routes();
      const getSpy = jest.spyOn(routes, "get").mockResolvedValue(Promise.resolve());
      const params = {
        ...defaultParams,
      };
      params.request.method = "GET";
      await routes.handler(...params.values());
      expect(getSpy).toHaveBeenCalledWith(params.request, params.response);
    });

    test("given method POST it should choose post() route", async () => {
      const routes = new Routes();
      const postSpy = jest.spyOn(routes, "post").mockResolvedValue(Promise.resolve());
      const params = {
        ...defaultParams,
      };
      params.request.method = "POST";
      await routes.handler(...params.values());
      expect(postSpy).toHaveBeenCalledWith(params.request, params.response);
    });
  });

  describe("# get()", () => {
    test("given method GET it should list all files downloaded", async () => {
      // Arrange
      const routes = new Routes();

      const params = {
        ...defaultParams,
      };

      const fileStatusesMock = [
        {
          size: "2.89 MB",
          lastModified: "2022-11-10T15:26:15.359Z",
          owner: "tupizz",
          file: "filename.jpg",
        },
      ];

      jest.spyOn(routes.fileHelper, routes.fileHelper.getFileStatus.name).mockResolvedValue(fileStatusesMock);
      params.request.method = "GET";

      // Act
      await routes.handler(...params.values());

      // Assert
      expect(params.response.writeHead).toHaveBeenCalledWith(200);
      expect(params.response.end).toHaveBeenCalledWith(JSON.stringify(fileStatusesMock));
    });
  });

  describe("# post()", () => {
    test("it should validate post route workflow", async () => {
      const routes = new Routes("/tmp");
      const options = {
        ...defaultParams,
      };
      options.request.method = "POST";
      options.request.url = "?socketId=10";

      // ⚠️ using prototype because we dont have direct access to the instance, so this mock all instances of the class
      jest
        .spyOn(UploadHandler.prototype, UploadHandler.prototype.registerEvents.name)
        .mockImplementation((headers, onFinish) => {
          const writable = TestUtil.generateWritableStream(() => {});
          writable.on("finish", onFinish);
          return writable;
        });

      await routes.handler(...options.values());

      expect(UploadHandler.prototype.registerEvents).toHaveBeenCalled();
      expect(options.response.writeHead).toHaveBeenCalledWith(200);
    });
  });
});
