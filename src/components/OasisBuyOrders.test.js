/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisBuyOrders from './OasisBuyOrders';
import { TOKEN_MAKER, TOKEN_WRAPPED_ETH } from '../constants';
import { List } from 'immutable';

describe('(Component) OasisBuyOrders', () => {
  it('should render', () => {
    const props = {
      activeTradingPair: { baseToken: TOKEN_MAKER, quoteToken: TOKEN_WRAPPED_ETH },
      onSetOfferTakeModalOpen: jest.fn,
      onSetActiveOfferTakeOfferId: jest.fn,
      onCheckOfferIsActive: jest.fn,
      onResetCompletedOfferCheck: jest.fn,
      loadedOffersList: List(),
      buyOffers: List()
    };
    const wrapper = shallow(
      <OasisBuyOrders {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
