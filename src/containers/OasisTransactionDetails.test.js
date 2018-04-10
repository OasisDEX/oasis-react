/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS } from 'immutable';

import {
  OasisTransactionDetailsWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisTransactionDetails';
import { shallow } from 'enzyme';
import { TX_OFFER_TAKE } from '../store/reducers/transactions';
import { TOKEN_DAI, TOKEN_WRAPPED_ETH } from '../constants';

describe('(Container) OasisTransactionDetails', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state, { transactionSubectType: TX_OFFER_TAKE });
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    transactionSubectType: TX_OFFER_TAKE,
    getTransactionGasCostEstimate: jest.fn,
    buyToken: TOKEN_DAI,
    sellToken: TOKEN_WRAPPED_ETH,
    transactionSubjectAddress: '0x0000000000000000000000000000000000000000'
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <OasisTransactionDetailsWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
