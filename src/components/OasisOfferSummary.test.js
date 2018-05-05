/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisOfferSummary from './OasisOfferSummary';
import { PropTypes } from 'prop-types';
import { TAKE_BUY_OFFER } from '../store/reducers/offerTakes';
import { TOKEN_MAKER, TOKEN_WRAPPED_ETH } from '../constants';
import { fromJS } from 'immutable';


describe('(Component) OasisOfferSummary', () => {
  it('should render', () => {
    const props = {
      offerType: TAKE_BUY_OFFER,
      sellToken: TOKEN_MAKER,
      buyToken: TOKEN_WRAPPED_ETH,
      amountSold: '1',
      amountReceived: '1',
      gasEstimateInfo: fromJS({}),
      isTokenTradingEnabled: true
    };
    const wrapper = shallow(
      <OasisOfferSummary {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
