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
  const state = fromJS(global.storeMock);
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
        setActiveTradingPairEpic: {},
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
    props.actions.setActiveTradingPairEpic = jest.fn;
    props.actions.denotePrecision = jest.fn;

    const wrapper = shallow(
      <OasisTradeWrapper {...props}/>,
    );
    expect(wrapper).toMatchSnapshot();
  });

});
