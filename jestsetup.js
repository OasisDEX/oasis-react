/* eslint-disable no-undef */
import { configure } from 'enzyme';
import {Map} from 'immutable';
import Adapter from 'enzyme-adapter-react-16';

// jest.mock('./src/bootstrap/contracts');
import  contractBootstrap from './src/bootstrap/contracts';

configure({ adapter: new Adapter() });
jest.mock('react-css-modules', () => Component => Component);



global.storeMock = {
  contracts: {},
  weth: {},
  form: {
    tokenTransfer: {
      registeredFields: {
        recipient: {
          name: 'recipient',
          type: 'Field',
          count: 1
        },
        tokenAmount: {
          name: 'tokenAmount',
          type: 'Field',
          count: 1
        },
        token: {
          name: 'token',
          type: 'Field',
          count: 1
        }
      },
      values: {
        recipient: '0x0000000000000000000000000000000000000001',
        tokenAmount: '1',
        token: 'W-ETH'
      },
      fields: {
        recipient: {
          visited: true,
          touched: true
        },
        tokenAmount: {
          visited: true,
          touched: true
        }
      },
      anyTouched: true
    },
    takeOffer: {
      values: {
        price: '111',
        volume: '0.0001',
        total: '0.0111'
      },
      initial: {
        price: '111',
        volume: '1',
        total: '111'
      },
      registeredFields: {
        price: {
          name: 'price',
          type: 'Field',
          count: 1
        },
        volume: {
          name: 'volume',
          type: 'Field',
          count: 1
        },
        total: {
          name: 'total',
          type: 'Field',
          count: 1
        }
      },
      fields: {
        volume: {
          visited: true,
          touched: true
        }
      },
      anyTouched: true
    },
    makeBuyOffer: {
      syncErrors: {},
      registeredFields: {
        price: {
          name: 'price',
          type: 'Field',
          count: 1
        },
        volume: {
          name: 'volume',
          type: 'Field',
          count: 1
        },
        total: {
          name: 'total',
          type: 'Field',
          count: 1
        }
      },
      values: {
        price: '1',
        volume: '1',
        total: '1'
      },
      initial: {
        price: '1',
        volume: '1',
        total: '1'
      }
    },
    makeSellOffer: {
      syncErrors: {},
      registeredFields: {
        price: {
          name: 'price',
          type: 'Field',
          count: 1
        },
        volume: {
          name: 'volume',
          type: 'Field',
          count: 1
        },
        total: {
          name: 'total',
          type: 'Field',
          count: 1
        }
      },
      values: {
        price: '1',
        volume: '1',
        total: '1'
      },
      initial: {
        price: '1',
        volume: '1',
        total: '1'
      }
    },
  },
  accounts: {
    defaultAccount: '0x0000000000000000000000000000000000000000',
    accounts: [
      '0x0000000000000000000000000000000000000000'
    ],
    lastAccountSwitchAt: 1522860054.016
  },
  wrapUnwrapHistory: {
    historyLoadingStatus: null,
    wrapUnwrapHistory: []
  },
  transfers: {
    txSubjectId: null
  },
  transferHistory: {
    tokensLoadingStatus: {
      MKR: {
        status: 'TRANSFER_HISTORY/LOAD_STATUS_PENDING'
      }
    },
    transferHistory: []
  },
  router: {
    location: {
      pathname: '/trade/MKR/DAI',
      search: '',
      hash: '',
      key: 'fr2gji'
    }
  },
  offerMakes: {
    makeBuyOffer: {
      type: 'OFFER_MAKES/MAKE_BUY_OFFER',
      activeOfferMake: {
        offerData: {
          payToken: null,
          buyToken: null
        },
        buyToken: 'MKR',
        sellToken: 'DAI',
        baseToken: 'MKR',
        quoteToken: 'DAI',
        sellTokenAddress: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2',
        buyTokenAddress: '0xaaf64bfcc32d0f15873a02163e7e500671a4ffcd'
      },
      isOfferMakeModalOpen: false,
      activeOfferMakeOfferDraftId: null,
      transactionGasCostEstimate: null,
      txSubjectId: null,
      drafts: []
    },
    makeSellOffer: {
      type: 'OFFER_MAKES/MAKE_SELL_OFFER',
      activeOfferMake: {
        offerData: {
          payToken: null,
          buyToken: null
        },
        buyToken: 'DAI',
        sellToken: 'MKR',
        baseToken: 'MKR',
        quoteToken: 'DAI',
        sellTokenAddress: '0xaaf64bfcc32d0f15873a02163e7e500671a4ffcd',
        buyTokenAddress: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2'
      },
      isOfferMakeModalOpen: false,
      activeOfferMakeOfferDraftId: null,
      transactionGasCostEstimate: null,
      txSubjectId: null,
      drafts: []
    },
    activeOfferMakeType: "OFFER_MAKES/MAKE_BUY_OFFER"
  },
  wrapUnwrap: {
    wrapperTokenPairs: [
      {
        unwrapped: 'ETH',
        wrapper: 'W-ETH'
      },
      {
        unwrapped: 'GNT',
        wrapper: 'W-GNT'
      }
    ],
    activeUnwrappedToken: 'GNT',
    loadedBrokerContracts: [],
    brokerAddresses: {
      GNT: '0x0000000000000000000000000000000000000001'
    },
    activeTokenWrapStatus: null,
    activeTokenUnwrapStatus: null
  },
  timers: {
    timestamp: 1522866862,
    timeoutId: 13
  },
  network: {
    outOfSync: true,
    isConnecting: false,
    activeNetworkId: '42',
    networks: [
      {
        id: 100,
        name: 'private',
        startingBlock: null,
        avgBlocksPerDay: null
      },
      {
        id: 1,
        name: 'mainnet',
        startingBlock: null,
        avgBlocksPerDay: 5760
      },
      {
        id: 42,
        name: 'kovan',
        startingBlock: null,
        avgBlocksPerDay: 21600
      },
      {
        id: 3,
        name: 'Ropsten',
        startingBlock: null,
        avgBlocksPerDay: null
      }
    ],
    tokenAddresses: {
      DGD: '0xbb7697d091a2b9428053e2d42d088fcd2a6a0aaf',
      GUP: '0xa786d73316e43c3361145241755566e72424274c',
      'W-ETH': '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
      RHOC: '0x7352c20e00d3c89037a8959699741c341771ed59',
      DAI: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2',
      GNT: '0xece9fa304cc965b00afc186f5d0281a00d3dbbfd',
      TIME: '0xd944954588061c969fbd828d1f00c297c3511dbd',
      VSL: '0x2e65483308968f5210167a23bdb46ec94752fe39',
      MLN: '0xc3ce96164012ed51c9b1e34a9323fdc38c96ad8a',
      '1ST': '0x846f258ac72f8a60920d9b613ce9e91f8a7a7b54',
      NMR: '0x13ec2f6ab4be5a55800193e7b22e83042405bb64',
      SNGLS: '0xf7d57c676ac2bc4997ca5d4d34adc0d072213d29',
      'OW-ETH': '0x53eccc9246c1e537d79199d0c7231e425a40f896',
      ICN: '0x8a55df5de91eceb816bd9263d2e5f35fd516d4d0',
      MKR: '0xaaf64bfcc32d0f15873a02163e7e500671a4ffcd',
      BAT: '0x485bd6f93f3cd63d5da117c8205173b542da8e7e',
      'W-GNT': '0xbd1ceb35769eb44b641c8e257005817183fc2817',
      PLU: '0x00a0fcaa32b47c4ab4a8fdda6d108e5c1ffd8e4f',
      SAI: '0x228bf3d5be3ee4b80718b89b68069b023c32131e',
      REP: '0x99e846cfe0321260e51963a2114bc4008d092e24'
    },
    latestEthereumPrice: {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      rank: '2',
      price_usd: '377.388',
      price_btc: '0.0557221',
      '24h_volume_usd': '1329870000.0',
      market_cap_usd: '37215997787.0',
      available_supply: '98614682.0',
      total_supply: '98614682.0',
      max_supply: null,
      percent_change_1h: '-0.99',
      percent_change_24h: '-8.14',
      percent_change_7d: '-16.34',
      last_updated: '1522866553'
    },
    latestBlock: {},
    latestBlockNumber: 6716998,
    status: 'NETWORK/ONLINE',
    activeNetworkName: 'kovan',
    sync: {
      isPending: false,
      ts: null
    }
  },
  widgets: {
    OasisMarketWidget: {
      isExpanded: false
    }
  },
  userTrades: {
    volumes: {},
    marketHistory: [],
    initialMarketHistoryLoaded: true,
    loadingTradeHistory: false,
    volumesLoaded: false,
    loadingUserMarketHistory: false,
    tradeHistoryStartingBlockTimestamp: null,
    latestEventsBlocks: {
      LogTake: null,
      LogMake: null,
      LogTrade: null
    },
    trades: []
  },
  trades: {
    volumes: {
      'W-ETH/DAI': {
        volume: 0,
        latestPrice: null
      },
      'TIME/W-ETH': {
        volume: 0,
        latestPrice: null
      },
      'VSL/W-ETH': {
        volume: 0,
        latestPrice: null
      },
      'MLN/W-ETH': {
        volume: 0,
        latestPrice: null
      },
      '1ST/W-ETH': {
        volume: 0,
        latestPrice: null
      },
      'NMR/W-ETH': {
        volume: 0,
        latestPrice: null
      },
      'SNGLS/W-ETH': {
        volume: 0,
        latestPrice: null
      },
      'ICN/W-ETH': {
        volume: 0,
        latestPrice: null
      },
      'MKR/W-ETH': {
        volume: 0,
        latestPrice: null
      },
      'BAT/W-ETH': {
        volume: 0,
        latestPrice: null
      },
      'W-GNT/W-ETH': {
        volume: 0,
        latestPrice: null
      },
      'PLU/W-ETH': {
        volume: 0,
        latestPrice: null
      },
      'MKR/DAI': {
        volume: 0,
        latestPrice: null
      },
      'REP/W-ETH': {
        volume: 0,
        latestPrice: null
      },
      'DGD/W-ETH': {
        volume: 0,
        latestPrice: null
      },
      'GUP/W-ETH': {
        volume: 0,
        latestPrice: null
      },
      'SAI/DAI': {
        volume: 0,
        latestPrice: null
      },
      'RHOC/W-ETH': {
        volume: 0,
        latestPrice: null
      }
    },
    marketHistory: [],
    initialMarketHistoryLoaded: true,
    loadingTradeHistory: false,
    volumesLoaded: false,
    tradeHistoryStartingBlockTimestamp: 1522076304,
    latestEventsBlocks: {
      LogTake: null,
      LogMake: null,
      LogTrade: null
    },
    trades: []
  },
  offerTakes: {
    transactionGasCostEstimatePending: null,
        checkingIfOfferActive: false,
        transactionGasCostEstimate: null,
        activeOfferTakeType: 'OFFER_TAKES/TAKE_SELL_OFFER',
        minOrderLimitInWei: '100000000000000000',
        isOfferActive: true,
        transactionGasCostEstimateError: null,
        activeOfferTakeOfferId: '12',
        activeOfferTake: {
      offerData: {
        buyHowMuch_filter: 1.951718560884e+21,
            buyWhichToken: 'W-ETH',
            ask_price: '2',
            sellWhichTokenAddress: '0xaaf64bfcc32d0f15873a02163e7e500671a4ffcd',
            bid_price: '0.5',
            sellHowMuch: '975859280442000000000',
            sellHowMuch_filter: 975859280442000000000,
            sellWhichToken: 'MKR',
            buyWhichTokenAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
            owner: '0xdb33dfd3d61308c33c63209845dad3e6bfb2c674',
            bid_price_sort: 0.5,
            buyHowMuch: '1.951718560884e+21',
            ask_price_sort: 2,
            id: '12'
      },
      buyToken: 'MKR',
          sellToken: 'W-ETH',
          baseToken: 'MKR',
          quoteToken: 'W-ETH'
    },
    isOfferTakeModalOpen: true
  },
  tokenEvents: {},
  platform: {
    defaultPeriod: 'TIME_SPAN/WEEK',
    sids: [],
    defaultUnit: 'wei',
    contractsLoaded: true,
    activePeriod: 'TIME_SPAN/WEEK',
    providerType: 'MetaMask/v4.5.1',
    errors: [],
    web3Initialized: true,
    marketInitialized: true,
    defaultTradingPair: {
      baseToken: 'MKR',
      quoteToken: 'W-ETH'
    },
    metamaskLocked: false,
    lastNetworkSwitchAt: 1522860054274
  },
  history: {
    tokensLoadingStatus: {},
    transferHistory: []
  },
  transactions: {
    txList: [
      {
        txHash: '0x110b48acd19927bae9f4f492efd60953e4e173000885cb5df43761b7c8a7e711',
        txReceipt: {},
        txType: 'TRANSACTIONS/GROUP__OFFERS/OFFER_TAKE',
        txStatus: 'TX/STATUS_CONFIRMED',
        txStats: {
          txDispatchedTimestamp: 1525383864197,
          txStartBlockNumber: 7116380,
          txStartTimestamp: 1525383907883,
          txEndTimestamp: 1525383921570,
          txEndBlockNumber: 7116384,
          txTotalTimeSec: null
        }
      }
    ],
    defaultGasLimit: '10000000',
    activeGasLimit: '10000000',
    defaultGasPrice: '1000000',
    activeGasPrice: '1000000',
    currentGasPriceInWei: '30000000000',
    txNonce: 2
  },
  transactionWatchers: {
    watchers: []
  },
  wgnt: {},
  session: {
    initialized: true,
    session: {
      loadingCounter: 0,
      outOfSync: false,
      balanceLoaded: false,
      orderBookLimit: 0,
      loadingIndividualTradeHistory: false,
      latestBlock: 0,
      watchedEvents: false,
      syncing: false,
      loadingProgress: 0,
      loadingTradeHistory: true,
      network: false,
      loadingBuyOrders: true,
      loadingSellOrders: true,
      lastTradesLimit: 0,
      AVGBlocksPerDay: null,
      loading: false,
      allowanceLoaded: false,
      limitsLoaded: false,
      isConnected: false
    },
    persist: {
      messages: {
        MSGTYPE_WARNING: {},
        MSGTYPE_INFO: {
          dismissed: false
        }
      }
    }
  },
  balances: {
    accounts: [],
    loadingAllowances: null,
    loadingBalances: null,
    address: null,
    ethBalance: '4995357305000000000',
    tokenBalances: {
      DGD: '0',
      GUP: '0',
      'W-ETH': '0',
      RHOC: '0',
      DAI: '10000000000000000',
      GNT: '0',
      TIME: '0',
      VSL: '0',
      MLN: '0',
      '1ST': '0',
      NMR: '0',
      SNGLS: '0',
      ICN: '0',
      MKR: '0',
      BAT: '0',
      'W-GNT': '0',
      PLU: '0',
      SAI: '0',
      REP: '0'
    },
    tokenAllowances: {}
  },

  offers: {
    activeTradingPairBestOfferId: {
      bestBuyOfferId: '377',
      bestSellOfferId: '7'
    },
    offers: {
      'Map { "baseToken": "BAT", "quoteToken": "W-ETH" }': {
        buyOfferCount: null,
        sellOfferCount: null,
        buyOffers: [],
        sellOffers: [],
        initialSyncStatus: 'STATUS_PRISTINE',
        initialSyncMeta: {
          syncStartBlockNumber: null,
          syncEndBlockNumber: null,
          syncTimestamps: {
            syncStartTimestamp: null,
            syncEndTimestamp: null
          }
        },
      },
      'Map { "baseToken": "1ST", "quoteToken": "W-ETH" }': {
        buyOfferCount: null,
        sellOfferCount: null,
        buyOffers: [],
        sellOffers: [],
        initialSyncStatus: 'STATUS_PRISTINE',
        initialSyncMeta: {
          syncStartBlockNumber: null,
          syncEndBlockNumber: null,
          syncTimestamps: {
            syncStartTimestamp: null,
            syncEndTimestamp: null
          }
        },
      },
      'Map { "baseToken": "MLN", "quoteToken": "W-ETH" }': {
        buyOfferCount: null,
        sellOfferCount: null,
        buyOffers: [],
        sellOffers: [],
        initialSyncStatus: 'STATUS_PRISTINE',
        initialSyncMeta: {
          syncStartBlockNumber: null,
          syncEndBlockNumber: null,
          syncTimestamps: {
            syncStartTimestamp: null,
            syncEndTimestamp: null
          }
        },
      },
      'Map { "baseToken": "GUP", "quoteToken": "W-ETH" }': {
        buyOfferCount: null,
        sellOfferCount: null,
        buyOffers: [],
        sellOffers: [],
        initialSyncStatus: 'STATUS_PRISTINE'
      },
      'Map { "baseToken": "SAI", "quoteToken": "DAI" }': {
        buyOfferCount: null,
        sellOfferCount: null,
        buyOffers: [],
        sellOffers: [],
        initialSyncStatus: 'STATUS_PRISTINE',
        initialSyncMeta: {
          syncStartBlockNumber: null,
          syncEndBlockNumber: null,
          syncTimestamps: {
            syncStartTimestamp: null,
            syncEndTimestamp: null
          }
        },
      },
      'Map { "baseToken": "MKR", "quoteToken": "W-ETH" }': {
        buyOfferCount: null,
        sellOfferCount: null,
        buyOffers: [],
        sellOffers: [],
        initialSyncStatus: 'STATUS_COMPLETED',
        loadingSellOffers: 'OFFERS/SYNC_STATUS_COMPLETED',
        loadingBuyOffers: 'OFFERS/SYNC_STATUS_COMPLETED'
      },
      'Map { "baseToken": "PLU", "quoteToken": "W-ETH" }': {
        buyOfferCount: 1,
        sellOfferCount: 1,
        buyOffers: [
          {
            id: '177',
            owner: '0x63bb1c63a121e4a87f8fb2eaa6160b35e36a4290',
            buyWhichTokenAddress: '0xaaf64bfcc32d0f15873a02163e7e500671a4ffcd',
            buyWhichToken: 'MKR',
            sellWhichTokenAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
            sellWhichToken: 'W-ETH',
            buyHowMuch: '1000000000000000000',
            sellHowMuch: '980000000000000000',
            buyHowMuch_filter: 1000000000000000000,
            sellHowMuch_filter: 980000000000000000,
            ask_price: '1.02040816326530612244',
            bid_price: '0.98',
            ask_price_sort: 1.0204081632653061,
            bid_price_sort: 0.98
          },
        ],
        sellOffers: [
          {
            id: '7',
            owner: '0xdb33dfd3d61308c33c63209845dad3e6bfb2c674',
            buyWhichTokenAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
            buyWhichToken: 'W-ETH',
            sellWhichTokenAddress: '0xaaf64bfcc32d0f15873a02163e7e500671a4ffcd',
            sellWhichToken: 'MKR',
            buyHowMuch: '1.951718560884e+21',
            sellHowMuch: '975859280442000000000',
            buyHowMuch_filter: 1.951718560884e+21,
            sellHowMuch_filter: 975859280442000000000,
            ask_price: '2',
            bid_price: '0.5',
            ask_price_sort: 2,
            bid_price_sort: 0.5
          },
        ],
        initialSyncStatus: 'STATUS_PRISTINE',
        initialSyncMeta: {
          syncStartBlockNumber: null,
          syncEndBlockNumber: null,
          syncTimestamps: {
            syncStartTimestamp: null,
            syncEndTimestamp: null
          }
        },
      },
      'Map { "baseToken": "TIME", "quoteToken": "W-ETH" }': {
        buyOfferCount: null,
        sellOfferCount: null,
        buyOffers: [],
        sellOffers: [],
        initialSyncStatus: 'STATUS_PRISTINE',
        initialSyncMeta: {
          syncStartBlockNumber: null,
          syncEndBlockNumber: null,
          syncTimestamps: {
            syncStartTimestamp: null,
            syncEndTimestamp: null
          }
        },
      },
      'Map { "baseToken": "DGD", "quoteToken": "W-ETH" }': {
        buyOfferCount: null,
        sellOfferCount: null,
        buyOffers: [],
        sellOffers: [],
        initialSyncStatus: 'STATUS_PRISTINE',
        initialSyncMeta: {
          syncStartBlockNumber: null,
          syncEndBlockNumber: null,
          syncTimestamps: {
            syncStartTimestamp: null,
            syncEndTimestamp: null
          }
        },
      },
       [Map({ baseToken: "MKR", quoteToken: "DAI" })]: {
        buyOfferCount: 1,
        sellOfferCount: 1,
        buyOffers: [
          {
            id: '56',
            owner: '0x01349510117dc9081937794939552463f5616dfb',
            buyWhichTokenAddress: '0xaaf64bfcc32d0f15873a02163e7e500671a4ffcd',
            buyWhichToken: 'MKR',
            sellWhichTokenAddress: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2',
            sellWhichToken: 'DAI',
            buyHowMuch: '54490050000000000',
            sellHowMuch: '10898010000000000000',
            buyHowMuch_filter: 54490050000000000,
            sellHowMuch_filter: 10898010000000000000,
            ask_price: '0.005',
            bid_price: '200',
            ask_price_sort: 0.005,
            bid_price_sort: 200
          }
        ],
        sellOffers: [
          {
            id: '12',
            owner: '0xdb33dfd3d61308c33c63209845dad3e6bfb2c674',
            buyWhichTokenAddress: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2',
            buyWhichToken: 'DAI',
            sellWhichTokenAddress: '0xaaf64bfcc32d0f15873a02163e7e500671a4ffcd',
            sellWhichToken: 'MKR',
            buyHowMuch: '2.0255250000000000000595e+23',
            sellHowMuch: '98806097560975609759',
            buyHowMuch_filter: 2.025525e+23,
            sellHowMuch_filter: 98806097560975600000,
            ask_price: '2050',
            bid_price: '0.00048780487804878048',
            ask_price_sort: 2050,
            bid_price_sort: 0.00048780487804878
          }
        ],
        initialSyncStatus: 'STATUS_COMPLETED',
         initialSyncMeta: {
           syncStartBlockNumber: null,
           syncEndBlockNumber: null,
           syncTimestamps: {
             syncStartTimestamp: null,
             syncEndTimestamp: null
           }
         },
        loadingBuyOffers: 'OFFERS/SYNC_STATUS_COMPLETED',
        loadingSellOffers: 'OFFERS/SYNC_STATUS_COMPLETED'
      },
      'Map { "baseToken": "SNGLS", "quoteToken": "W-ETH" }': {
        buyOfferCount: null,
        sellOfferCount: null,
        buyOffers: [],
        sellOffers: [],
        initialSyncStatus: 'STATUS_PRISTINE'
      },
      'Map { "baseToken": "RHOC", "quoteToken": "W-ETH" }': {
        buyOfferCount: null,
        sellOfferCount: null,
        buyOffers: [],
        sellOffers: [],
        initialSyncStatus: 'STATUS_PRISTINE'
      },
      'Map { "baseToken": "VSL", "quoteToken": "W-ETH" }': {
        buyOfferCount: null,
        sellOfferCount: null,
        buyOffers: [],
        sellOffers: [],
        initialSyncStatus: 'STATUS_PRISTINE'
      },
      'Map { "baseToken": "W-ETH", "quoteToken": "DAI" }': {
        buyOfferCount: 1,
        sellOfferCount: 2,
        buyOffers: [
          {
            id: '145',
            owner: '0xbde410f5bb154479f422655c253d10f0a22c29bf',
            buyWhichTokenAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
            buyWhichToken: 'W-ETH',
            sellWhichTokenAddress: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2',
            sellWhichToken: 'DAI',
            buyHowMuch: '23684737941587301586',
            sellHowMuch: '236847379415873015860',
            buyHowMuch_filter: 23684737941587300000,
            sellHowMuch_filter: 236847379415873030000,
            ask_price: '0.1',
            bid_price: '10',
            ask_price_sort: 0.1,
            bid_price_sort: 10
          }
        ],
        sellOffers: [
          {
            id: '175',
            owner: '0xf0e90739550992fcf37fe4dcb0b47708ca0ff609',
            buyWhichTokenAddress: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2',
            buyWhichToken: 'DAI',
            sellWhichTokenAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
            sellWhichToken: 'W-ETH',
            buyHowMuch: '169570858898474581284',
            sellHowMuch: '428209239642612579',
            buyHowMuch_filter: 169570858898474570000,
            sellHowMuch_filter: 428209239642612600,
            ask_price: '396',
            bid_price: '0.00252525252525252525',
            ask_price_sort: 396,
            bid_price_sort: 0.002525252525252525
          },
          {
            id: '175',
            owner: '0xf0e90739550992fcf37fe4dcb0b47708ca0ff609',
            buyWhichTokenAddress: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2',
            buyWhichToken: 'DAI',
            sellWhichTokenAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
            sellWhichToken: 'W-ETH',
            buyHowMuch: '169580858898474581184',
            sellHowMuch: '428234492167865104',
            buyHowMuch_filter: 169580858898474570000,
            sellHowMuch_filter: 428234492167865100,
            ask_price: '396',
            bid_price: '0.00252525252525252525',
            ask_price_sort: 396,
            bid_price_sort: 0.002525252525252525
          },
          {
            id: '175',
            owner: '0xf0e90739550992fcf37fe4dcb0b47708ca0ff609',
            buyWhichTokenAddress: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2',
            buyWhichToken: 'DAI',
            sellWhichTokenAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
            sellWhichToken: 'W-ETH',
            buyHowMuch: '169580858898474581184',
            sellHowMuch: '428234492167865104',
            buyHowMuch_filter: 169580858898474570000,
            sellHowMuch_filter: 428234492167865100,
            ask_price: '396',
            bid_price: '0.00252525252525252525',
            ask_price_sort: 396,
            bid_price_sort: 0.002525252525252525
          },
          {
            id: '175',
            owner: '0xf0e90739550992fcf37fe4dcb0b47708ca0ff609',
            buyWhichTokenAddress: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2',
            buyWhichToken: 'DAI',
            sellWhichTokenAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
            sellWhichToken: 'W-ETH',
            buyHowMuch: '169570858898474581284',
            sellHowMuch: '428209239642612579',
            buyHowMuch_filter: 169570858898474570000,
            sellHowMuch_filter: 428209239642612600,
            ask_price: '396',
            bid_price: '0.00252525252525252525',
            ask_price_sort: 396,
            bid_price_sort: 0.002525252525252525
          },
          {
            id: '175',
            owner: '0xf0e90739550992fcf37fe4dcb0b47708ca0ff609',
            buyWhichTokenAddress: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2',
            buyWhichToken: 'DAI',
            sellWhichTokenAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
            sellWhichToken: 'W-ETH',
            buyHowMuch: '169570858898474581284',
            sellHowMuch: '428209239642612579',
            buyHowMuch_filter: 169570858898474570000,
            sellHowMuch_filter: 428209239642612600,
            ask_price: '396',
            bid_price: '0.00252525252525252525',
            ask_price_sort: 396,
            bid_price_sort: 0.002525252525252525
          },
          {
            id: '9',
            owner: '0xdb33dfd3d61308c33c63209845dad3e6bfb2c674',
            buyWhichTokenAddress: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2',
            buyWhichToken: 'DAI',
            sellWhichTokenAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
            sellWhichToken: 'W-ETH',
            buyHowMuch: '720399569378947455000',
            sellHowMuch: '480266379585964970',
            buyHowMuch_filter: 720399569378947500000,
            sellHowMuch_filter: 480266379585965000,
            ask_price: '1500',
            bid_price: '0.00066666666666666666',
            ask_price_sort: 1500,
            bid_price_sort: 0.000666666666666667
          }
        ],
        initialSyncStatus: 'STATUS_COMPLETED',
        initialSyncMeta: {
          syncStartBlockNumber: null,
          syncEndBlockNumber: null,
          syncTimestamps: {
            syncStartTimestamp: null,
            syncEndTimestamp: null
          }
        },
        loadingBuyOffers: 'OFFERS/SYNC_STATUS_COMPLETED',
        loadingSellOffers: 'OFFERS/SYNC_STATUS_COMPLETED'
      },
      'Map { "baseToken": "ICN", "quoteToken": "W-ETH" }': {
        buyOfferCount: null,
        sellOfferCount: null,
        buyOffers: [],
        sellOffers: [],
        initialSyncStatus: 'STATUS_PRISTINE',
        initialSyncMeta: {
          syncStartBlockNumber: null,
          syncEndBlockNumber: null,
          syncTimestamps: {
            syncStartTimestamp: null,
            syncEndTimestamp: null
          }
        },
      },
      'Map { "baseToken": "W-GNT", "quoteToken": "W-ETH" }': {
        buyOfferCount: null,
        sellOfferCount: null,
        buyOffers: [],
        sellOffers: [],
        initialSyncStatus: 'STATUS_PRISTINE',
        initialSyncMeta: {
          syncStartBlockNumber: null,
          syncEndBlockNumber: null,
          syncTimestamps: {
            syncStartTimestamp: null,
            syncEndTimestamp: null
          }
        },
      },
      'Map { "baseToken": "NMR", "quoteToken": "W-ETH" }': {
        buyOfferCount: null,
        sellOfferCount: null,
        buyOffers: [],
        sellOffers: [],
        initialSyncStatus: 'STATUS_PRISTINE',
        initialSyncMeta: {
          syncStartBlockNumber: null,
          syncEndBlockNumber: null,
          syncTimestamps: {
            syncStartTimestamp: null,
            syncEndTimestamp: null
          }
        },
      },
      'Map { "baseToken": "REP", "quoteToken": "W-ETH" }': {
        buyOfferCount: null,
        sellOfferCount: null,
        buyOffers: [],
        sellOffers: [],
        initialSyncStatus: 'STATUS_PRISTINE',
        initialSyncMeta: {
          syncStartBlockNumber: null,
          syncEndBlockNumber: null,
          syncTimestamps: {
            syncStartTimestamp: null,
            syncEndTimestamp: null
          }
        },
      }
    },
    syncingOffers: [],
    pendingOffers: [],
    initialSyncStatus: {},
    loadingSellOffers: {},
    loadingBuyOffers: {}
  },
  markets: {
    closeTime: '1546543143',
    isMarketOpen: true,
    isOrderMatchingEnabled: true,
    isBuyEnabled: true,
    activeMarketOriginBlock: {
      number: '5216718'
    },
    activeMarketAddress: '0x8cf1cab422a0b6b554077a361f8419cdf122a9f9',
    marketType: 'MARKET_TYPE_MATCHING_MARKET'
  },
  limits: {
    limitsLoaded: true,
    tokens: {
      DGD: {
        minSell: "1000000000000"
      },
      GUP: {
        minSell: "1000000000000"
      },
      'W-ETH': {
        minSell: "1000000000000"
      },
      RHOC: {
        minSell: "1000000000000"
      },
      DAI: {
        minSell: "1000000000000"
      },
      GNT: {
        minSell: "1000000000000"
      },
      TIME: {
        minSell: "1000000000000"
      },
      VSL: {
        minSell: "1000000000000"
      },
      MLN: {
        minSell: "1000000000000"
      },
      '1ST': {
        minSell: "1000000000000"
      },
      NMR: {
        minSell: "1000000000000"
      },
      SNGLS: {
        minSell: "1000000000000"
      },
      'OW-ETH': {
        minSell: "1000000000000"
      },
      ICN: {
        minSell: "1000000000000"
      },
      MKR: {
        minSell: "1000000000000"
      },
      BAT: {
        minSell: "1000000000000"
      },
      'W-GNT': {
        minSell: "1000000000000"
      },
      PLU: {
        minSell: "1000000000000"
      },
      SAI: {
        minSell: "1000000000000"
      },
      REP: {
        minSell: "1000000000000"
      }
    }
  },
  tokens: {
    defaultBaseToken: 'MKR',
    baseTokens: [
      'W-GNT',
      'DAI',
      'DGD',
      'REP',
      'ICN',
      '1ST',
      'SNGLS',
      'VSL',
      'PLU',
      'MLN',
      'RHOC',
      'TIME',
      'GUP',
      'BAT',
      'NMR'
    ],
    activeTradingPair: {
      baseToken: 'MKR',
      quoteToken: 'DAI'
    },
    quoteTokens: [
      'W-ETH'
    ],
    tradingPairs: [
      {
        base: 'MKR',
        quote: 'W-ETH',
        priority: 10,
        isDefault: true
      },
      {
        base: 'W-ETH',
        quote: 'DAI',
        priority: 9,
        isDefault: true
      },
      {
        base: 'MKR',
        quote: 'DAI',
        priority: 8,
        isDefault: true
      },
      {
        base: 'SAI',
        quote: 'DAI',
        priority: 6,
        isDefault: true
      },
      {
        base: 'W-GNT',
        quote: 'W-ETH',
        priority: 0,
        isDefault: false
      },
      {
        base: 'DGD',
        quote: 'W-ETH',
        priority: 0,
        isDefault: false
      },
      {
        base: 'REP',
        quote: 'W-ETH',
        priority: 0,
        isDefault: false
      },
      {
        base: 'ICN',
        quote: 'W-ETH',
        priority: 0,
        isDefault: false
      },
      {
        base: '1ST',
        quote: 'W-ETH',
        priority: 0,
        isDefault: false
      },
      {
        base: 'SNGLS',
        quote: 'W-ETH',
        priority: 0,
        isDefault: false
      },
      {
        base: 'VSL',
        quote: 'W-ETH',
        priority: 0,
        isDefault: false
      },
      {
        base: 'PLU',
        quote: 'W-ETH',
        priority: 0,
        isDefault: false
      },
      {
        base: 'MLN',
        quote: 'W-ETH',
        priority: 0,
        isDefault: false
      },
      {
        base: 'RHOC',
        quote: 'W-ETH',
        priority: 0,
        isDefault: false
      },
      {
        base: 'TIME',
        quote: 'W-ETH',
        priority: 0,
        isDefault: false
      },
      {
        base: 'GUP',
        quote: 'W-ETH',
        priority: 0,
        isDefault: false
      },
      {
        base: 'BAT',
        quote: 'W-ETH',
        priority: 0,
        isDefault: false
      },
      {
        base: 'NMR',
        quote: 'W-ETH',
        priority: 0,
        isDefault: false
      }
    ],
    defaultTradingPair: {
      baseToken: 'MKR',
      quoteToken: 'W-ETH'
    },
    allTokens: [
      'W-ETH',
      'MKR',
      'DGD',
      'GNT',
      'W-GNT',
      'REP',
      'ICN',
      '1ST',
      'SNGLS',
      'VSL',
      'PLU',
      'MLN',
      'RHOC',
      'TIME',
      'GUP',
      'BAT',
      'NMR',
      'SAI',
      'DAI'
    ],
    precision: 18,
    defaultQuoteToken: 'W-ETH',
    tokenSpecs: {
      DGD: {
        precision: 9,
        format: '0,0.00[0000000]'
      },
      GUP: {
        precision: 3,
        format: '0,0.00[0]'
      },
      'W-ETH': {
        precision: 18,
        format: '0,0.00[0000000000000000]'
      },
      RHOC: {
        precision: 8,
        format: '0,0.00[000000]'
      },
      DAI: {
        precision: 18,
        format: '0,0.00[0000000000000000]'
      },
      GNT: {
        precision: 18,
        format: '0,0.00[0000000000000000]'
      },
      TIME: {
        precision: 8,
        format: '0,0.00[000000]'
      },
      VSL: {
        precision: 18,
        format: '0,0.00[0000000000000000]'
      },
      MLN: {
        precision: 18,
        format: '0,0.00[0000000000000000]'
      },
      '1ST': {
        precision: 18,
        format: '0,0.00[0000000000000000]'
      },
      NMR: {
        precision: 18,
        format: '0,0.00[0000000000000000]'
      },
      SNGLS: {
        precision: 0,
        format: '0,0'
      },
      'OW-ETH': {
        precision: 18,
        format: '0,0.00[0000000000000000]'
      },
      ICN: {
        precision: 18,
        format: '0,0.00[0000000000000000]'
      },
      MKR: {
        precision: 18,
        format: '0,0.00[0000000000000000]'
      },
      BAT: {
        precision: 18,
        format: '0,0.00[0000000000000000]'
      },
      'W-GNT': {
        precision: 18,
        format: '0,0.00[0000000000000000]'
      },
      PLU: {
        precision: 18,
        format: '0,0.00[0000000000000000]'
      },
      SAI: {
        precision: 18,
        format: '0,0.00[0000000000000000]'
      },
      REP: {
        precision: 18,
        format: '0,0.00[0000000000000000]'
      }
    }
  },
  tokenSelectors: {
    tokenTransfer: "MKR"
  }
};

contractBootstrap.init("kovan");
