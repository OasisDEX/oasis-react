/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { validateTokenPair } from './validateTokenPair';
import { generateTradingPairs } from './generateTradingPairs';
import { BASE_TOKENS, QUOTE_TOKENS } from '../constant';

describe('(Util) validateTokenPair', () => {
  it('if provided correct token pair it should return true', () => {
      expect(validateTokenPair('MKR', 'W-ETH', generateTradingPairs(BASE_TOKENS, QUOTE_TOKENS))).toBe(true)
  });

  it('if provided wrong token pair it should return false', () => {
    expect(validateTokenPair('SAI', 'W-ETH', generateTradingPairs(BASE_TOKENS, QUOTE_TOKENS))).toBe(false)
  });
});
