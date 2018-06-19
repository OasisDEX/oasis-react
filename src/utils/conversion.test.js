import each from "jest-each";

import {convertTo18PrecisionInternal, convertToTokenPrecisionInternal} from "./conversion";

each([
  ["18", "1000000000000000000", "1000000000000000000"],
  ["18", "1000000000", "1000000000"],
  ["18", "0", "0"],
  ["9", "1000000000000000000", "1000000000000000000000000000"],
  ["9", "1000000000", "1000000000000000000"],
  ["9", "0", "0"],])

.describe(
  "token conversions",
  (precision, tokenAmount, p18Amount) => {
    describe(`precision: ${precision}, token amount: ${tokenAmount}, 18 amount: ${p18Amount}`, () => {
    test(`convertTo18PrecisionInternal`, () => {
      expect(convertTo18PrecisionInternal(precision, tokenAmount)).toEqual(p18Amount);

    });

    test(`convertToTokenPrecisionInternal`, () => {
      expect(convertToTokenPrecisionInternal(precision, p18Amount)).toEqual(tokenAmount);
    });

    test(`cross check from 18 precision`, () => {
      expect(
        convertTo18PrecisionInternal(precision,
          convertToTokenPrecisionInternal(precision, p18Amount))).toEqual(p18Amount);
    });

    test(`cross check from token precision`, () => {
        expect(
          convertToTokenPrecisionInternal(precision,
            convertTo18PrecisionInternal(precision, tokenAmount))).toEqual(tokenAmount);
    });
  })});
