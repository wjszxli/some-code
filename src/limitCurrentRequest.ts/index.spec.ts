import { limitCurrentRequest } from "./index";
import { mockSuccessRequest, mockFailRequest } from "../utils";

describe("limitCurrentRequest", () => {
  it("should resolve with an empty array when the request list is empty", async () => {
    const result = await limitCurrentRequest([], 3);
    expect(result).toEqual([]);
  });

  it("should handle a single request successfully when the limit is 1", async () => {
    const request = () => mockSuccessRequest("result");
    const result = await limitCurrentRequest([request], 1);
    expect(result).toEqual(["result"]);
  });

  it("should handle multiple requests successfully when the limit is greater than 1", async () => {
    const request1 = () => mockSuccessRequest("result1");
    const request2 = () => mockSuccessRequest("result2");
    const request3 = () => mockSuccessRequest("result3");

    const result = await limitCurrentRequest([request1, request2, request3], 2);
    expect(result).toEqual(["result1", "result2", "result3"]);
  });

  it("should handle a limit of 0 by not processing any requests", async () => {
    const request1 = jest.fn(() => mockSuccessRequest("result1"));
    const request2 = jest.fn(() => mockSuccessRequest("result2"));
    const request3 = jest.fn(() => mockSuccessRequest("result3"));

    const result = await limitCurrentRequest([request1, request2, request3], 0);

    expect(result).toEqual([]);
    expect(request1).not.toHaveBeenCalled();
    expect(request2).not.toHaveBeenCalled();
    expect(request3).not.toHaveBeenCalled();
  });

  it("should handle partial failures without affecting other requests", async () => {
    const requestList = [
      () => mockSuccessRequest("result1"),
      () => mockFailRequest("error2"),
      () => mockSuccessRequest("result3"),
    ];

    const result = (await limitCurrentRequest(requestList, 2)) as (
      | string
      | Error
    )[];

    expect(result[0]).toBe("result1");
    expect(result[1]).toBeInstanceOf(Error);
    expect(result[2]).toBe("result3");
  });

  it("should handle partial throw Error without affecting other requests", async () => {
    const requestList = [
      () => mockSuccessRequest("result1"),
      () => Promise.reject("error2"),
      () => mockSuccessRequest("result3"),
    ];

    const result = (await limitCurrentRequest(requestList, 2)) as (
      | string
      | Error
    )[];

    expect(result[0]).toBe("result1");
    expect(result[1]).toBeInstanceOf(Error);
    expect(result[2]).toBe("result3");
  });

  it("should handle a limit of 2 by not processing any requests", async () => {
    const result = await limitCurrentRequest([], 2);
    expect(result).toEqual([]);
  });

  it("should handle empty request list", async () => {
    const result = await limitCurrentRequest();

    expect(result).toEqual([]);
  });

  it("should handle limitRequest being 0", async () => {
    const requestList = [
      () => mockSuccessRequest("result1"),
      () => mockSuccessRequest("result2"),
    ];

    const result = await limitCurrentRequest(requestList, 0);

    expect(result).toEqual([]);
  });

  it("should resolve all requests even if they complete out of order", async () => {
    const request1 = () =>
      new Promise((resolve) => setTimeout(() => resolve("result1"), 100));
    const request2 = () =>
      new Promise((resolve) => setTimeout(() => resolve("result2"), 50));
    const request3 = () =>
      new Promise((resolve) => setTimeout(() => resolve("result3"), 10));
    const request4 = () =>
      new Promise((resolve) => setTimeout(() => resolve("result4"), 20));
    const request5 = () =>
      new Promise((resolve) => setTimeout(() => resolve("result5"), 30));

    const result = await limitCurrentRequest(
      [request1, request2, request3, request4, request5],
      2
    );

    expect(result).toEqual([
      "result1",
      "result2",
      "result3",
      "result4",
      "result5",
    ]);
  });
});
