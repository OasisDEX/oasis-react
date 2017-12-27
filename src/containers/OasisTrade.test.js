/* global shallow describe it expect */
/* eslint-disable import/first,no-undef */
import React from 'react';
import { fromJS } from 'immutable';
import { shallow } from 'enzyme';

import {
  OasisTradeWrapper,
  mapStateToProps,
  mapDispatchToProps,
} from './OasisTrade';
import { WEEK } from '../utils/period';

describe('(Container) OasisTrade', () => {
  const state = fromJS({
    tokens: {
      allTokens: [
        'W-ETH',
        'MKR',
        'DGD',
        'GNT',
        'W-GNT',
        'REP',
        'ICN',
        '1ST',
        'SNGLS',
        'VSL',
        'PLU',
        'MLN',
        'RHOC',
        'TIME',
        'GUP',
        'BAT',
        'NMR',
        'SAI',
      ],
      baseTokens: [
        'W-GNT',
        'DGD',
        'REP',
        'ICN',
        '1ST',
        'SNGLS',
        'VSL',
        'PLU',
        'MLN',
        'RHOC',
        'TIME',
        'GUP',
        'BAT',
        'NMR',
      ],
      quoteTokens: [
        'W-ETH',
      ],
      tradingPairs: [
        {
          base: 'MKR',
          quote: 'W-ETH',
          priority: 10,
        },
        {
          base: 'W-ETH',
          quote: 'SAI',
          priority: 9,
        },
        {
          base: 'MKR',
          quote: 'SAI',
          priority: 8,
        },
        {
          base: 'W-GNT',
          quote: 'W-ETH',
          priority: 0,
        },
        {
          base: 'DGD',
          quote: 'W-ETH',
          priority: 0,
        },
        {
          base: 'REP',
          quote: 'W-ETH',
          priority: 0,
        },
        {
          base: 'ICN',
          quote: 'W-ETH',
          priority: 0,
        },
        {
          base: '1ST',
          quote: 'W-ETH',
          priority: 0,
        },
        {
          base: 'SNGLS',
          quote: 'W-ETH',
          priority: 0,
        },
        {
          base: 'VSL',
          quote: 'W-ETH',
          priority: 0,
        },
        {
          base: 'PLU',
          quote: 'W-ETH',
          priority: 0,
        },
        {
          base: 'MLN',
          quote: 'W-ETH',
          priority: 0,
        },
        {
          base: 'RHOC',
          quote: 'W-ETH',
          priority: 0,
        },
        {
          base: 'TIME',
          quote: 'W-ETH',
          priority: 0,
        },
        {
          base: 'GUP',
          quote: 'W-ETH',
          priority: 0,
        },
        {
          base: 'BAT',
          quote: 'W-ETH',
          priority: 0,
        },
        {
          base: 'NMR',
          quote: 'W-ETH',
          priority: 0,
        },
      ],
      tokenSpecs: {
        DGD: {
          precision: 9,
          format: '0,0.00[0000000]',
        },
        GUP: {
          precision: 3,
          format: '0,0.00[0]',
        },
        'W-ETH': {
          precision: 18,
          format: '0,0.00[0000000000000000]',
        },
        RHOC: {
          precision: 8,
          format: '0,0.00[000000]',
        },
        DAI: {
          precision: 18,
          format: '0,0.00[0000000000000000]',
        },
        GNT: {
          precision: 18,
          format: '0,0.00[0000000000000000]',
        },
        TIME: {
          precision: 8,
          format: '0,0.00[000000]',
        },
        VSL: {
          precision: 18,
          format: '0,0.00[0000000000000000]',
        },
        MLN: {
          precision: 18,
          format: '0,0.00[0000000000000000]',
        },
        '1ST': {
          precision: 18,
          format: '0,0.00[0000000000000000]',
        },
        NMR: {
          precision: 18,
          format: '0,0.00[0000000000000000]',
        },
        SNGLS: {
          precision: 0,
          format: '0,0',
        },
        'OW-ETH': {
          precision: 18,
          format: '0,0.00[0000000000000000]',
        },
        ICN: {
          precision: 18,
          format: '0,0.00[0000000000000000]',
        },
        MKR: {
          precision: 18,
          format: '0,0.00[0000000000000000]',
        },
        BAT: {
          precision: 18,
          format: '0,0.00[0000000000000000]',
        },
        'W-GNT': {
          precision: 18,
          format: '0,0.00[0000000000000000]',
        },
        PLU: {
          precision: 18,
          format: '0,0.00[0000000000000000]',
        },
        SAI: {
          precision: 18,
          format: '0,0.00[0000000000000000]',
        },
        REP: {
          precision: 18,
          format: '0,0.00[0000000000000000]',
        },
      },
      activeTradingPair: null,
    },
    trades: {
      initialMarketHistoryLoaded: false,
    },
    platform: {
      defaultPeriod: WEEK,
    },
  });
  const initialProps = mapStateToProps(state);
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    ...{
      defaultTradingPair: fromJS({
        baseToken: 'MKR',
        quoteToken: 'W-ETH',
      }),
      match: {
        path: '/trade/:baseToken?/:quoteToken?',
        url: '/trade/MKR/W-ETH',
        isExact: true,
        params: {
          baseToken: 'MKR',
          quoteToken: 'W-ETH',
        },
      },
      location: {
        pathname: '/trade/MKR/W-ETH',
        search: '',
        hash: '',
        key: '26cxme',
      },
      history: {
        length: 36,
        action: 'POP',
        location: {},
        createHref: {},
        push: {},
        replace: {},
        go: {},
        goBack: {},
        goForward: {},
        block: {},
        listen: {},
      },
      validBaseTokensList: {},
      validQuoteTokensList: {},
      actions: {
        setActiveTradingPair: {},
      },
    },
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });

  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    props.actions.setActiveTradingPair = jest.fn;
    const wrapper = shallow(
      <OasisTradeWrapper {...props}/>,
    );
    expect(wrapper).toMatchSnapshot();
  });

});
