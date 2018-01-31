/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import Immutable from 'immutable';

import {
  SetTokenAllowanceTrustWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './SetTokenAllowanceTrust';
import { shallow } from 'enzyme';
import { TOKEN_WRAPPED_ETH } from '../constants';

describe('(Container) SetTokenAllowanceTrust', () => {
  const state = Immutable.fromJS({
    platform: {
      contractsLoaded: false,
    },
    balances: {
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
  });
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
