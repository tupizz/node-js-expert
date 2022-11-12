import { describe, test, expect, jest, beforeAll, afterAll } from "@jest/globals";
import FormData from "form-data";
import fs from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { logger } from "../../src/logger.js";
import Routes from "../../src/routes.js";
import TestUtil from "../utils/testUtil.js";

describe("# Routes Integration Test", () => {
  let tmpDownloadsDir = "";
  beforeAll(async () => {
    tmpDownloadsDir = await fs.promises.mkdtemp(join(tmpdir(), "downloads-"));
  });

  afterAll(async () => {
    await fs.promises.rm(tmpDownloadsDir, { recursive: true });
  });

  beforeEach(() => {
    jest.spyOn(logger, "info").mockImplementation(jest.fn());
  });

  describe("# post()", () => {
    const ioObject = {
      to: (id) => ioObject,
      emit: (event, message) => {},
    };

    test("should upload File to Folder", async () => {
      const filename = "profile.jpg";
      const fileStream = fs.createReadStream(`./tests/integration/mocks/${filename}`);
      const response = TestUtil.generateWritableStream(() => {});

      const form = new FormData();
      form.append("photo", fileStream);

      const defaultParams = {
        // readable stream
        request: Object.assign(form, {
          headers: form.getHeaders(),
          method: "POST",
          url: "?socketId=10",
        }),
        // writable stream
        response: Object.assign(response, {
          setHeader: jest.fn(),
          writeHead: jest.fn(),
          end: jest.fn(),
        }),
        values: () => Object.values(defaultParams),
      };

      const routes = new Routes(tmpDownloadsDir);
      routes.setSocketInstance(ioObject);

      const dirBefore = await fs.promises.readdir(tmpDownloadsDir);
      expect(dirBefore).toEqual([]);

      await routes.handler(...defaultParams.values());

      const dirAfter = await fs.promises.readdir(tmpDownloadsDir);
      expect(dirAfter).toEqual([filename]);

      expect(defaultParams.response.writeHead).toHaveBeenCalledWith(200);
    });
  });
});
