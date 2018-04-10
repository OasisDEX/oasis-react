/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS } from 'immutable';

import {
  SetTokenAllowanceTrustWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './SetTokenAllowanceTrust';
import { shallow } from 'enzyme';
import { TOKEN_WRAPPED_ETH } from '../constants';

describe('(Container) SetTokenAllowanceTrust', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state, {});
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    allowanceSubjectAddress: '0x0',
    tokenName: TOKEN_WRAPPED_ETH,
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
      <SetTokenAllowanceTrustWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
