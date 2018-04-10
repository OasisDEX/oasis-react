/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import Immutable from 'immutable';

import {
  OasisTokenBalanceWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisTokenBalance';
import { shallow } from 'enzyme';
import { TOKEN_WRAPPED_ETH } from '../constants';

describe('(Container) OasisTokenBalance', () => {
  const state = Immutable.fromJS(global.storeMock);
  const initialProps = mapStateToProps(state, { tokenName: TOKEN_WRAPPED_ETH });
  const initialActions = mapDispatchToProps(x => x);
  const props = {
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
      <OasisTokenBalanceWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
