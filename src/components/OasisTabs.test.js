/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';

import OasisTabs from './OasisTabs';
import { shallow } from 'enzyme';
import { TOKEN_DAI, TOKEN_WRAPPED_ETH } from '../constants';

describe('(Component) OasisTabs', () => {
  it('should render', () => {
    const props = {
      defaultTradingPair: {
        baseToken: TOKEN_WRAPPED_ETH,
        quoteToken: TOKEN_DAI
      }
    };
    const wrapper = shallow(
      <OasisTabs {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
