/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import Immutable from 'immutable';

import {
  TokenTransferFormWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './TokenTransferForm';
import { shallow } from 'enzyme';

describe('(Container) TokenTransferForm', () => {
  const state = Immutable.fromJS(global.storeMock);
  const initialProps = mapStateToProps(state);
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    onFormChange: jest.fn,
    onSubmit: jest.fn
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <TokenTransferFormWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
