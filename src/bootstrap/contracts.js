import loadContact from "../utils/contracts/loadContract";
import createContractInstance from "../utils/contracts/createContractInstance";

const config = require("./../configs");

const erc20Abi = require("./../contracts/abi/standard-token/erc20.json");
const WEthAbi = require("./../contracts/abi/standard-token/ds-eth-token.json");
const TokenWrapperAbi = require("./../contracts/abi/token-wrapper/token-wrapper.json");
const MatchingMarketAbi = require("./../contracts/abi/maker-otc/matching-market");
const DepositBrokerAbi = require("./../contracts/abi/token-wrapper/deposit-broker");
import { fromJS } from "immutable";
import web3 from "./web3";
import { TOKEN_WRAPPED_GNT } from "../constants";

let brokers = fromJS({});
let contracts = {};

const init = networkName => {
  const tokencontractsDeploymentAdressessList = config["tokens"][networkName];
  const marketDeploymentAddress = config["market"][networkName]["address"];

  const WETH = loadContact(
    WEthAbi.interface,
    tokencontractsDeploymentAdressessList["W-ETH"]
  );
  const DAI = loadContact(
    erc20Abi.interface,
    tokencontractsDeploymentAdressessList["DAI"]
  );
  const SAI = loadContact(
    erc20Abi.interface,
    tokencontractsDeploymentAdressessList["SAI"]
  );
  const MKR = loadContact(
    erc20Abi.interface,
    tokencontractsDeploymentAdressessList["MKR"]
  );
  const DGD = loadContact(
    erc20Abi.interface,
    tokencontractsDeploymentAdressessList["DGD"]
  );
  const GNT = loadContact(
    erc20Abi.interface,
    tokencontractsDeploymentAdressessList["GNT"]
  );
  const WGNT = loadContact(
    TokenWrapperAbi.interface,
    tokencontractsDeploymentAdressessList["W-GNT"]
  );
  const REP = loadContact(
    erc20Abi.interface,
    tokencontractsDeploymentAdressessList["REP"]
  );
  const ICN = loadContact(
    erc20Abi.interface,
    tokencontractsDeploymentAdressessList["ICN"]
  );
  const _1ST = loadContact(
    erc20Abi.interface,
    tokencontractsDeploymentAdressessList["1ST"]
  );
  const SNGLS = loadContact(
    erc20Abi.interface,
    tokencontractsDeploymentAdressessList["SNGLS"]
  );
  const VSL = loadContact(
    erc20Abi.interface,
    tokencontractsDeploymentAdressessList["VSL"]
  );
  const PLU = loadContact(
    erc20Abi.interface,
    tokencontractsDeploymentAdressessList["PLU"]
  );
  const MLN = loadContact(
    erc20Abi.interface,
    tokencontractsDeploymentAdressessList["MLN"]
  );
  const RHOC = loadContact(
    erc20Abi.interface,
    tokencontractsDeploymentAdressessList["RHOC"]
  );
  const TIME = loadContact(
    erc20Abi.interface,
    tokencontractsDeploymentAdressessList["TIME"]
  );
  const GUP = loadContact(
    erc20Abi.interface,
    tokencontractsDeploymentAdressessList["GUP"]
  );
  const BAT = loadContact(
    erc20Abi.interface,
    tokencontractsDeploymentAdressessList["BAT"]
  );
  const NMR = loadContact(
    erc20Abi.interface,
    tokencontractsDeploymentAdressessList["NMR"]
  );

  const market = loadContact(
    MatchingMarketAbi.interface,
    marketDeploymentAddress
  );
  const marketNoProxy = loadContact(
    MatchingMarketAbi.interface,
    marketDeploymentAddress,
    true
  );
  const WGNTNoProxy = loadContact(
    TokenWrapperAbi.interface,
    tokencontractsDeploymentAdressessList["W-GNT"],
    true
  );

  const abiList = Object.freeze({
    erc20Abi,
    WEthAbi,
    TokenWrapperAbi,
    DepositBrokerAbi
  });

  contracts = Object.freeze({
    tokens: {
      "W-ETH": WETH,
      "W-GNT": WGNT,
      "1ST": _1ST,
      DAI,
      SAI,
      MKR,
      DGD,
      GNT,
      REP,
      ICN,
      SNGLS,
      VSL,
      PLU,
      MLN,
      RHOC,
      TIME,
      GUP,
      BAT,
      NMR
    },
    market,
    noProxyTokens: {
      [TOKEN_WRAPPED_GNT]: WGNTNoProxy
    },
    marketNoProxy,
    abiList,
    createContractInstance
  });
};

const initDepositBrokerContract = (token, address) => {
  if (!web3.isAddress(address)) {
    throw new Error("This is not Ethereum address!");
  }
  brokers = brokers.set(
    token,
    loadContact(DepositBrokerAbi.interface, address)
  );
  console.log("initDepositBrokerContract", brokers);
  return brokers.get(token);
};

const getTokenContractInstance = tokenName => {
  if (contracts.tokens[tokenName]) {
    return contracts.tokens[tokenName];
  } else {
    throw Error(`Contract for *${tokenName}* token not found!`);
  }
};

const getMarketContractInstance = () => {
  if (contracts.market) {
    return contracts.market;
  } else {
    throw Error(`Contract for *market* not found!`);
  }
};

const getTokenContractsList = () => contracts.tokens;

const getMarketNoProxyContractInstance =  () => contracts.marketNoProxy;
const getTokenNoProxyContractInstance = tokenName =>
  contracts.noProxyTokens[tokenName];

const getDepositBrokerContractInstance = token => {
  if (brokers.has(token)) {
    return brokers.get(token);
  }
};

export {
  getTokenContractInstance,
  getDepositBrokerContractInstance,
  getMarketContractInstance,
  getTokenContractsList,
  getMarketNoProxyContractInstance,
  getTokenNoProxyContractInstance,
  initDepositBrokerContract
};

export default {
  init
};
