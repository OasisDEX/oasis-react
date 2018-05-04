/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS } from 'immutable';

import {
  OasisTransactionStatusWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisTransactionStatus';
import { shallow } from 'enzyme';
import { TAKE_BUY_OFFER } from '../store/reducers/offerTakes';

describe('(Container) OasisTransactionStatus', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state, {});
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    txTimestamp: 1,
    transaction: fromJS({txType: TAKE_BUY_OFFER})
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <OasisTransactionStatusWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
