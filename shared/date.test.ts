import { parseDuration } from "./date";

test("Parses duration", () => {
  expect(parseDuration("00:00:01.00")).toBe(1);
  expect(parseDuration("00:00:01.50")).toBe(1.5);
  expect(parseDuration("00:05:00.00")).toBe(300);
  expect(parseDuration("00:05:00.50")).toBe(300.5);
  expect(parseDuration("23:45:67.89")).toBe(85567.89);
});

test("Correct length", () => {
  const errorRegex = /text length is not/;
  expect(() => parseDuration("asdf")).toThrowError(errorRegex);
  expect(() => parseDuration("00:00:01.000")).toThrowError(errorRegex);
  expect(() => parseDuration("")).toThrowError(errorRegex);
});
