/* global shallow describe it expect */
/* eslint-disable import/first */
import React                             from 'react';
import { shallow }                       from 'enzyme';
import {TX_STATUS_AWAITING_CONFIRMATION} from '../store/reducers/transactions';
import TransactionStatus                 from './TransactionStatus';
import { Map }                           from 'immutable';

describe('(Component) TransactionStatus', () => {
  it('should render', () => {
    const props = {
      transaction: Map({txStatus: TX_STATUS_AWAITING_CONFIRMATION }),
      transactionReceipt: Map({
        txStatus: TX_STATUS_AWAITING_CONFIRMATION
      })
    };
    const wrapper = shallow(
      <TransactionStatus {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
