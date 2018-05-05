/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisSoldReceivedAmounts from './OasisSoldReceivedAmounts';
import { PropTypes } from 'prop-types';
import { TOKEN_MAKER, TOKEN_WRAPPED_ETH } from '../constants';


describe('(Component) OasisSoldReceivedAmounts', () => {
  it('should render', () => {
    const props = {
      sellToken: TOKEN_WRAPPED_ETH,
      buyToken: TOKEN_MAKER,
      amountSold: '1',
      amountReceived: '1'
    };
    const wrapper = shallow(
      <OasisSoldReceivedAmounts {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
