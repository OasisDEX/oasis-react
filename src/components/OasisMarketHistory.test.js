/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import OasisMarketHistory from './OasisMarketHistory';
import { TOKEN_MAKER, TOKEN_WRAPPED_ETH } from '../constants';


describe('(Component) OasisMarketHistory', () => {
  it('should render', () => {
    const props = {
      activeTradingPair: {
        baseToken: TOKEN_MAKER,
        quoteToken: TOKEN_WRAPPED_ETH
      },
      trades: fromJS([])
    };
    const wrapper = shallow(
      <OasisMarketHistory {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
