/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS } from 'immutable';

import {
  OasisTokenWrapFormWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisTokenWrapForm';
import { shallow } from 'enzyme';
import { TX_STATUS_AWAITING_CONFIRMATION } from '../store/reducers/transactions';

describe('(Container) OasisTokenWrapForm', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state, { form: "wrapEther" });
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    transactionState: {
      txStartTimestamp: 1,
      txStatus: TX_STATUS_AWAITING_CONFIRMATION,
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
      <OasisTokenWrapFormWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
