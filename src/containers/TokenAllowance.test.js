/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import Immutable from 'immutable';

import {
  TokenAllowanceWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './TokenAllowance';
import { shallow } from 'enzyme';
import { ETH_UNIT_ETHER, TOKEN_WRAPPED_ETH } from '../constants';

describe('(Container) TokenAllowance', () => {
  const state = Immutable.fromJS({
    balances: {
      defaultAccount: {
        tokenAllowances: {
          DGD: '0',
          GUP: '0',
          'W-ETH': '232222',
          RHOC: '0',
          DAI: '0',
          GNT: '0',
          TIME: '0',
          VSL: '0',
          MLN: '0',
          '1ST': '0',
          NMR: '0',
          SNGLS: '0',
          ICN: '0',
          MKR: '100',
          BAT: '0',
          'W-GNT': '0',
          PLU: '0',
          SAI: '330000000000000000',
          REP: '0'
        }
      }
    }
  });
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
