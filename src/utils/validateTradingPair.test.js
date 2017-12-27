/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { validateTradingPair } from './validateTradingPair';
import { generateTradingPairs } from './generateTradingPairs';
import { BASE_TOKENS, QUOTE_TOKENS } from '../constants';

describe('(Util) validateTradingPair', () => {
  it('if provided correct token pair it should return true', () => {
      expect(validateTradingPair('MKR', 'W-ETH', generateTradingPairs(BASE_TOKENS, QUOTE_TOKENS))).toBe(true)
  });

  it('if provided wrong token pair it should return false', () => {
    expect(validateTradingPair('SAI', 'W-ETH', generateTradingPairs(BASE_TOKENS, QUOTE_TOKENS))).toBe(false)
  });
});
