/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS } from 'immutable';

import {
  OasisTokenUnwrapFormWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisTokenUnwrapForm';
import { shallow } from 'enzyme';
import { TX_STATUS_AWAITING_CONFIRMATION } from '../store/reducers/transactions';

describe('(Container) OasisTokenUnwrapForm', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state, { form: "unwrapEther" });
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    transactionState: {
      txStatus: TX_STATUS_AWAITING_CONFIRMATION,
      txStartTimestamp: 1
    },
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <OasisTokenUnwrapFormWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
