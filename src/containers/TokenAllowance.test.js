/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS } from 'immutable';

import {
  TokenAllowanceWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './TokenAllowance';
import { shallow } from 'enzyme';
import { ETH_UNIT_ETHER, TOKEN_WRAPPED_ETH } from '../constants';

describe('(Container) TokenAllowance', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state, {});
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    tokenName: TOKEN_WRAPPED_ETH,
    allowanceUnit: ETH_UNIT_ETHER,
    ...initialActions,
    ...initialProps
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <TokenAllowanceWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
