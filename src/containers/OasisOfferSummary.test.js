/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS } from 'immutable';

import {
  OasisOfferSummaryWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisOfferSummary';
import { shallow } from 'enzyme';
import { MAKE_BUY_OFFER, TOKEN_MAKER, TOKEN_WRAPPED_ETH } from '../constants';

describe('(Container) OasisOfferSummary', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state, { offerType: MAKE_BUY_OFFER });
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    offerType: MAKE_BUY_OFFER,
    offerFormValues: fromJS({}),
    hasSufficientTokenAmount: false,
    tokenName: TOKEN_MAKER,
    offerBuyAndSellTokens: fromJS({ buyToken: TOKEN_MAKER, sellToken: TOKEN_WRAPPED_ETH })
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <OasisOfferSummaryWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
